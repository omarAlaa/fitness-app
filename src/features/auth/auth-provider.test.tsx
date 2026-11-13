/* eslint-disable import/first */
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

import { act, fireEvent, render } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import { supabase } from "@/lib/supabase/client";

 type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void;
type MockAuth = {
  onAuthStateChange: jest.MockedFunction<(callback: AuthCallback) => { data: { subscription: { unsubscribe: jest.Mock } } }>;
  startAutoRefresh: jest.MockedFunction<() => void>;
  stopAutoRefresh: jest.MockedFunction<() => void>;
  signOut: jest.MockedFunction<SupabaseClient["auth"]["signOut"]>;
};

const mockAuth = (supabase as unknown as { auth: MockAuth }).auth;
let authCallback: AuthCallback | null = null;

function AuthProbe() {
  const { status, user, completeRecovery } = useAuth();
  return <><Text>{`${status}:${user?.email ?? ""}`}</Text><Pressable testID="finish-recovery" onPress={completeRecovery}><Text>Finish</Text></Pressable></>;
}

function makeSession(confirmed = true): Session {
  const user: User = {
    id: "user-1",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00.000Z",
    email: "person@example.com",
    ...(confirmed ? { email_confirmed_at: "2026-01-01T00:00:00.000Z" } : {}),
  };
  return { access_token: "test-access", refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, expires_at: 1_900_000_000, user };
}

describe("AuthProvider", () => {
  beforeEach(() => {
    authCallback = null;
    mockAuth.signOut.mockResolvedValue({ error: null });
    mockAuth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
  });

  it("restores a confirmed session from Supabase initialization before exposing app state", async () => {
    const view = await render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(view.getByText("initializing:")).toBeTruthy();
    await act(() => authCallback?.("INITIAL_SESSION", makeSession()));
    expect(view.getByText("signed-in:person@example.com")).toBeTruthy();
  });

  it("starts signed out when no session is restored and signs out on an expired session event", async () => {
    const view = await render(<AuthProvider><AuthProbe /></AuthProvider>);
    await act(() => authCallback?.("INITIAL_SESSION", null));
    expect(view.getByText("signed-out:")).toBeTruthy();
    await act(() => authCallback?.("SIGNED_IN", makeSession()));
    expect(view.getByText("signed-in:person@example.com")).toBeTruthy();
    await act(() => authCallback?.("SIGNED_OUT", null));
    expect(view.getByText("signed-out:")).toBeTruthy();
  });

  it("routes recovery sessions separately until password reset completes", async () => {
    const view = await render(<AuthProvider><AuthProbe /></AuthProvider>);
    await act(() => authCallback?.("PASSWORD_RECOVERY", makeSession()));
    expect(view.getByText("recovering:person@example.com")).toBeTruthy();
    await fireEvent.press(view.getByTestId("finish-recovery"));
    expect(view.getByText("signed-in:person@example.com")).toBeTruthy();
  });

  it("does not treat an unconfirmed account session as authenticated", async () => {
    const view = await render(<AuthProvider><AuthProbe /></AuthProvider>);
    await act(() => authCallback?.("INITIAL_SESSION", makeSession(false)));
    expect(view.getByText("signed-out:")).toBeTruthy();
    expect(mockAuth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});






