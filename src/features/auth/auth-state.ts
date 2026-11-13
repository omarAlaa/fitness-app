import type { User } from "@supabase/supabase-js";

export type AuthStatus = "initializing" | "signed-out" | "signed-in" | "recovering" | "configuration-error";

export type AuthState = {
  status: AuthStatus;
  user: User | null;
};

export type AuthRouteAccess = {
  loading: boolean;
  auth: boolean;
  app: boolean;
  recovery: boolean;
};

export function getAuthRouteAccess(status: AuthStatus): AuthRouteAccess {
  return {
    loading: status === "initializing" || status === "configuration-error",
    auth: status === "signed-out",
    app: status === "signed-in",
    recovery: status === "recovering",
  };
}

export function getAuthHome(status: AuthStatus): "/sign-in" | "/today" | "/reset-password" | "/loading" {
  if (status === "initializing" || status === "configuration-error") return "/loading";
  if (status === "recovering") return "/reset-password";
  if (status === "signed-in") return "/today";
  return "/sign-in";
}
