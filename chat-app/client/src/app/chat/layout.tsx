'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/chat/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import useSocketEvents from '@/hooks/useSocketEvents';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { fetchUsers, fetchGroups } = useChatStore();
  const router = useRouter();

  // Initialize socket events
  useSocketEvents();
  
  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    // Redirect to auth if not authenticated
    if (isAuthenticated === false) {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);
  
  useEffect(() => {
    // Fetch users and groups when authenticated
    if (isAuthenticated) {
      fetchUsers();
      fetchGroups();
    }
  }, [isAuthenticated, fetchUsers, fetchGroups]);
  
  if (isAuthenticated === undefined) {
    // Initial loading state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated === false) {
    // Should redirect, but show loading in the meantime
    return null;
  }
  
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
