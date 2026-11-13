import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useAuth } from "@/features/auth/auth-provider";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import type { AuthLinkType } from "@/features/auth/auth-service";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { AppText } from "@/shared/ui/app-text";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
function isAuthLinkType(value: string | undefined): value is AuthLinkType {
  return value === "email" || value === "recovery";
}

export function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ token_hash?: string | string[]; type?: string | string[] }>();
  const router = useRouter();
  const authState = useAuth();
  const { verifyAuthLink, pendingAction, error } = useAuthActions();
  const started = useRef(false);
  const [verifiedType, setVerifiedType] = useState<AuthLinkType | null>(null);
  const tokenHash = firstParam(params.token_hash);
  const type = firstParam(params.type);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!tokenHash || !isAuthLinkType(type)) return;
    void verifyAuthLink(tokenHash, type).then((result) => {
      if (result?.ok) setVerifiedType(type);
    });
  }, [tokenHash, type, verifyAuthLink]);

  useEffect(() => {
    if (verifiedType === "recovery" && authState.status === "recovering") {
      router.replace("/reset-password");
    } else if (verifiedType === "email" && authState.status === "signed-in") {
      router.replace("/today");
    }
  }, [authState.status, router, verifiedType]);

  const failure = !tokenHash || !isAuthLinkType(type);
  return (
    <AuthScreen title="Verifying email link" description="This link is checked securely before we continue.">
      <View>
        {error ? <AuthMessage>{error.message}</AuthMessage> : failure ? <AuthMessage>This link is missing information. Request a new email and try again.</AuthMessage> : <ActivityIndicator accessibilityLabel="Verifying link" />}
        {pendingAction === "verify-link" ? <AppText>Please wait…</AppText> : null}
      </View>
    </AuthScreen>
  );
}