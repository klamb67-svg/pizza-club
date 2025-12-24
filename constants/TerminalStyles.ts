// Global terminal/CRT style constants for Pizza Club app
// Retro green-screen terminal aesthetic
import { Platform } from "react-native";

export const TERMINAL_COLORS = {
  green: "#00FF66",
  bg: "#001a00",
  glow: "#00ff66",
  shadow: "#00aa44", // Slightly darker for text shadow
} as const;

export const TERMINAL_FONTS = {
  primary: "VT323_400Regular",
  fallback: Platform.select({
    web: "'VT323', 'IBM Plex Mono', monospace",
    default: "monospace",
  }) || "monospace",
} as const;

// Global text shadow for CRT glow effect
export const TERMINAL_TEXT_SHADOW = {
  textShadowColor: TERMINAL_COLORS.glow,
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8,
} as const;

// Base terminal text style
export const TERMINAL_TEXT_STYLE = {
  fontFamily: TERMINAL_FONTS.primary,
  color: TERMINAL_COLORS.green,
  ...TERMINAL_TEXT_SHADOW,
} as const;

// Base terminal container style
export const TERMINAL_CONTAINER_STYLE = {
  backgroundColor: TERMINAL_COLORS.bg,
} as const;

