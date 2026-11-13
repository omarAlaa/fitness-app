import type { ProfileUpdate, UnitSystem } from "@/features/profile/profile-types";

export type ProfileFieldErrors = Partial<Record<"displayName" | "unitSystem", string>>;

export function validateProfileUpdate(displayName: string, unitSystem: string): { value?: ProfileUpdate; errors: ProfileFieldErrors } {
  const normalizedName = displayName.trim();
  const errors: ProfileFieldErrors = {};
  if (normalizedName.length > 80) errors.displayName = "Use 80 characters or fewer.";
  if (unitSystem !== "metric" && unitSystem !== "imperial") errors.unitSystem = "Choose a supported unit system.";
  if (Object.keys(errors).length > 0) return { errors };
  return { value: { display_name: normalizedName.length === 0 ? null : normalizedName, unit_system: unitSystem as UnitSystem }, errors };
}