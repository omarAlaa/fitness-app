import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { validateNewPassword, type AuthFieldErrors } from "@/features/auth/auth-validation";
import { AppButton } from "@/shared/ui/app-button";

export function ResetPasswordScreen() {
  const auth = useAuthActions();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});

  async function handleSubmit() {
    const errors = validateNewPassword(password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const result = await auth.updatePassword(password);
    if (result.ok) router.replace("/today");
  }

  return (
    <AuthScreen title="Choose a new password" description="Enter and confirm your new password.">
      <View style={styles.form}>
        <AuthFormField label="New password" value={password} onChangeText={setPassword} error={fieldErrors.password} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" testID="new-password-input" />
        <AuthFormField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} error={fieldErrors.confirmPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" testID="confirm-password-input" />
        {auth.error ? <AuthMessage>{auth.error.message}</AuthMessage> : null}
        <AppButton label={auth.pendingAction === "update-password" ? "Updating…" : "Update password"} onPress={handleSubmit} disabled={auth.pendingAction !== null} testID="update-password-button" />
        {auth.pendingAction === "update-password" ? <ActivityIndicator accessibilityLabel="Updating password" /> : null}
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
