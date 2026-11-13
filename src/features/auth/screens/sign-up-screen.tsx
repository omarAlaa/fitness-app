import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Link } from "expo-router";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { validateRegistration, type AuthFieldErrors } from "@/features/auth/auth-validation";
import { AppButton } from "@/shared/ui/app-button";
import { AppText } from "@/shared/ui/app-text";

export function SignUpScreen() {
  const auth = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit() {
    const errors = validateRegistration(email, password, confirmPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const result = await auth.signUp(email, password);
    if (result?.ok) setConfirmationSent(true);
  }

  return (
    <AuthScreen title="Create account" description="Use your email and a password to get started.">
      <View style={styles.form}>
        {confirmationSent ? (
          <AppText accessibilityRole="alert">Check your email for a confirmation link. You can sign in after confirming your address.</AppText>
        ) : (
          <>
            <AuthFormField label="Email" value={email} onChangeText={setEmail} error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" testID="email-input" />
            <AuthFormField label="Password" value={password} onChangeText={setPassword} error={fieldErrors.password} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" testID="password-input" />
            <AuthFormField label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} error={fieldErrors.confirmPassword} secureTextEntry autoCapitalize="none" autoComplete="new-password" textContentType="newPassword" testID="confirm-password-input" />
            {auth.error ? <AuthMessage>{auth.error.message}</AuthMessage> : null}
            <AppButton label={auth.pendingAction === "sign-up" ? "Creating account…" : "Create account"} onPress={handleSubmit} disabled={auth.pendingAction !== null} testID="sign-up-button" />
            {auth.pendingAction === "sign-up" ? <ActivityIndicator accessibilityLabel="Creating account" /> : null}
          </>
        )}
        <Link href="/sign-in"><AppText>Back to sign in</AppText></Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
