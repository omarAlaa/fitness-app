import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { useAppTheme } from "@/shared/theme/theme-provider";
import { AppText } from "@/shared/ui/app-text";

type AppButtonProps = Omit<PressableProps, "children"> & { label: string };

export function AppButton({ label, disabled, style, ...props }: AppButtonProps) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          borderRadius: radius.md,
          paddingHorizontal: spacing.lg,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
        },
        typeof style === "function" ? style({ pressed, hovered: false }) : style,
      ]}
    >
      <AppText style={[styles.label, { color: colors.onPrimary }]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 48, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "600" },
});


