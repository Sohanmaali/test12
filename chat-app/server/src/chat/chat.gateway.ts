import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map to store user socket connections
  private userSocketMap = new Map<string, string>();
  // Map to store users who are currently typing
  private typingUsers = new Map<string, { userId: string, receiverId: string }>();

  constructor(
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    // Store the socket ID for this user
    this.userSocketMap.set(userId, client.id);

    // Update user's online status
    await this.usersService.updateOnlineStatus(userId, true);

    // Notify all connected clients that this user is online
    this.server.emit('userStatus', { userId, isOnline: true });
  }

  async handleDisconnect(client: Socket) {
    // Find the userId that corresponds to this socket
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      // Remove from socket map
      this.userSocketMap.delete(disconnectedUserId);

      // Update user's online status
      await this.usersService.updateOnlineStatus(disconnectedUserId, false);

      // Notify all connected clients that this user is offline
      this.server.emit('userStatus', { userId: disconnectedUserId, isOnline: false });
    }

    // Clear any typing indicators for this user
    this.clearTypingIndicator(client);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    // Create and save the message
    const message = await this.messagesService.create(createMessageDto);
    // Use proper type assertion for the document ID
    const messageId = message._id as unknown as string;
    const populatedMessage = await this.messagesService.findById(messageId);

    // Clear typing indicator when a message is sent
    this.clearTypingIndicator(client);

    if (populatedMessage && populatedMessage.group) {
      // If it's a group message, emit to all members in the group room
      this.server.to(`group-${populatedMessage.group}`).emit('newMessage', populatedMessage);
    } else if (populatedMessage && populatedMessage.receiver) {
      // If it's a private message, emit to the sender and receiver
      // Handle both populated User objects and string/ObjectId references
      const receiverId = typeof populatedMessage.receiver === 'object' && 'toString' in populatedMessage.receiver 
        ? populatedMessage.receiver.toString()
        : String(populatedMessage.receiver);
      const receiverSocketId = this.userSocketMap.get(receiverId);
      
      // Send to the sender
      client.emit('newMessage', populatedMessage);
      
      // Send to the receiver if they're online
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', populatedMessage);
      }
    }

    return populatedMessage;
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(`group-${data.roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.leave(`group-${data.roomId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string, receiverId: string, isGroup: boolean },
  ) {
    // Store typing status
    this.typingUsers.set(client.id, { userId: data.userId, receiverId: data.receiverId });

    if (data.isGroup) {
      // Emit typing event to everyone in the group except the sender
      client.to(`group-${data.receiverId}`).emit('userTyping', {
        userId: data.userId,
        isTyping: true,
      });
    } else {
      // Emit typing event only to the recipient
      const receiverSocketId = this.userSocketMap.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('userTyping', {
          userId: data.userId,
          isTyping: true,
        });
      }
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string, receiverId: string, isGroup: boolean },
  ) {
    // Clear typing status
    this.typingUsers.delete(client.id);

    if (data.isGroup) {
      // Emit stop typing event to everyone in the group except the sender
      client.to(`group-${data.receiverId}`).emit('userTyping', {
        userId: data.userId,
        isTyping: false,
      });
    } else {
      // Emit stop typing event only to the recipient
      const receiverSocketId = this.userSocketMap.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('userTyping', {
          userId: data.userId,
          isTyping: false,
        });
      }
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string, userId: string },
  ) {
    const message = await this.messagesService.markAsRead(data.messageId, data.userId);

    if (message && message.group) {
      // If it's a group message, emit to all members in the group
      this.server.to(`group-${message.group}`).emit('messageRead', message);
    } else if (message && message.receiver && message.sender) {
      // If it's a private message, emit to the sender and receiver
      const senderSocketId = this.userSocketMap.get(message.sender.toString());
      const receiverSocketId = this.userSocketMap.get(message.receiver.toString());
      
      // Emit to both sender and receiver if they're online
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('messageRead', message);
      }
      
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('messageRead', message);
      }
    }

    return message;
  }

  private clearTypingIndicator(client: Socket) {
    const typingData = this.typingUsers.get(client.id);
    if (typingData) {
      const { userId, receiverId } = typingData;
      
      // Check if it's a group chat or direct message
      const isGroup = receiverId.startsWith('group-');
      const actualReceiverId = isGroup ? receiverId.substring(6) : receiverId;
      
      if (isGroup) {
        client.to(`group-${actualReceiverId}`).emit('userTyping', {
          userId,
          isTyping: false,
        });
      } else {
        const receiverSocketId = this.userSocketMap.get(actualReceiverId);
        if (receiverSocketId) {
          this.server.to(receiverSocketId).emit('userTyping', {
            userId,
            isTyping: false,
          });
        }
      }
      
      this.typingUsers.delete(client.id);
    }
  }
}
