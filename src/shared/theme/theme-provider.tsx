import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { useThemeStore } from "@/lib/store/theme-store";
import { darkColors, lightColors, radius, spacing, type ThemeColors } from "@/shared/theme/tokens";

type AppTheme = {
  colors: ThemeColors;
  isDark: boolean;
  radius: typeof radius;
  spacing: typeof spacing;
};

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);
  const value = useMemo<AppTheme>(() => {
    const isDark = preference === "system" ? colorScheme === "dark" : preference === "dark";
    return {
      colors: isDark ? darkColors : lightColors,
      isDark,
      radius,
      spacing,
    };
  }, [colorScheme, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useAppTheme must be used within ThemeProvider.");
  }
  return theme;
}
