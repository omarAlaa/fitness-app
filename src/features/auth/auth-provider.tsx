import { AppState } from "react-native";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { User } from "@supabase/supabase-js";

import type { AuthState } from "@/features/auth/auth-state";
import { queryClient } from "@/lib/query/query-client";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = AuthState & { completeRecovery: () => void };
const initialState: AuthState = supabase
  ? { status: "initializing", user: null }
  : { status: "configuration-error", user: null };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(initialState);
  const stateRef = useRef<AuthState>(initialState);

  const commitState = useCallback((nextState: AuthState) => {
    const previousUserId = stateRef.current.user?.id ?? null;
    const nextUserId = nextState.user?.id ?? null;
    if (previousUserId !== nextUserId) queryClient.clear();
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const client = supabase;
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      const user = session?.user ?? null;
      if (user && !user.email_confirmed_at) {
        commitState({ status: "signed-out", user: null });
        queueMicrotask(() => {
          void client.auth.signOut({ scope: "local" }).catch(() => undefined);
        });
        return;
      }
      if (event === "PASSWORD_RECOVERY" && user) {
        commitState({ status: "recovering", user });
      } else if (user) {
        const stillRecovering = stateRef.current.status === "recovering" && event !== "SIGNED_IN";
        commitState({ status: stillRecovering ? "recovering" : "signed-in", user });
      } else {
        commitState({ status: "signed-out", user: null });
      }
    });
    const appStateSubscription = AppState.addEventListener("change", (appState) => {
      if (appState === "active") client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    });
    if (AppState.currentState === "active") client.auth.startAutoRefresh();
    return () => {
      active = false;
      subscription.unsubscribe();
      appStateSubscription.remove();
      client.auth.stopAutoRefresh();
    };
  }, [commitState]);

  const completeRecovery = useCallback(() => {
    const currentUser: User | null = stateRef.current.user;
    if (stateRef.current.status === "recovering" && currentUser) {
      commitState({ status: "signed-in", user: currentUser });
    }
  }, [commitState]);
  return <AuthContext.Provider value={{ ...state, completeRecovery }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}