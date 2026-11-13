import type { ReactNode } from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";

import { SignUpScreen } from "@/features/auth/screens/sign-up-screen";
import { ThemeProvider } from "@/shared/theme/theme-provider";

const mockSignUp = jest.fn();

jest.mock("@/features/auth/use-auth-actions", () => ({
  useAuthActions: () => ({ pendingAction: null, error: null, signUp: mockSignUp }),
}));
jest.mock("expo-router", () => {
  const { Text } = jest.requireActual("react-native") as typeof import("react-native");
  return { Link: ({ children }: { children: ReactNode }) => <Text>{children}</Text> };
});

describe("sign-up screen", () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignUp.mockResolvedValue({ ok: true, value: undefined });
  });

  it("validates then submits registration and shows email confirmation state", async () => {
    await render(<ThemeProvider><SignUpScreen /></ThemeProvider>);
    await fireEvent.changeText(screen.getByTestId("email-input"), "person@example.com");
    await fireEvent.changeText(screen.getByTestId("password-input"), "password1");
    await fireEvent.changeText(screen.getByTestId("confirm-password-input"), "password1");
    await fireEvent.press(screen.getByTestId("sign-up-button"));
    expect(mockSignUp).toHaveBeenCalledWith("person@example.com", "password1");
    expect(await screen.findByText(/Check your email for a confirmation link/)).toBeTruthy();
  });
});

