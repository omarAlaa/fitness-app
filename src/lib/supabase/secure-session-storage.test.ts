/* eslint-disable import/first */
import { secureSessionStorage } from "@/lib/supabase/client";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from "expo-secure-store";

describe("secure session storage adapter", () => {
  it("round-trips a persisted session value through native secure storage", async () => {
    const values = new Map<string, string>();
    jest.mocked(SecureStore.setItemAsync).mockImplementation(async (key, value) => { values.set(key, value); });
    jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key) => values.get(key) ?? null);
    jest.mocked(SecureStore.deleteItemAsync).mockImplementation(async (key) => { values.delete(key); });

    await secureSessionStorage.setItem("auth-token", JSON.stringify({ refresh_token: "test-refresh" }));
    await expect(secureSessionStorage.getItem("auth-token")).resolves.toBe(JSON.stringify({ refresh_token: "test-refresh" }));
    await secureSessionStorage.removeItem("auth-token");
    await expect(secureSessionStorage.getItem("auth-token")).resolves.toBeNull();
  });
});
