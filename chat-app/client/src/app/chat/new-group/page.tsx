'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useChatStore } from '@/store/chatStore';

interface NewGroupFormData {
  name: string;
  description: string;
}

export default function NewGroupPage() {
  const { users, createGroup } = useChatStore();
  const router = useRouter();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewGroupFormData>();
  
  // Toggle member selection
  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // Create new group
  const onSubmit = async (data: NewGroupFormData) => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member for the group');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await createGroup(data.name, data.description, selectedMembers);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col p-6 bg-white">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Create New Group</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new group chat with your contacts
        </p>
      </div>
      
      {error && (
        <div className="mt-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Group Name
          </label>
          <input
            id="name"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            {...register('name', { 
              required: 'Group name is required',
              minLength: {
                value: 3,
                message: 'Group name must be at least 3 characters',
              }
            })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            {...register('description')}
          ></textarea>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Members
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Selected: {selectedMembers.length} members
          </p>
          
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter(user => user._id !== JSON.parse(localStorage.getItem('user') || '{}')._id)
              .map(user => (
                <div
                  key={user._id}
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    selectedMembers.includes(user._id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  {selectedMembers.includes(user._id) && (
                    <div className="ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || selectedMembers.length === 0}
            className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
