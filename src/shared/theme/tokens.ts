export const lightColors = {
  background: "#F7F8FA",
  surface: "#FFFFFF",
  text: "#17212B",
  mutedText: "#657381",
  border: "#DCE2E8",
  primary: "#176B55",
  onPrimary: "#FFFFFF",
  danger: "#B42318",
} as const;

export const darkColors = {
  background: "#101815",
  surface: "#19231F",
  text: "#F0F5F2",
  mutedText: "#A7B5AD",
  border: "#34423B",
  primary: "#78D5B3",
  onPrimary: "#10251D",
  danger: "#FF8A80",
} as const;

export type ThemeColors = { [Color in keyof typeof lightColors]: string };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;
