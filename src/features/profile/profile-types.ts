import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Pick<Database["public"]["Tables"]["profiles"]["Update"], "display_name" | "unit_system">;
export type UnitSystem = Profile["unit_system"];
export type FitnessGoal = Database["public"]["Tables"]["fitness_goals"]["Row"];
export type FitnessGoalInsert = Database["public"]["Tables"]["fitness_goals"]["Insert"];
export type FitnessGoalUpdate = Pick<Database["public"]["Tables"]["fitness_goals"]["Update"], "title" | "target_value" | "target_unit" | "start_date" | "target_date" | "status">;