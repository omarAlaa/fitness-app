import { validateNewPassword, validateRegistration, validateRecoveryEmail, validateSignIn } from "@/features/auth/auth-validation";

describe("auth form validation", () => {
  it("rejects malformed email and missing password on sign in", () => {
    expect(validateSignIn("bad-email", "")).toEqual({ email: "Enter a valid email address.", password: "Enter your password." });
  });

  it("accepts a valid sign-in draft", () => {
    expect(validateSignIn(" person@example.com ", "pw")).toEqual({});
  });

  it("requires matching registration passwords", () => {
    expect(validateRegistration("person@example.com", "long-enough", "different")).toEqual({ confirmPassword: "Passwords do not match." });
  });

  it("requires at least eight characters for new passwords", () => {
    expect(validateNewPassword("short", "short")).toEqual({ password: "Use at least 8 characters." });
  });

  it("validates recovery email without checking whether an account exists", () => {
    expect(validateRecoveryEmail("person@example.com")).toEqual({});
  });
});
