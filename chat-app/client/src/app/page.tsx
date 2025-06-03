'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    if (isAuthenticated === undefined) {
      // Loading state, do nothing yet
      return;
    }
    
    if (isAuthenticated) {
      router.push('/chat');
    } else {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
