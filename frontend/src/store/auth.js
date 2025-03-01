import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/api';
import { info, error, debug } from '../utils/logger';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        debug('STORE', 'Auth: Starting login process', { email });
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(email, password);
          info('STORE', 'Auth: Login successful', { userId: data.user?.id });
          set({ 
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          });
          localStorage.setItem('token', data.token);
          return data;
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Login failed';
          error('STORE', 'Auth: Login failed', { error: errorMessage });
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      
      register: async (userData) => {
        debug('STORE', 'Auth: Starting registration process', { email: userData.email });
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register(userData);
          info('STORE', 'Auth: Registration successful', { userId: data.user?.id });
          set({ 
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          });
          localStorage.setItem('token', data.token);
          return data;
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Registration failed';
          error('STORE', 'Auth: Registration failed', { error: errorMessage });
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      
      logout: () => {
        info('STORE', 'Auth: User logging out');
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        info('STORE', 'Auth: Logout complete');
      },
      
      updateProfile: async (userData) => {
        debug('STORE', 'Auth: Updating user profile', { userId: userData.id });
        set({ isLoading: true, error: null });
        try {
          const data = await authService.updateProfile(userData);
          info('STORE', 'Auth: Profile updated successfully', { userId: data.user?.id });
          set({ user: data.user, isLoading: false });
          return data;
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Update failed';
          error('STORE', 'Auth: Profile update failed', { error: errorMessage });
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      
      updatePassword: async (passwordData) => {
        debug('STORE', 'Auth: Updating user password');
        set({ isLoading: true, error: null });
        try {
          const data = await authService.updatePassword(passwordData);
          info('STORE', 'Auth: Password updated successfully');
          // Update token if a new one was returned
          if (data.token) {
            localStorage.setItem('token', data.token);
            set({ token: data.token, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return data;
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Password update failed';
          error('STORE', 'Auth: Password update failed', { error: errorMessage });
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      
      updateProfilePic: async (formData) => {
        debug('STORE', 'Auth: Updating profile picture');
        set({ isLoading: true, error: null });
        try {
          const data = await authService.updateProfilePic(formData);
          info('STORE', 'Auth: Profile picture updated successfully');
          set({ user: data.user, isLoading: false });
          return data;
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Profile picture update failed';
          error('STORE', 'Auth: Profile picture update failed', { error: errorMessage });
          set({ error: errorMessage, isLoading: false });
          throw err;
        }
      },
      
      loadUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          debug('STORE', 'Auth: No token found, skipping user load');
          return;
        }
        
        debug('STORE', 'Auth: Loading user profile from token');
        set({ isLoading: true, error: null });
        try {
          const data = await authService.getMe();
          info('STORE', 'Auth: User loaded successfully', { userId: data.user?.id });
          set({ 
            user: data.user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (err) {
          const errorMessage = err.response?.data?.message || 'Authentication failed';
          error('STORE', 'Auth: Failed to load user profile', { error: errorMessage });
          localStorage.removeItem('token');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            error: errorMessage,
            isLoading: false
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => {
        debug('STORE', 'Auth: Rehydrating auth store from storage');
        return (state, error) => {
          if (error) {
            error('STORE', 'Auth: Error rehydrating state', error);
          } else {
            debug('STORE', 'Auth: Store rehydrated successfully', { hasToken: !!state?.token });
          }
        };
      }
    }
  )
);