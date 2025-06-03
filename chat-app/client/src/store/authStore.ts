import { create } from 'zustand';
import { authApi } from '@/lib/api';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface User {
  _id: string;
  fullName: string;
  email: string;
  isOnline: boolean;
  avatar: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { user, access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Initialize socket connection
      initializeSocket(user._id);
      
      set({ 
        user, 
        token: access_token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  register: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ fullName, email, password });
      const { user, access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Initialize socket connection
      initializeSocket(user._id);
      
      set({ 
        user, 
        token: access_token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Disconnect socket
    disconnectSocket();
    
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Initialize socket connection
        initializeSocket(user._id);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      }
    }
  },
}));
