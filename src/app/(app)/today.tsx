import { ActivityIndicator, View } from "react-native";

import { AuthMessage } from "@/features/auth/components/auth-message";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { AppButton } from "@/shared/ui/app-button";
import { AppScreen } from "@/shared/ui/app-screen";
import { AppText } from "@/shared/ui/app-text";

export default function TodayRoute() {
  const auth = useAuthActions();
  return (
    <AppScreen>
      <View style={{ flex: 1, justifyContent: "center", gap: 16 }}>
        <AppText variant="title">Today</AppText>
        <AppText>Welcome back{auth.pendingAction === "sign-out" ? ". Signing out…" : "."}</AppText>
        {auth.error ? <AuthMessage>{auth.error.message}</AuthMessage> : null}
        <AppButton label="Sign out" onPress={() => void auth.signOut()} disabled={auth.pendingAction !== null} testID="sign-out-button" />
        {auth.pendingAction === "sign-out" ? <ActivityIndicator accessibilityLabel="Signing out" /> : null}
      </View>
    </AppScreen>
  );
}
