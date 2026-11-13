import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Link } from "expo-router";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { validateSignIn, type AuthFieldErrors } from "@/features/auth/auth-validation";
import { AppButton } from "@/shared/ui/app-button";
import { AppText } from "@/shared/ui/app-text";

export function SignInScreen() {
  const auth = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSubmit() {
    const errors = validateSignIn(email, password);
    setFieldErrors(errors);
    setConfirmationSent(false);
    if (Object.keys(errors).length > 0) return;
    await auth.signIn(email, password);
  }

  async function handleResendConfirmation() {
    const result = await auth.resendConfirmation(email);
    setConfirmationSent(result?.ok === true);
  }

  return (
    <AuthScreen title="Welcome back" description="Sign in to continue to your training.">
      <View style={styles.form}>
        <AuthFormField label="Email" value={email} onChangeText={setEmail} error={fieldErrors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" testID="email-input" />
        <AuthFormField label="Password" value={password} onChangeText={setPassword} error={fieldErrors.password} secureTextEntry autoCapitalize="none" autoComplete="current-password" textContentType="password" testID="password-input" />
        {auth.error ? <AuthMessage>{auth.error.message}</AuthMessage> : null}
        {auth.error?.code === "email_not_confirmed" ? (
          <AppButton label={confirmationSent ? "Confirmation email sent" : "Resend confirmation email"} onPress={handleResendConfirmation} disabled={auth.pendingAction !== null || confirmationSent} />
        ) : null}
        <AppButton label={auth.pendingAction === "sign-in" ? "Signing in…" : "Sign in"} onPress={handleSubmit} disabled={auth.pendingAction !== null} accessibilityHint="Signs in to your account" testID="sign-in-button" />
        {auth.pendingAction === "sign-in" ? <ActivityIndicator accessibilityLabel="Signing in" /> : null}
        <Link href="/forgot-password"><AppText>Forgot password?</AppText></Link>
        <Link href="/sign-up"><AppText>Create an account</AppText></Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
