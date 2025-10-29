import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

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
  
  // Check if user is admin (currently using hardcoded check)
  async checkAdminAccess(username: string): Promise<AdminUser | null> {
    try {
      console.log('🔐 Checking admin access for:', username);
      
      // For now, use hardcoded admin check (RobertP)
      if (username === 'RobertP') {
        const adminUser: AdminUser = {
          id: 'admin-robert',
          username: 'RobertP',
          role: 'super_admin',
          permissions: ['orders', 'members', 'menu', 'schedule', 'settings'],
          is_active: true
        };
        
        this.currentAdmin = adminUser;
        console.log('✅ Admin access granted:', adminUser);
        return adminUser;
      }
      
      // Check if user exists in members table
      const { data: member, error } = await supabase
        .from('members')
        .select('id, username, first_name, last_name')
        .eq('username', username)
        .single();
      
      if (error || !member) {
        console.log('❌ User not found:', username);
        return null;
      }
      
      // For now, only RobertP is admin
      console.log('❌ User is not admin:', username);
      return null;
      
    } catch (error) {
      console.error('❌ Admin check failed:', error);
      return null;
    }
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
        totalOrders: 0, // Will be updated when orders table is fixed
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
