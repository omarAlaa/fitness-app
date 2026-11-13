import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Link } from "expo-router";

import { AuthFormField } from "@/features/auth/components/auth-form-field";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { validateRecoveryEmail, type AuthFieldErrors } from "@/features/auth/auth-validation";
import { AppButton } from "@/shared/ui/app-button";
import { AppText } from "@/shared/ui/app-text";

export function ForgotPasswordScreen() {
  const auth = useAuthActions();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<AuthFieldErrors["email"]>();
  const [requestSent, setRequestSent] = useState(false);

  async function handleSubmit() {
    const errors = validateRecoveryEmail(email);
    setFieldError(errors.email);
    if (errors.email) return;
    const result = await auth.requestPasswordRecovery(email);
    if (result?.ok) setRequestSent(true);
  }

  return (
    <AuthScreen title="Reset your password" description="Enter your email and we’ll send a password reset link if an account matches.">
      <View style={styles.form}>
        {requestSent ? (
          <AppText accessibilityRole="alert">If an account matches that email, a recovery link has been sent.</AppText>
        ) : (
          <>
            <AuthFormField label="Email" value={email} onChangeText={setEmail} error={fieldError} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" testID="email-input" />
            {auth.error ? <AuthMessage>{auth.error.message}</AuthMessage> : null}
            <AppButton label={auth.pendingAction === "recovery" ? "Sending…" : "Send recovery link"} onPress={handleSubmit} disabled={auth.pendingAction !== null} testID="recovery-button" />
            {auth.pendingAction === "recovery" ? <ActivityIndicator accessibilityLabel="Sending recovery email" /> : null}
          </>
        )}
        <Link href="/sign-in"><AppText>Back to sign in</AppText></Link>
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({ form: { gap: 16 } });
