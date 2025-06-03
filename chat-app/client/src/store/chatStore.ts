import { create } from 'zustand';
import { messagesApi, groupsApi, usersApi } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface Message {
  _id: string;
  content: string;
  sender: any;
  receiver?: any;
  group?: string;
  isRead: boolean;
  readBy: any[];
  createdAt: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  isOnline: boolean;
  avatar: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  admin: User;
  members: User[];
  avatar: string;
}

interface ChatState {
  users: User[];
  groups: Group[];
  activeChat: { id: string; type: 'user' | 'group' } | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<string, boolean>;
  
  // Users actions
  fetchUsers: () => Promise<void>;
  
  // Groups actions
  fetchGroups: () => Promise<void>;
  createGroup: (name: string, description: string, members: string[]) => Promise<void>;
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  
  // Messages actions
  setActiveChat: (id: string, type: 'user' | 'group') => void;
  fetchMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  
  // Typing indicators
  setTyping: (userId: string, isTyping: boolean) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  users: [],
  groups: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  error: null,
  typingUsers: {},
  
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await usersApi.getAll();
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch users', 
        isLoading: false 
      });
    }
  },
  
  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupsApi.getAll();
      set({ groups: response.data, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch groups', 
        isLoading: false 
      });
    }
  },
  
  createGroup: async (name, description, members) => {
    set({ isLoading: true, error: null });
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const newGroup = {
        name,
        description,
        admin: user._id,
        members: [user._id, ...members]
      };
      
      const response = await groupsApi.create(newGroup);
      set(state => ({ 
        groups: [...state.groups, response.data],
        isLoading: false 
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create group', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  joinGroup: async (groupId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await groupsApi.addMember(groupId, user._id);
      
      // Refresh groups
      get().fetchGroups();
      
      // Join socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('joinRoom', { roomId: groupId });
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to join group'
      });
    }
  },
  
  leaveGroup: async (groupId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await groupsApi.removeMember(groupId, user._id);
      
      // Refresh groups
      get().fetchGroups();
      
      // Leave socket room
      const socket = getSocket();
      if (socket) {
        socket.emit('leaveRoom', { roomId: groupId });
      }
    } catch (error: any) {
      console.error('Error leaving group:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to leave group'
      });
    }
  },
  
  setActiveChat: (id, type) => {
    set({ 
      activeChat: { id, type },
      messages: [] // Clear previous messages
    });
    
    // Fetch messages for the new active chat
    get().fetchMessages();
    
    // Join room if it's a group chat
    if (type === 'group') {
      const socket = getSocket();
      if (socket) {
        socket.emit('joinRoom', { roomId: id });
      }
    }
    
    // Set up real-time event listeners for the active chat
    const socket = getSocket();
    if (socket) {
      // Remove any existing listeners to prevent duplicates
      socket.off('newMessage');
      socket.off('messageRead');
      socket.off('userTyping');
      
      // Set up listeners for real-time updates
      socket.on('newMessage', (message) => {
        const activeChat = get().activeChat;
        if (!activeChat) return;
        
        // Check if the message belongs to the current active chat
        const isForCurrentChat = 
          (activeChat.type === 'user' && 
           ((message.sender._id === activeChat.id) || 
            (message.receiver && message.receiver._id === activeChat.id))) ||
          (activeChat.type === 'group' && message.group === activeChat.id);
        
        if (isForCurrentChat) {
          set((state) => ({
            messages: [...state.messages, message]
          }));
          
          // Mark message as read if it's not from the current user
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (message.sender._id !== user._id) {
            get().markAsRead(message._id);
          }
        }
      });
      
      socket.on('messageRead', (updatedMessage) => {
        set((state) => ({
          messages: state.messages.map((msg) => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        }));
      });
      
      socket.on('userTyping', ({ userId, isTyping }) => {
        get().setTyping(userId, isTyping);
      });
    }
  },
  
  fetchMessages: async () => {
    const { activeChat } = get();
    if (!activeChat) return;
    
    set({ isLoading: true, error: null });
    
    try {
      let response;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (activeChat.type === 'user') {
        response = await messagesApi.getByUsers(user._id, activeChat.id);
      } else {
        response = await messagesApi.getByGroup(activeChat.id);
      }
      
      set({ messages: response.data, isLoading: false });
      
      // Mark unread messages as read
      response.data.forEach((message: Message) => {
        if (message.sender._id !== user._id && !message.isRead) {
          get().markAsRead(message._id);
        }
      });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch messages', 
        isLoading: false 
      });
    }
  },
  
  sendMessage: async (content) => {
    const { activeChat } = get();
    if (!activeChat) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const messageData: any = {
        content,
        sender: user._id,
      };
      
      if (activeChat.type === 'user') {
        messageData.receiver = activeChat.id;
      } else {
        messageData.group = activeChat.id;
      }
      
      // Stop typing indicator
      get().stopTyping();
      
      // Send message through Socket.IO
      const socket = getSocket();
      if (socket) {
        socket.emit('sendMessage', messageData);
      } else {
        // Fallback to REST API if socket is not available
        await messagesApi.create(messageData);
        // Refresh messages
        get().fetchMessages();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to send message'
      });
    }
  },
  
  markAsRead: async (messageId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Send through Socket.IO
      const socket = getSocket();
      if (socket) {
        socket.emit('markAsRead', { messageId, userId: user._id });
      } else {
        // Fallback to REST API
        await messagesApi.markAsRead(messageId, user._id);
      }
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  },
  
  setTyping: (userId, isTyping) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      }
    }));
  },
  
  startTyping: () => {
    const { activeChat } = get();
    if (!activeChat) return;
    
    const socket = getSocket();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (socket) {
      socket.emit('typing', {
        userId: user._id,
        receiverId: activeChat.id,
        isGroup: activeChat.type === 'group',
      });
    }
  },
  
  stopTyping: () => {
    const { activeChat } = get();
    if (!activeChat) return;
    
    const socket = getSocket();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (socket) {
      socket.emit('stopTyping', {
        userId: user._id,
        receiverId: activeChat.id,
        isGroup: activeChat.type === 'group',
      });
    }
  },
}));
