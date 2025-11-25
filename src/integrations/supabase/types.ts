export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string | null
          id: string
          job_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          id?: string
          job_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string | null
          description: string
          id: string
          location: string
          posted_by: string | null
          requirements: string[]
          salary: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          description: string
          id?: string
          location: string
          posted_by?: string | null
          requirements?: string[]
          salary?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string
          id?: string
          location?: string
          posted_by?: string | null
          requirements?: string[]
          salary?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          viewed_at: string | null
          viewed_user_id: string | null
          viewer_user_id: string | null
        }
        Insert: {
          id?: string
          viewed_at?: string | null
          viewed_user_id?: string | null
          viewer_user_id?: string | null
        }
        Update: {
          id?: string
          viewed_at?: string | null
          viewed_user_id?: string | null
          viewer_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          position: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          position?: string | null
          updated_at?: string | null
          user_type: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          position?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          file_name: string
          file_path: string
          id: string
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          id: string
          job_id: string | null
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          id: string
          skill: string
          user_id: string | null
        }
        Insert: {
          id?: string
          skill: string
          user_id?: string | null
        }
        Update: {
          id?: string
          skill?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
