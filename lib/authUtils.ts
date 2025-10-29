// lib/authUtils.ts
import { supabase } from './supabase';

export interface AuthResult {
  isLoggedIn: boolean;
  username?: string;
  user?: any;
}

/**
 * Check if user has an active session and get user info
 * Note: This app uses custom authentication via members table, not Supabase auth
 * We'll check if there's a valid username in the current route params
 */
export const checkAuthStatus = async (currentUsername?: string): Promise<AuthResult> => {
  try {
    console.log('🔍 Checking auth status for username:', currentUsername);
    
    if (currentUsername && currentUsername !== '') {
      console.log('✅ User appears to be logged in with username:', currentUsername);
      return {
        isLoggedIn: true,
        username: currentUsername,
        user: { username: currentUsername }
      };
    }
    
    console.log('❌ No username found - user not logged in');
    return { isLoggedIn: false };
  } catch (error) {
    console.log('❌ Auth check failed:', error);
    return { isLoggedIn: false };
  }
};

/**
 * Navigate to account page if logged in, otherwise go to login
 */
export const handleAccountNavigation = async (router: any, currentUsername?: string) => {
  try {
    console.log('🧭 Starting account navigation with username:', currentUsername);
    const authResult = await checkAuthStatus(currentUsername);
    
    console.log('📋 Auth result:', authResult);
    
    if (authResult.isLoggedIn && authResult.username) {
      console.log('✅ User is logged in, navigating to account page with username:', authResult.username);
      // User is logged in → Go to account page
      router.push({ 
        pathname: "/account", 
        params: { username: authResult.username } 
      });
    } else {
      console.log('❌ User not logged in, navigating to login page');
      // User not logged in → Go to login page
      router.push("/login");
    }
  } catch (error) {
    console.log('❌ Account navigation error:', error);
    // Fallback to login page
    router.push("/login");
  }
};
