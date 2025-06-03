import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    const newMessage = new this.messageModel(createMessageDto);
    return newMessage.save();
  }

  async findAll(): Promise<MessageDocument[]> {
    return this.messageModel
      .find()
      .populate('sender', '-password')
      .populate('receiver', '-password')
      .populate('readBy', '-password')
      .exec();
  }

  async findById(id: string): Promise<MessageDocument | null> {
    return this.messageModel
      .findById(id)
      .populate('sender', '-password')
      .populate('receiver', '-password')
      .populate('readBy', '-password')
      .exec();
  }

  async findByUsers(userId1: string, userId2: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({
        $or: [
          { sender: userId1, receiver: userId2 },
          { sender: userId2, receiver: userId1 },
        ],
      })
      .populate('sender', '-password')
      .populate('receiver', '-password')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findByGroup(groupId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ group: groupId })
      .populate('sender', '-password')
      .populate('readBy', '-password')
      .sort({ createdAt: 1 })
      .exec();
  }

  async markAsRead(messageId: string, userId: string): Promise<MessageDocument | null> {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      {
        isRead: true,
        $addToSet: { readBy: userId },
      },
      { new: true },
    )
    .populate('sender', '-password')
    .populate('receiver', '-password')
    .populate('readBy', '-password')
    .exec();
  }
}
