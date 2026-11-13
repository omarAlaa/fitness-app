import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { useAppTheme } from "@/shared/theme/theme-provider";
import { AppText } from "@/shared/ui/app-text";

type AuthFormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function AuthFormField({ label, error, style, ...props }: AuthFormFieldProps) {
  const { colors, radius, spacing } = useAppTheme();
  return (
    <View style={styles.container}>
      <AppText>{label}</AppText>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityHint={error ? `Error: ${error}` : undefined}
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md },
          style,
        ]}
      />
      {error ? <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: 6 }, input: { minHeight: 48, borderWidth: 1, fontSize: 16 }, });

