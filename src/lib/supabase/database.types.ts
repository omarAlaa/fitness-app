export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; unit_system: "metric" | "imperial"; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; unit_system?: "metric" | "imperial"; created_at?: string; updated_at?: string };
        Update: { display_name?: string | null; unit_system?: "metric" | "imperial"; updated_at?: string };
        Relationships: [];
      };
      fitness_goals: {
        Row: { id: string; user_id: string; title: string; target_value: number | null; target_unit: string | null; start_date: string; target_date: string | null; status: "active" | "completed" | "paused" | "archived"; created_at: string; updated_at: string };
        Insert: { id?: string; user_id: string; title: string; target_value?: number | null; target_unit?: string | null; start_date?: string; target_date?: string | null; status?: "active" | "completed" | "paused" | "archived"; created_at?: string; updated_at?: string };
        Update: { title?: string; target_value?: number | null; target_unit?: string | null; start_date?: string; target_date?: string | null; status?: "active" | "completed" | "paused" | "archived"; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};