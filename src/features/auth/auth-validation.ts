export type AuthFieldErrors = Partial<Record<"email" | "password" | "confirmPassword", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return "Enter your email address.";
  if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter your password.";
  if (password.length < 8) return "Use at least 8 characters.";
  return undefined;
}

export function validateSignIn(email: string, password: string): AuthFieldErrors {
  return {
    ...(validateEmail(email) ? { email: validateEmail(email) } : {}),
    ...(password ? {} : { password: "Enter your password." }),
  };
}

export function validateRegistration(
  email: string,
  password: string,
  confirmPassword: string,
): AuthFieldErrors {
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  return {
    ...(emailError ? { email: emailError } : {}),
    ...(passwordError ? { password: passwordError } : {}),
    ...(confirmPassword !== password ? { confirmPassword: "Passwords do not match." } : {}),
  };
}

export function validateRecoveryEmail(email: string): AuthFieldErrors {
  const emailError = validateEmail(email);
  return emailError ? { email: emailError } : {};
}

export function validateNewPassword(password: string, confirmPassword: string): AuthFieldErrors {
  const passwordError = validatePassword(password);
  return {
    ...(passwordError ? { password: passwordError } : {}),
    ...(confirmPassword !== password ? { confirmPassword: "Passwords do not match." } : {}),
  };
}
