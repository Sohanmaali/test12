import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { users, groups, setActiveChat } = useChatStore();
  const [activeTab, setActiveTab] = useState<'direct' | 'groups'>('direct');
  
  const handleLogout = () => {
    logout();
  };
  
  const handleUserClick = (userId: string) => {
    setActiveChat(userId, 'user');
  };
  
  const handleGroupClick = (groupId: string) => {
    setActiveChat(groupId, 'group');
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-100 border-r border-gray-200 w-72">
      {/* User profile */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-white">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.fullName.charAt(0)}
          </div>
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto p-1 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'direct'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('direct')}
        >
          Direct Messages
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'groups'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('groups')}
        >
          Groups
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Create new chat or group button */}
      <div className="p-3 border-b border-gray-200">
        {activeTab === 'direct' ? (
          <Link href="/chat/new-chat" className="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </Link>
        ) : (
          <Link href="/chat/new-group" className="flex items-center justify-center w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Group
          </Link>
        )}
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'direct' ? (
          <div className="px-3 divide-y divide-gray-200">
            {users
              ?.filter(u => u._id !== user?._id)
              .map(u => (
                <button
                  key={u._id}
                  className="flex items-center w-full py-3 hover:bg-gray-50"
                  onClick={() => handleUserClick(u._id)}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                      {u.fullName.charAt(0)}
                    </div>
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 text-left">{u.fullName}</p>
                    <p className="text-xs text-gray-500 truncate text-left">
                      {u.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div className="px-3 divide-y divide-gray-200">
            {groups?.map(group => (
              <button
                key={group._id}
                className="flex items-center w-full py-3 hover:bg-gray-50"
                onClick={() => handleGroupClick(group._id)}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {group.name.charAt(0)}
                  </div>
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 text-left">{group.name}</p>
                  <p className="text-xs text-gray-500 truncate text-left">
                    {group.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
