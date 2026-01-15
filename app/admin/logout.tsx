import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { adminAuth } from '../../lib/adminAuth';

export default function AdminLogout() {
  useEffect(() => {
    // Logout admin
    adminAuth.logout();
    console.log('👋 Admin logged out, redirecting to login');
    
    // Redirect to login page
    router.replace('/login');
  }, []);

  // Return null while redirecting
  return null;
}

