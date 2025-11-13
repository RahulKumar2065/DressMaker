import { create } from 'zustand';
import { User, UserRole, CustomerProfile, TailorProfile, AdminProfile } from '../types';
import { authService } from '../services/auth';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  profile: CustomerProfile | TailorProfile | AdminProfile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  profile: null,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const role = await authService.getUserRole();
        if (role) {
          const profile = await authService.getProfile(role);
          set({
            user: {
              id: user.id,
              email: user.email || '',
              role,
            },
            role,
            profile,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Initialization failed',
        isLoading: false,
      });
    }
  },

  signUp: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user, session } = await authService.signUp(data);
      const role = await authService.getUserRole();
      const profile = role ? await authService.getProfile(role) : null;

      set({
        user: {
          id: user.id,
          email: user.email || '',
          role: role || data.role,
        },
        role: role || data.role,
        profile,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Sign up failed',
        isLoading: false,
      });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signIn({ email, password });
      const user = await authService.getCurrentUser();
      const role = await authService.getUserRole();

      if (user && role) {
        const profile = await authService.getProfile(role);
        set({
          user: {
            id: user.id,
            email: user.email || '',
            role,
          },
          role,
          profile,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Sign in failed',
        isLoading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({
        user: null,
        role: null,
        profile: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Sign out failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
