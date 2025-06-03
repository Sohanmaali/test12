import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { MessageInput } from '@/components/chat/MessageInput';

export const ChatWindow = () => {
  const { user } = useAuthStore();
  const { 
    activeChat, 
    messages, 
    typingUsers, 
    users, 
    groups 
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get chat name and avatar
  const getChatDetails = () => {
    if (!activeChat) return { name: '', avatar: '' };
    
    if (activeChat.type === 'user') {
      const chatUser = users.find(u => u._id === activeChat.id);
      return {
        name: chatUser?.fullName || 'User',
        avatar: chatUser?.avatar,
        isOnline: chatUser?.isOnline,
      };
    } else {
      const group = groups.find(g => g._id === activeChat.id);
      return {
        name: group?.name || 'Group',
        avatar: group?.avatar,
        members: group?.members.length,
      };
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Check if someone is typing
  const isAnyoneTyping = Object.values(typingUsers).some(isTyping => isTyping);
  
  // Get typing usernames
  const getTypingUsers = () => {
    return Object.entries(typingUsers)
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => {
        const typingUser = users.find(u => u._id === userId);
        return typingUser?.fullName || 'Someone';
      })
      .join(', ');
  };
  
  const chatDetails = getChatDetails();
  
  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h3 className="text-xl font-medium text-gray-900">Welcome to ChatApp</h3>
          <p className="mt-2 text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <div className="flex-shrink-0">
          {activeChat.type === 'user' ? (
            <div className="relative">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                {chatDetails.name.charAt(0)}
              </div>
              {chatDetails.isOnline && (
                <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
              )}
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {chatDetails.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="ml-3">
          <h2 className="text-base font-medium text-gray-900">{chatDetails.name}</h2>
          <p className="text-sm text-gray-500">
            {activeChat.type === 'user' 
              ? (chatDetails.isOnline ? 'Online' : 'Offline') 
              : `${chatDetails.members} members`}
          </p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.sender._id === user?._id;
            
            return (
              <div 
                key={message._id} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex max-w-xs md:max-w-md">
                  {!isOwnMessage && activeChat.type === 'group' && (
                    <div className="flex-shrink-0 mr-2 self-end">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {message.sender.fullName.charAt(0)}
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {activeChat.type === 'group' && !isOwnMessage && (
                      <p className="text-xs font-medium text-gray-500">
                        {message.sender.fullName}
                      </p>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p 
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.createdAt), 'h:mm a')}
                      {isOwnMessage && (
                        <span className="ml-2">
                          {message.isRead ? 'Read' : 'Sent'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing indicator */}
          {isAnyoneTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm">{getTypingUsers()} is typing</span>
                  <div className="ml-2 flex space-x-1">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Message input */}
      <MessageInput />
    </div>
  );
};
