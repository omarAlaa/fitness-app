/* eslint-disable import/first */
jest.mock("expo-linking", () => ({ createURL: jest.fn(() => "fitnessapp://auth/callback") }));
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resend: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      verifyOtp: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

import { AuthError, type SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { requestPasswordRecovery, resendConfirmation, signIn, signOut, signUp, updatePassword, verifyAuthLink } from "@/features/auth/auth-service";

const auth = (supabase as unknown as SupabaseClient).auth;

describe("auth service", () => {
  beforeEach(() => jest.clearAllMocks());

  it("signs in with the normalized email and returns safe invalid-credential errors", async () => {
    jest.mocked(auth.signInWithPassword).mockResolvedValue({ data: { user: null, session: null }, error: new AuthError("secret provider message", 400, "invalid_credentials") });
    await expect(signIn(" person@example.com ", "password1")).rejects.toMatchObject({
      name: "AuthServiceError",
      message: "Email or password is incorrect.",
      code: "invalid_credentials",
    });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "person@example.com", password: "password1" });
  });

  it("registers with an email confirmation callback", async () => {
    jest.mocked(auth.signUp).mockResolvedValue({ data: { user: null, session: null }, error: null });
    await expect(signUp("person@example.com", "password1")).resolves.toBeUndefined();
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "password1",
      options: { emailRedirectTo: "fitnessapp://auth/callback" },
    });
  });

  it("clears only the current local session on logout", async () => {
    jest.mocked(auth.signOut).mockResolvedValue({ error: null });
    await signOut();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("sends confirmation and recovery links to the app callback", async () => {
    jest.mocked(auth.resend).mockResolvedValue({ data: { user: null, session: null }, error: null });
    jest.mocked(auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });
    await resendConfirmation("person@example.com");
    await requestPasswordRecovery("person@example.com");
    expect(auth.resend).toHaveBeenCalledWith({ type: "signup", email: "person@example.com", options: { emailRedirectTo: "fitnessapp://auth/callback" } });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", { redirectTo: "fitnessapp://auth/callback" });
  });

  it("verifies only the supplied callback type and updates a recovery password", async () => {
    jest.mocked(auth.verifyOtp).mockResolvedValue({ data: { user: null, session: null }, error: null });
    jest.mocked(auth.updateUser).mockResolvedValue({ data: { user: {} as never }, error: null });
    await verifyAuthLink("one-time-token-hash", "recovery");
    await updatePassword("new-password1");
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "one-time-token-hash", type: "recovery" });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "new-password1" });
  });
});


