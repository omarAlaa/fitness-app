import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { useProfile, useUpdateProfile } from "@/features/profile/profile-queries";
import { validateProfileUpdate } from "@/features/profile/profile-validation";
import { AppButton } from "@/shared/ui/app-button";
import { AppScreen } from "@/shared/ui/app-screen";
import { AppText } from "@/shared/ui/app-text";
import { useAppTheme } from "@/shared/theme/theme-provider";
import type { UnitSystem } from "@/features/profile/profile-types";

export function ProfileScreen() {
  const { colors, radius, spacing } = useAppTheme();
  const profileQuery = useProfile();
  const updateMutation = useUpdateProfile();
  const [displayNameDraft, setDisplayNameDraft] = useState<string | undefined>(undefined);
  const [unitSystemDraft, setUnitSystemDraft] = useState<UnitSystem | undefined>(undefined);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (profileQuery.isPending) {
    return (
      <AppScreen>
        <View style={styles.center}>
          <ActivityIndicator accessibilityLabel="Loading profile" />
          <AppText>Loading your profile...</AppText>
        </View>
      </AppScreen>
    );
  }

  if (!profileQuery.data) {
    return (
      <AppScreen>
        <View style={styles.content}>
          <AppText variant="title">Profile</AppText>
          <AppText accessibilityRole="alert" style={{ color: colors.danger }}>
            {profileQuery.error instanceof Error ? profileQuery.error.message : "Your profile could not be loaded. Check your connection and try again."}
          </AppText>
          <AppButton label="Try again" onPress={() => void profileQuery.refetch()} />
        </View>
      </AppScreen>
    );
  }

  const displayName = displayNameDraft ?? profileQuery.data.display_name ?? "";
  const unitSystem = unitSystemDraft ?? profileQuery.data.unit_system;

  const save = () => {
    const result = validateProfileUpdate(displayName, unitSystem);
    if (!result.value) {
      setFieldError(result.errors.displayName ?? result.errors.unitSystem ?? "Check your profile details.");
      return;
    }
    setFieldError(null);
    setSaved(false);
    updateMutation.mutate(result.value, { onSuccess: (profile) => { setDisplayNameDraft(profile.display_name ?? ""); setUnitSystemDraft(profile.unit_system); setSaved(true); } });
  };

  return (
    <AppScreen>
      <View style={styles.content}>
        <AppText variant="title">Profile</AppText>
        <AppText>Manage your display name and preferred units.</AppText>
        <View style={{ gap: spacing.xs }}>
          <AppText>Display name</AppText>
          <TextInput
            accessibilityLabel="Display name"
            value={displayName}
            onChangeText={(value) => { setDisplayNameDraft(value); setSaved(false); }}
            maxLength={80}
            autoCapitalize="words"
            returnKeyType="done"
            testID="profile-display-name"
            style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md }]}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <AppText>Unit system</AppText>
          <View style={styles.units}>
            {(["metric", "imperial"] as const).map((unit) => {
              const selected = unitSystem === unit;
              return (
                <Pressable
                  key={unit}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => { setUnitSystemDraft(unit); setSaved(false); }}
                  style={[styles.unit, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface, borderRadius: radius.sm }]}
                  testID={`unit-${unit}`}
                >
                  <AppText style={{ color: selected ? colors.onPrimary : colors.text }}>{unit === "metric" ? "Metric" : "Imperial"}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        {fieldError ? <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{fieldError}</AppText> : null}
        {updateMutation.error ? <AppText accessibilityRole="alert" style={{ color: colors.danger }}>{updateMutation.error.message}</AppText> : null}
        {saved ? <AppText accessibilityRole="alert">Profile saved.</AppText> : null}
        <AppButton label={updateMutation.isPending ? "Saving..." : "Save profile"} onPress={save} disabled={updateMutation.isPending} testID="save-profile" />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  content: { flex: 1, justifyContent: "center", gap: 16 },
  units: { flexDirection: "row", gap: 12 },
  unit: { flex: 1, minHeight: 48, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  input: { minHeight: 48, borderWidth: 1, fontSize: 16 },
});