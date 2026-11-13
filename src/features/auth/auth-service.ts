import { AuthError } from "@supabase/supabase-js";
import * as Linking from "expo-linking";

import { supabase } from "@/lib/supabase/client";

export type AuthLinkType = "email" | "recovery";

export class AuthServiceError extends Error {
  constructor(
    message: string,
    readonly code: string = "unknown",
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

function getClient() {
  if (!supabase) {
    throw new AuthServiceError(
      "Authentication is not configured. Check the app's public Supabase environment variables.",
      "configuration",
    );
  }
  return supabase;
}

function getAuthError(error: AuthError, fallbackMessage: string): AuthServiceError {
  if (error.code === "invalid_credentials") {
    return new AuthServiceError("Email or password is incorrect.", error.code);
  }
  if (error.code === "email_not_confirmed") {
    return new AuthServiceError("Confirm your email before signing in.", error.code);
  }
  if (error.code === "weak_password") {
    return new AuthServiceError("Choose a stronger password.", error.code);
  }
  if (error.code === "over_email_send_rate_limit") {
    return new AuthServiceError("Too many email requests. Wait a little and try again.", error.code);
  }
  if (error.name === "AuthRetryableFetchError") {
    return new AuthServiceError("A network error occurred. Check your connection and try again.", "network");
  }
  return new AuthServiceError(fallbackMessage, error.code ?? "unknown");
}

function authRedirectUrl(): string {
  return Linking.createURL("auth/callback", { scheme: "fitnessapp" });
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await getClient().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw getAuthError(error, "Unable to sign in. Try again.");
}

export async function signUp(email: string, password: string): Promise<void> {
  const client = getClient();
  const { error } = await client.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) throw getAuthError(error, "Unable to create your account. Try again.");

}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await getClient().auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: authRedirectUrl() },
  });
  if (error) throw getAuthError(error, "Unable to resend the confirmation email. Try again.");
}

export async function signOut(): Promise<void> {
  const { error } = await getClient().auth.signOut({ scope: "local" });
  if (error) throw getAuthError(error, "Unable to sign out. Try again.");
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  const { error } = await getClient().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: authRedirectUrl(),
  });
  if (error) throw getAuthError(error, "Unable to send the recovery email. Try again.");
}

export async function verifyAuthLink(tokenHash: string, type: AuthLinkType): Promise<void> {
  const { error } = await getClient().auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) throw getAuthError(error, "This link is invalid or has expired. Request a new email and try again.");
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await getClient().auth.updateUser({ password });
  if (error) throw getAuthError(error, "Unable to update your password. Try again.");
}

export function toAuthServiceError(error: unknown, fallbackMessage: string): AuthServiceError {
  if (error instanceof AuthServiceError) return error;
  if (error instanceof AuthError) return getAuthError(error, fallbackMessage);
  return new AuthServiceError(fallbackMessage);
}



