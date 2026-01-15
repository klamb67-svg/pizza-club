import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { adminAuth } from '../../lib/adminAuth';
import { supabase } from '../../lib/supabase';

export default function AdminIndex() {
  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check admin state - give it a moment in case we just navigated here
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const admin = adminAuth.getCurrentAdmin();
      if (!admin) {
        console.log('❌ No admin session found - checking database');
        
        // Try to restore admin session by checking admins table
        const { data: adminData } = await supabase
          .from('admins')
          .select('username')
          .eq('username', 'rpaulson')
          .single();
        
        if (adminData) {
          console.log('✅ Admin session restored from database');
          adminAuth.setCurrentAdmin(adminData.username);
        } else {
          console.log('❌ No admin access - redirecting to login');
          router.replace('/login');
          return;
        }
      }
      
      console.log('✅ Admin access verified, redirecting to KDS');
      // Redirect to KDS page
      router.replace('/admin/kds');
    };
    
    checkAndRedirect();
  }, []);

  // Return null while redirecting
  return null;
}