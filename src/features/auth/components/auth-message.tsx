import { AppText } from "@/shared/ui/app-text";
import { useAppTheme } from "@/shared/theme/theme-provider";

export function AuthMessage({ children }: { children: string }) {
  const { colors } = useAppTheme();
  return <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{children}</AppText>;
}
