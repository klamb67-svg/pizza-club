import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bvmwcswddbepelgctybs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_2-7AUXVus7corG_aVvM2gQ_uRqAuYoo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin Authentication Service
export interface AdminUser {
  id: string;
  username: string;
  role: 'super_admin' | 'admin' | 'kitchen_staff';
  permissions: string[];
  is_active: boolean;
}

export class AdminAuthService {
  private static instance: AdminAuthService;
  private currentAdmin: AdminUser | null = null;
  
  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }
  
  // Check if user is admin - returns username only if they ARE admin, null otherwise
  async checkAdminAccess(username: string): Promise<string | null> {
    try {
      console.log('🔐 Checking if username is admin:', username);
      
      // Check if this username is in the admins table
      const { data: adminRecord, error } = await supabase
        .from('admins')
        .select('username')
        .eq('username', username)
        .single();
      
      if (error || !adminRecord) {
        console.log('❌ Not an admin username:', username);
        return null;
      }
      
      console.log('✅ Username is admin (password verification required)');
      return username;
      
    } catch (error) {
      console.error('❌ Admin check failed:', error);
      return null;
    }
  }
  
  // Set current admin after successful login
  setCurrentAdmin(username: string): void {
    const adminUser: AdminUser = {
      id: 'admin-robert',
      username: username,
      role: 'super_admin',
      permissions: ['orders', 'members', 'menu', 'schedule', 'settings'],
      is_active: true
    };
    
    this.currentAdmin = adminUser;
    console.log('✅ Admin logged in:', adminUser);
  }
  
  // Get current admin user
  getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin;
  }
  
  // Check if current user has specific permission
  hasPermission(permission: string): boolean {
    if (!this.currentAdmin) return false;
    return this.currentAdmin.permissions.includes(permission);
  }
  
  // Check if current user has admin role
  isAdmin(): boolean {
    return this.currentAdmin !== null;
  }
  
  // Check if current user is super admin
  isSuperAdmin(): boolean {
    return this.currentAdmin?.role === 'super_admin';
  }
  
  // Logout admin
  logout(): void {
    this.currentAdmin = null;
    console.log('👋 Admin logged out');
  }
  
  // Get admin dashboard data
  async getDashboardData(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    totalMembers: number;
    activeOrders: number;
  }> {
    try {
      console.log('📊 Loading admin dashboard data...');
      
      // Get total members count
      const { count: totalMembers } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      
      // For now, return mock data since orders table has schema issues
      const dashboardData = {
        totalOrders: 0,
        pendingOrders: 0,
        totalMembers: totalMembers || 0,
        activeOrders: 0
      };
      
      console.log('✅ Dashboard data loaded:', dashboardData);
      return dashboardData;
      
    } catch (error) {
      console.error('❌ Dashboard data load failed:', error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        totalMembers: 0,
        activeOrders: 0
      };
    }
  }
}

// Export singleton instance
export const adminAuth = AdminAuthService.getInstance();