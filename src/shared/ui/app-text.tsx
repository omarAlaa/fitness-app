import { StyleSheet, Text, type TextProps } from "react-native";

import { useAppTheme } from "@/shared/theme/theme-provider";

type AppTextProps = TextProps & {
  variant?: "body" | "title" | "caption";
};

export function AppText({ style, variant = "body", ...props }: AppTextProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      {...props}
      style={[
        styles.base,
        variant === "title" && styles.title,
        variant === "caption" && styles.caption,
        { color: variant === "caption" ? colors.mutedText : colors.text },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 24, fontWeight: "700", lineHeight: 32 },
  caption: { fontSize: 13, lineHeight: 18 },
});
