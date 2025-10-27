/**
 * Database Types
 *
 * Este arquivo contém os types TypeScript para o seu banco de dados Supabase.
 *
 * Para gerar automaticamente os types baseados no seu schema:
 * 1. Instale o Supabase CLI: npm install -D supabase
 * 2. Configure suas credenciais
 * 3. Execute: npm run generate:types
 *
 * Por enquanto, este é um template genérico.
 * Atualize conforme seu schema do Supabase.
 */

export interface Database {
  public: {
    Tables: {
      // Exemplo de tabela - substitua pelo seu schema real
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
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
