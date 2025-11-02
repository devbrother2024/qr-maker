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
          id: string
          user_id: string
          url: string
          foreground_color: string
          background_color: string
          logo_storage_path: string | null
          qr_image_storage_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          foreground_color?: string
          background_color?: string
          logo_storage_path?: string | null
          qr_image_storage_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          foreground_color?: string
          background_color?: string
          logo_storage_path?: string | null
          qr_image_storage_path?: string
          created_at?: string
          updated_at?: string
        }
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
  }
}

