import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { getAuthRouteAccess } from "@/features/auth/auth-state";
import { queryClient } from "@/lib/query/query-client";
import { ThemeProvider, useAppTheme } from "@/shared/theme/theme-provider";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export function RootNavigator() {
  const { colors } = useAppTheme();
  const { status } = useAuth();
  const access = getAuthRouteAccess(status);

  return (
    <Stack screenOptions={{
      contentStyle: { backgroundColor: colors.background },
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Protected guard={access.loading}>
        <Stack.Screen name="loading" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={access.auth}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={access.app}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={access.recovery}>
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
