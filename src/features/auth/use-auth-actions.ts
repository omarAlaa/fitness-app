import { useCallback, useState } from "react";

import {
  requestPasswordRecovery as requestRecovery,
  resendConfirmation as resendConfirmationEmail,
  signIn as signInWithPassword,
  signOut as signOutCurrentSession,
  signUp as signUpWithPassword,
  toAuthServiceError,
  updatePassword as setNewPassword,
  verifyAuthLink as verifyLink,
  type AuthLinkType,
  type AuthServiceError,
} from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

type AuthAction = "sign-in" | "sign-up" | "sign-out" | "recovery" | "verify-link" | "update-password" | "resend-confirmation";
type AuthActionResult<T> = { ok: true; value: T } | { ok: false };

export function useAuthActions() {
  const [pendingAction, setPendingAction] = useState<AuthAction | null>(null);
  const [error, setError] = useState<AuthServiceError | null>(null);
  const { completeRecovery } = useAuth();

  const run = useCallback(async <T,>(action: AuthAction, operation: () => Promise<T>): Promise<AuthActionResult<T>> => {
    setPendingAction(action);
    setError(null);
    try {
      return { ok: true, value: await operation() };
    } catch (cause) {
      setError(toAuthServiceError(cause, "The request couldn't be completed. Check your connection and try again."));
      return { ok: false };
    } finally {
      setPendingAction(null);
    }
  }, []);

  const signIn = useCallback((email: string, password: string) => run("sign-in", () => signInWithPassword(email, password)), [run]);
  const signUp = useCallback((email: string, password: string) => run("sign-up", () => signUpWithPassword(email, password)), [run]);
  const signOut = useCallback(() => run("sign-out", signOutCurrentSession), [run]);
  const requestPasswordRecovery = useCallback((email: string) => run("recovery", () => requestRecovery(email)), [run]);
  const resendConfirmation = useCallback((email: string) => run("resend-confirmation", () => resendConfirmationEmail(email)), [run]);
  const verifyAuthLink = useCallback((tokenHash: string, type: AuthLinkType) => run("verify-link", () => verifyLink(tokenHash, type)), [run]);
  const updatePassword = useCallback(async (password: string) => {
    const result = await run("update-password", () => setNewPassword(password));
    if (result.ok) completeRecovery();
    return result;
  }, [completeRecovery, run]);

  return {
    pendingAction,
    error,
    clearError: () => setError(null),
    signIn,
    signUp,
    signOut,
    requestPasswordRecovery,
    resendConfirmation,
    verifyAuthLink,
    updatePassword,
  };
}
