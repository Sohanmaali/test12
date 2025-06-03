import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API functions
export const authApi = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
};

// Users API functions
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (userId: string) => api.get(`/users/${userId}`),
};

// Messages API functions
export const messagesApi = {
  create: (messageData: any) => api.post('/messages', messageData),
  getByUsers: (userId1: string, userId2: string) => 
    api.get(`/messages/user/${userId1}/${userId2}`),
  getByGroup: (groupId: string) => api.get(`/messages/group/${groupId}`),
  markAsRead: (messageId: string, userId: string) => 
    api.post(`/messages/${messageId}/read/${userId}`),
};

// Groups API functions
export const groupsApi = {
  create: (groupData: any) => api.post('/groups', groupData),
  getAll: () => api.get('/groups'),
  getById: (groupId: string) => api.get(`/groups/${groupId}`),
  getByMember: (userId: string) => api.get(`/groups/member/${userId}`),
  addMember: (groupId: string, userId: string) => 
    api.post(`/groups/${groupId}/members/${userId}`),
  removeMember: (groupId: string, userId: string) => 
    api.post(`/groups/${groupId}/members/${userId}/remove`),
};

export default api;
