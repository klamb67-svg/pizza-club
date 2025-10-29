// lib/responsive.ts
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200,
} as const;

// Screen size categories
export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

// Responsive spacing scale (4px base unit)
export const SPACING = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
} as const;

// Responsive typography scale
export const TYPOGRAPHY = {
  xs: { mobile: 10, tablet: 12, desktop: 12 },
  sm: { mobile: 12, tablet: 14, desktop: 14 },
  md: { mobile: 14, tablet: 16, desktop: 16 },
  lg: { mobile: 16, tablet: 18, desktop: 18 },
  xl: { mobile: 18, tablet: 20, desktop: 20 },
  xxl: { mobile: 20, tablet: 24, desktop: 24 },
  xxxl: { mobile: 24, tablet: 28, desktop: 28 },
  xxxxl: { mobile: 28, tablet: 32, desktop: 32 },
  title: { mobile: 24, tablet: 28, desktop: 32 },
} as const;

// Hook to get current screen dimensions and breakpoint info
export const useResponsive = () => {
  const [screenData, setScreenData] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
      isDesktop: width >= BREAKPOINTS.desktop,
      isLargeDesktop: width >= BREAKPOINTS.largeDesktop,
      screenSize: getScreenSize(width),
    };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData({
        width: window.width,
        height: window.height,
        isMobile: window.width < BREAKPOINTS.mobile,
        isTablet: window.width >= BREAKPOINTS.mobile && window.width < BREAKPOINTS.desktop,
        isDesktop: window.width >= BREAKPOINTS.desktop,
        isLargeDesktop: window.width >= BREAKPOINTS.largeDesktop,
        screenSize: getScreenSize(window.width),
      });
    });

    return () => subscription?.remove();
  }, []);

  return screenData;
};

// Helper function to determine screen size category
function getScreenSize(width: number): ScreenSize {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  if (width < BREAKPOINTS.largeDesktop) return 'desktop';
  return 'largeDesktop';
}

// Helper function to get responsive font size
export const getResponsiveFontSize = (size: keyof typeof TYPOGRAPHY, screenSize: ScreenSize): number => {
  const sizes = TYPOGRAPHY[size];
  switch (screenSize) {
    case 'mobile':
      return sizes.mobile;
    case 'tablet':
      return sizes.tablet;
    case 'desktop':
    case 'largeDesktop':
      return sizes.desktop;
    default:
      return sizes.mobile;
  }
};

// Helper function to get responsive spacing
export const getResponsiveSpacing = (
  mobile: number,
  tablet?: number,
  desktop?: number
): number => {
  const { screenSize } = useResponsive();
  
  switch (screenSize) {
    case 'mobile':
      return mobile;
    case 'tablet':
      return tablet ?? mobile;
    case 'desktop':
    case 'largeDesktop':
      return desktop ?? tablet ?? mobile;
    default:
      return mobile;
  }
};

// Helper function to get responsive padding/margin
export const getResponsivePadding = (
  mobile: keyof typeof SPACING | number,
  tablet?: keyof typeof SPACING | number,
  desktop?: keyof typeof SPACING | number
): number => {
  const { screenSize } = useResponsive();
  
  const getValue = (value: keyof typeof SPACING | number) => {
    return typeof value === 'number' ? value : SPACING[value];
  };
  
  switch (screenSize) {
    case 'mobile':
      return getValue(mobile);
    case 'tablet':
      return getValue(tablet ?? mobile);
    case 'desktop':
    case 'largeDesktop':
      return getValue(desktop ?? tablet ?? mobile);
    default:
      return getValue(mobile);
  }
};

// Touch target size helpers
export const TOUCH_TARGETS = {
  minimum: 44, // iOS/Android minimum touch target
  comfortable: 48, // Comfortable touch target
  large: 56, // Large touch target for important actions
} as const;

// Helper to ensure minimum touch target size
export const getTouchTargetSize = (baseSize: number): number => {
  return Math.max(baseSize, TOUCH_TARGETS.minimum);
};

// Responsive grid helpers
export const getGridColumns = (screenSize: ScreenSize): number => {
  switch (screenSize) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 3;
    case 'largeDesktop':
      return 4;
    default:
      return 1;
  }
};

// Export commonly used responsive values
export const useResponsiveValues = () => {
  const responsive = useResponsive();
  
  return {
    // Spacing
    padding: {
      xs: getResponsivePadding('xs', 'sm', 'md'),
      sm: getResponsivePadding('sm', 'md', 'lg'),
      md: getResponsivePadding('md', 'lg', 'xl'),
      lg: getResponsivePadding('lg', 'xl', 'xxl'),
      xl: getResponsivePadding('xl', 'xxl', 'xxxl'),
    },
    margin: {
      xs: getResponsivePadding('xs', 'sm', 'md'),
      sm: getResponsivePadding('sm', 'md', 'lg'),
      md: getResponsivePadding('md', 'lg', 'xl'),
      lg: getResponsivePadding('lg', 'xl', 'xxl'),
      xl: getResponsivePadding('xl', 'xxl', 'xxxl'),
    },
    // Typography
    fontSize: {
      xs: getResponsiveFontSize('xs', responsive.screenSize),
      sm: getResponsiveFontSize('sm', responsive.screenSize),
      md: getResponsiveFontSize('md', responsive.screenSize),
      lg: getResponsiveFontSize('lg', responsive.screenSize),
      xl: getResponsiveFontSize('xl', responsive.screenSize),
      xxl: getResponsiveFontSize('xxl', responsive.screenSize),
      xxxl: getResponsiveFontSize('xxxl', responsive.screenSize),
      title: getResponsiveFontSize('title', responsive.screenSize),
    },
    // Layout
    gridColumns: getGridColumns(responsive.screenSize),
    touchTarget: TOUCH_TARGETS.comfortable,
    ...responsive,
  };
};

