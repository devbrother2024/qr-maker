import type { User as SupabaseUser } from '@supabase/supabase-js'

export type User = SupabaseUser

export interface AuthSession {
  user: User | null
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  } | null
}

export interface AuthState {
  user: User | null
  session: AuthSession['session'] | null
  loading: boolean
  error: Error | null
}

