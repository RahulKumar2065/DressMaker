import { supabase } from './supabase';
import { User, UserRole, CustomerProfile, TailorProfile, AdminProfile } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      if (data.role === 'customer') {
        const { error } = await supabase.from('customer_profiles').insert({
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
        });
        if (error) throw error;
      } else if (data.role === 'tailor') {
        const { error } = await supabase.from('tailor_profiles').insert({
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
          phone: data.phone || '',
          business_name: data.fullName,
          address: '',
          city: '',
          state: '',
          postal_code: '',
        });
        if (error) throw error;
      } else if (data.role === 'admin') {
        const { error } = await supabase.from('admin_profiles').insert({
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
        });
        if (error) throw error;
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      throw error;
    }
  },

  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      return { user: authData.user, session: authData.session };
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserRole(): Promise<UserRole | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data: customer } = await supabase
      .from('customer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (customer) return 'customer';

    const { data: tailor } = await supabase
      .from('tailor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tailor) return 'tailor';

    const { data: admin } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (admin) return 'admin';

    return null;
  },

  async getProfile(role: UserRole) {
    const user = await this.getCurrentUser();
    if (!user) return null;

    try {
      if (role === 'customer') {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data as CustomerProfile;
      } else if (role === 'tailor') {
        const { data, error } = await supabase
          .from('tailor_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data as TailorProfile;
      } else if (role === 'admin') {
        const { data, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        return data as AdminProfile;
      }
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(role: UserRole, updates: any) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      if (role === 'customer') {
        const { data, error } = await supabase
          .from('customer_profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data as CustomerProfile;
      } else if (role === 'tailor') {
        const { data, error } = await supabase
          .from('tailor_profiles')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data as TailorProfile;
      }
    } catch (error) {
      throw error;
    }
  },
};
