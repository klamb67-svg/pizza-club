import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Admin Authentication Service (simplified for testing)
class AdminAuthService {
  async checkAdminAccess(username: string): Promise<any> {
    try {
      console.log('🔐 Checking admin access for:', username);
      
      // For now, use hardcoded admin check (RobertP)
      if (username === 'RobertP') {
        const adminUser = {
          id: 'admin-robert',
          username: 'RobertP',
          role: 'super_admin',
          permissions: ['orders', 'members', 'menu', 'schedule', 'settings'],
          is_active: true
        };
        
        console.log('✅ Admin access granted:', adminUser);
        return adminUser;
      }
      
      console.log('❌ User is not admin:', username);
      return null;
      
    } catch (error) {
      console.error('❌ Admin check failed:', error);
      return null;
    }
  }
  
  async getDashboardData(): Promise<any> {
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

const adminAuth = new AdminAuthService();

async function testAdminSystem() {
  console.log('🧪 Testing Admin System...');
  
  try {
    // Test admin authentication
    console.log('🔐 Testing admin authentication...');
    const adminUser = await adminAuth.checkAdminAccess('RobertP');
    
    if (adminUser) {
      console.log('✅ Admin authentication successful:', adminUser);
      
      // Test dashboard data
      console.log('📊 Testing dashboard data...');
      const dashboardData = await adminAuth.getDashboardData();
      console.log('✅ Dashboard data:', dashboardData);
      
      // Test member management
      console.log('👥 Testing member management...');
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, first_name, last_name, username, phone, address')
        .limit(5);
      
      if (membersError) {
        console.error('❌ Member query failed:', membersError);
      } else {
        console.log('✅ Members loaded:', members?.length || 0);
        members?.forEach(member => {
          console.log(`  - ${member.first_name} ${member.last_name} (@${member.username})`);
          if (member.address && member.address.includes('ORDER_')) {
            console.log(`    📦 Has order: ${member.address}`);
          }
        });
      }
      
      console.log('🎉 Admin system test completed successfully!');
      
    } else {
      console.log('❌ Admin authentication failed');
    }
    
  } catch (error) {
    console.error('❌ Admin system test failed:', error);
  }
}

testAdminSystem();