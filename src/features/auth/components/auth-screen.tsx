import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { AppText } from "@/shared/ui/app-text";
import { AppScreen } from "@/shared/ui/app-screen";

export function AuthScreen({ title, description, children }: PropsWithChildren<{ title: string; description: string }>) {
  return (
    <AppScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <AppText variant="title">{title}</AppText>
          <AppText>{description}</AppText>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { flexGrow: 1, justifyContent: "center", gap: 16, paddingVertical: 24 } });
