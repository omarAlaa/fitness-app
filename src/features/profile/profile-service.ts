import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";
import type { FitnessGoal, FitnessGoalInsert, FitnessGoalUpdate, Profile, ProfileUpdate } from "@/features/profile/profile-types";

export class ProfileServiceError extends Error {
  readonly code: string | undefined;
  constructor(message: string, code?: string) { super(message); this.name = "ProfileServiceError"; this.code = code; }
}

function getClient() {
  if (!supabase) throw new ProfileServiceError("Profile services are unavailable. Check the app configuration.");
  return supabase;
}

function throwSafeDatabaseError(error: PostgrestError): never {
  if (error.code === "23505") throw new ProfileServiceError("The profile changed elsewhere. Refresh and try again.", error.code);
  if (error.code === "42501") throw new ProfileServiceError("You don't have permission to make that change.", error.code);
  if (error.code === "PGRST116") throw new ProfileServiceError("The requested record could not be found.", error.code);
  throw new ProfileServiceError("The request couldn't be completed. Check your connection and try again.", error.code);
}

async function findProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getClient().from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throwSafeDatabaseError(error);
  return data;
}

export async function getProfile(userId: string): Promise<Profile> {
  const existing = await findProfile(userId);
  if (existing) return existing;
  const { data, error } = await getClient().from("profiles").insert({ id: userId }).select("*").single();
  if (!error) return data;
  if (error.code === "23505") {
    const racedProfile = await findProfile(userId);
    if (racedProfile) return racedProfile;
  }
  throwSafeDatabaseError(error);
}

export async function updateProfile(userId: string, input: ProfileUpdate): Promise<Profile> {
  const { data, error } = await getClient().from("profiles").update(input).eq("id", userId).select("*").maybeSingle();
  if (error) throwSafeDatabaseError(error);
  if (!data) throw new ProfileServiceError("Your profile is unavailable. Refresh and try again.", "profile_missing");
  return data;
}

export async function listFitnessGoals(userId: string): Promise<FitnessGoal[]> {
  const { data, error } = await getClient().from("fitness_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throwSafeDatabaseError(error);
  return data;
}

export async function createFitnessGoal(userId: string, input: Omit<FitnessGoalInsert, "user_id">): Promise<FitnessGoal> {
  const { data, error } = await getClient().from("fitness_goals").insert({ ...input, user_id: userId }).select("*").single();
  if (error) throwSafeDatabaseError(error);
  return data;
}

export async function updateFitnessGoal(goalId: string, input: FitnessGoalUpdate): Promise<FitnessGoal> {
  const { data, error } = await getClient().from("fitness_goals").update(input).eq("id", goalId).select("*").maybeSingle();
  if (error) throwSafeDatabaseError(error);
  if (!data) throw new ProfileServiceError("This goal is unavailable. Refresh and try again.", "goal_missing");
  return data;
}

export async function deleteFitnessGoal(goalId: string): Promise<void> {
  const { error } = await getClient().from("fitness_goals").delete().eq("id", goalId);
  if (error) throwSafeDatabaseError(error);
}