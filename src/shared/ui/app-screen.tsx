import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView, type SafeAreaViewProps } from "react-native-safe-area-context";

import { useAppTheme } from "@/shared/theme/theme-provider";

type AppScreenProps = PropsWithChildren<SafeAreaViewProps>;

export function AppScreen({ children, style, ...props }: AppScreenProps) {
  const { colors, spacing } = useAppTheme();
  return (
    <SafeAreaView
      {...props}
      style={[styles.screen, { backgroundColor: colors.background, padding: spacing.lg }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 } });

