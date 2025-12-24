// Reusable bottom navigation component for Pizza Club app
// Shows ACCOUNT, HISTORY, CONTACT, ABOUT buttons, excluding the current page
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TERMINAL_COLORS, TERMINAL_TEXT_SHADOW } from '../constants/TerminalStyles';
import { useResponsiveValues } from '../lib/responsive';

const green = TERMINAL_COLORS.green;
const bg = TERMINAL_COLORS.bg;

interface BottomNavProps {
  currentPage: 'account' | 'history' | 'contact' | 'about' | 'frontdoor' | 'home';
  username?: string;
}

export default function BottomNav({ currentPage, username: usernameProp }: BottomNavProps) {
  const router = useRouter();
  const responsive = useResponsiveValues();
  // Try to get username from route params if not provided as prop
  const routeParams = useLocalSearchParams<{ username?: string }>();
  const username = usernameProp || routeParams.username;

  const navItems = [
    { key: 'home', label: 'HOME', path: '/frontdoor', requiresUsername: false },
    { key: 'account', label: 'ACCOUNT', path: '/account', requiresUsername: false },
    { key: 'history', label: 'HISTORY', path: '/history', requiresUsername: false },
    { key: 'contact', label: 'CONTACT', path: '/contact', requiresUsername: false },
    { key: 'about', label: 'ABOUT', path: '/about', requiresUsername: false },
  ];

  // Filter out only the current page - all buttons should be visible
  const visibleItems = navItems.filter(
    (item) => item.key !== currentPage
  );

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.key === 'home') {
      // HOME button goes to frontdoor - always pass username if available
      if (username) {
        router.push({ pathname: '/frontdoor', params: { username } });
      } else {
        router.push('/frontdoor');
      }
    } else if (item.key === 'account') {
      // Always pass username if available - account page needs it to load profile
      if (username) {
        router.push({ pathname: '/account', params: { username: String(username) } });
      } else {
        // If no username available, try to get it from current route params
        const currentUsername = routeParams.username;
        if (currentUsername) {
          router.push({ pathname: '/account', params: { username: String(currentUsername) } });
        } else {
          // Last resort: navigate without username - account page will show login prompt
          router.push('/account');
        }
      }
    } else if (item.key === 'history') {
      // History page can work with or without username
      if (username) {
        router.push({ pathname: item.path as any, params: { username } });
      } else {
        router.push(item.path as any);
      }
    } else {
      // Contact and About - pass username if available so it's preserved for navigation
      if (username) {
        router.push({ pathname: item.path as any, params: { username } });
      } else {
        router.push(item.path as any);
      }
    }
  };

  const styles = createStyles(responsive);

  return (
    <View style={styles.navContainer}>
      {visibleItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.navButton}
          onPress={() => handleNavigation(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.navButtonText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const createStyles = (responsive: any) => StyleSheet.create({
  navContainer: {
    marginTop: responsive.margin.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: responsive.margin.sm,
    paddingHorizontal: responsive.padding.sm,
  },
  navButton: {
    paddingVertical: responsive.padding.sm,
    paddingHorizontal: responsive.padding.md,
    borderWidth: 1,
    borderColor: green,
    backgroundColor: bg,
    borderRadius: 4,
    minWidth: responsive.isMobile ? 70 : 80,
    minHeight: responsive.touchTarget,
    justifyContent: "center",
  },
  navButtonText: {
    color: green,
    fontFamily: "VT323_400Regular",
    fontSize: responsive.fontSize.sm,
    fontWeight: "bold",
    textAlign: "center",
    ...TERMINAL_TEXT_SHADOW,
  },
});

