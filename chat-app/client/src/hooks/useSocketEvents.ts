import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export const useSocketEvents = () => {
  const { setTyping, messages, fetchMessages, fetchUsers, fetchGroups } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    // Listen for new messages
    socket.on('newMessage', (message) => {
      // Refresh messages if the message belongs to the current conversation
      const activeChat = useChatStore.getState().activeChat;
      if (activeChat) {
        if (
          (activeChat.type === 'user' && 
           ((message.sender._id === activeChat.id && message.receiver._id === user._id) || 
            (message.receiver._id === activeChat.id && message.sender._id === user._id))) ||
          (activeChat.type === 'group' && message.group === activeChat.id)
        ) {
          fetchMessages();
          
          // Mark as read if the message is from someone else
          if (message.sender._id !== user._id) {
            const markAsRead = useChatStore.getState().markAsRead;
            markAsRead(message._id);
          }
        }
      }
    });

    // Listen for typing indicators
    socket.on('userTyping', ({ userId, isTyping }) => {
      setTyping(userId, isTyping);
    });

    // Listen for message read status updates
    socket.on('messageRead', () => {
      fetchMessages();
    });

    // Listen for user status changes (online/offline)
    socket.on('userStatus', () => {
      fetchUsers();
    });

    // Listen for group updates
    socket.on('groupUpdate', () => {
      fetchGroups();
    });

    return () => {
      socket.off('newMessage');
      socket.off('userTyping');
      socket.off('messageRead');
      socket.off('userStatus');
      socket.off('groupUpdate');
    };
  }, [user, messages, setTyping, fetchMessages, fetchUsers, fetchGroups]);
};

export default useSocketEvents;
