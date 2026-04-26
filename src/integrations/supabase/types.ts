export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animal_rescues: {
        Row: {
          animal_type: string | null
          complaint_id: string | null
          condition_note: string | null
          created_at: string
          donations_total: number
          eta_minutes: number | null
          id: string
          ngo_id: string | null
          priority: Database["public"]["Enums"]["severity"]
          reporter_id: string | null
          rescue_status: string
          treatment_photo_url: string | null
          updated_at: string
        }
        Insert: {
          animal_type?: string | null
          complaint_id?: string | null
          condition_note?: string | null
          created_at?: string
          donations_total?: number
          eta_minutes?: number | null
          id?: string
          ngo_id?: string | null
          priority?: Database["public"]["Enums"]["severity"]
          reporter_id?: string | null
          rescue_status?: string
          treatment_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          animal_type?: string | null
          complaint_id?: string | null
          condition_note?: string | null
          created_at?: string
          donations_total?: number
          eta_minutes?: number | null
          id?: string
          ngo_id?: string | null
          priority?: Database["public"]["Enums"]["severity"]
          reporter_id?: string | null
          rescue_status?: string
          treatment_photo_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_rescues_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_updates: {
        Row: {
          actor_id: string | null
          complaint_id: string
          created_at: string
          id: string
          note: string | null
          proof_url: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Insert: {
          actor_id?: string | null
          complaint_id: string
          created_at?: string
          id?: string
          note?: string | null
          proof_url?: string | null
          status: Database["public"]["Enums"]["complaint_status"]
        }
        Update: {
          actor_id?: string | null
          complaint_id?: string
          created_at?: string
          id?: string
          note?: string | null
          proof_url?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_votes: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          user_id: string
          vote_type: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_votes_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          address: string | null
          ai_confidence: number | null
          ai_reason: string | null
          ai_verified: boolean
          assigned_to: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          created_at: string
          description: string
          id: string
          lat: number
          lng: number
          photo_url: string | null
          pressure_score: number
          resolved_photo_url: string | null
          severity: Database["public"]["Enums"]["severity"]
          sla_deadline: string | null
          sla_hours: number
          status: Database["public"]["Enums"]["complaint_status"]
          ticket_id: string
          title: string
          updated_at: string
          upvotes: number
          user_id: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          ai_confidence?: number | null
          ai_reason?: string | null
          ai_verified?: boolean
          assigned_to?: string | null
          category: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description: string
          id?: string
          lat: number
          lng: number
          photo_url?: string | null
          pressure_score?: number
          resolved_photo_url?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          sla_deadline?: string | null
          sla_hours?: number
          status?: Database["public"]["Enums"]["complaint_status"]
          ticket_id: string
          title: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          ai_confidence?: number | null
          ai_reason?: string | null
          ai_verified?: boolean
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["complaint_category"]
          created_at?: string
          description?: string
          id?: string
          lat?: number
          lng?: number
          photo_url?: string | null
          pressure_score?: number
          resolved_photo_url?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          sla_deadline?: string | null
          sla_hours?: number
          status?: Database["public"]["Enums"]["complaint_status"]
          ticket_id?: string
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
          ward?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: string[]
          created_at: string
          display_name: string | null
          id: string
          impact_score: number
          trust_score: number
          updated_at: string
          ward: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[]
          created_at?: string
          display_name?: string | null
          id: string
          impact_score?: number
          trust_score?: number
          updated_at?: string
          ward?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[]
          created_at?: string
          display_name?: string | null
          id?: string
          impact_score?: number
          trust_score?: number
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "officer" | "ngo" | "citizen"
      complaint_category:
        | "road"
        | "garbage"
        | "lights"
        | "water"
        | "park"
        | "noise"
        | "animal"
      complaint_status:
        | "raised"
        | "approved"
        | "assigned"
        | "in_progress"
        | "completed"
        | "rejected"
        | "reopened"
      severity: "low" | "medium" | "high" | "critical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "officer", "ngo", "citizen"],
      complaint_category: [
        "road",
        "garbage",
        "lights",
        "water",
        "park",
        "noise",
        "animal",
      ],
      complaint_status: [
        "raised",
        "approved",
        "assigned",
        "in_progress",
        "completed",
        "rejected",
        "reopened",
      ],
      severity: ["low", "medium", "high", "critical"],
    },
  },
} as const
