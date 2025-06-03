'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function NewChatPage() {
  const { users } = useChatStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter users by search term and exclude current user
  const filteredUsers = users.filter(u => 
    u._id !== user?._id && 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Start a new chat with the selected user
  const startChat = (userId: string) => {
    // Set the active chat to the selected user
    useChatStore.getState().setActiveChat(userId, 'user');
    
    // Navigate to the chat page
    router.push('/chat');
  };
  
  return (
    <div className="flex-1 flex flex-col p-6 bg-white">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">New Conversation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a user to start a new conversation
        </p>
      </div>
      
      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Users list */}
      <div className="mt-6 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <button
                key={user._id}
                onClick={() => startChat(user._id)}
                className="flex items-center w-full p-3 hover:bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  {user.isOnline && (
                    <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                  )}
                </div>
                <div className="ml-3 overflow-hidden text-left">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500">
              {searchTerm 
                ? 'No users found matching your search' 
                : 'No other users available'}
            </div>
          )}
        </div>
      </div>
      
      {/* Cancel button */}
      <div className="mt-6">
        <button
          onClick={() => router.back()}
          className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
