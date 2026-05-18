import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start in loading state to verify auth first

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      if (response.data?.status === 'success' && response.data?.data?.user) {
        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data?.status === 'success' && response.data?.data?.user) {
        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (signUpData) => {
    set({ isLoading: true });
    try {
      // Split full name into first and last name
      const nameParts = (signUpData.fullName || '').trim().split(/\s+/);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Name';

      const payload = {
        email: signUpData.email,
        password: signUpData.password,
        firstName,
        lastName,
      };

      const response = await api.post('/auth/register', payload);
      if (response.data?.status === 'success' && response.data?.data?.user) {
        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out from server:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/auth/profile', profileData);
      if (response.data?.status === 'success' && response.data?.data?.user) {
        set({ user: response.data.data.user });
        return response.data.data.user;
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
}));
