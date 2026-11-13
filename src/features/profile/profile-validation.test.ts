import { validateProfileUpdate } from "@/features/profile/profile-validation";

describe("profile validation", () => {
  it("trims display names and permits an empty name", () => {
    expect(validateProfileUpdate("  Omar  ", "metric").value).toEqual({ display_name: "Omar", unit_system: "metric" });
    expect(validateProfileUpdate("  ", "imperial").value).toEqual({ display_name: null, unit_system: "imperial" });
  });

  it("rejects display names over the database limit and unsupported units", () => {
    expect(validateProfileUpdate("x".repeat(81), "metric").errors.displayName).toBe("Use 80 characters or fewer.");
    expect(validateProfileUpdate("Name", "other").errors.unitSystem).toBe("Choose a supported unit system.");
  });
});