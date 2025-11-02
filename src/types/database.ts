export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      qr_history: {
        Row: {
          background_color: string
          created_at: string
          foreground_color: string
          id: string
          logo_storage_path: string | null
          qr_image_storage_path: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          background_color?: string
          created_at?: string
          foreground_color?: string
          id?: string
          logo_storage_path?: string | null
          qr_image_storage_path: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          background_color?: string
          created_at?: string
          foreground_color?: string
          id?: string
          logo_storage_path?: string | null
          qr_image_storage_path?: string
          updated_at?: string
          url?: string
          user_id?: string
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
