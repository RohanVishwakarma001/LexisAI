import { create } from 'zustand';

// Simple simulated auth store
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: credentials.email || 'demo@firm.com',
        role: 'admin',
      };
      
      localStorage.setItem('token', 'mock_jwt_token_123');
      
      set({ 
        user: mockUser, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
}));
