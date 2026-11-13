import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/features/auth/auth-provider";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { AuthMessage } from "@/features/auth/components/auth-message";

export default function LoadingRoute() {
  const { status } = useAuth();
  const hasConfigurationError = status === "configuration-error";

  return (
    <AuthScreen
      title={hasConfigurationError ? "Authentication unavailable" : "Loading your account"}
      description={hasConfigurationError ? "Supabase is not configured for this build." : "Checking your saved session…"}
    >
      <View>
        {hasConfigurationError ? (
          <AuthMessage>Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY, then restart the app.</AuthMessage>
        ) : <ActivityIndicator accessibilityLabel="Loading account" />}
      </View>
    </AuthScreen>
  );
}
