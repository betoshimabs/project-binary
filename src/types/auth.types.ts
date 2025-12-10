import type { User, Session } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  role: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export interface AuthProviderProps {
  children: React.ReactNode
}
