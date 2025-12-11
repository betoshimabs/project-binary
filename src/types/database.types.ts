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
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          language: string | null
          max_tokens: number | null
          metadata: Json | null
          model: string | null
          system_prompt: string | null
          temperature: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          system_prompt?: string | null
          temperature?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          max_tokens?: number | null
          metadata?: Json | null
          model?: string | null
          system_prompt?: string | null
          temperature?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          attributes: Json | null
          avatar_url: string | null
          campaign_id: string | null
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          name: string
          origin_description: string | null
          physical_description: string | null
          skills: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attributes?: Json | null
          avatar_url?: string | null
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          name: string
          origin_description?: string | null
          physical_description?: string | null
          skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attributes?: Json | null
          avatar_url?: string | null
          campaign_id?: string | null
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          name?: string
          origin_description?: string | null
          physical_description?: string | null
          skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      context_summaries: {
        Row: {
          campaign_id: string
          created_at: string
          embedding: string | null
          id: string
          summary: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          embedding?: string | null
          id?: string
          summary: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          embedding?: string | null
          id?: string
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          character_id: string | null
          created_at: string
          data: Json | null
          description: string | null
          effect: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          effect?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          data?: Json | null
          description?: string | null
          effect?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          campaign_id: string
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          category: string
          content: string
          created_at: string
          embedding: string | null
          id: string
          keywords: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          keywords?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_prompts: {
        Row: {
          description: string | null
          id: string
          key: string
          template: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          template: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          template?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          theme: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          theme?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          theme?: string
          user_id?: string
        }
        Relationships: []
      }
      worlds: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
      | {
        Args: {
          embedding: string
        }
        Returns: string
      }
      | {
        Args: {
          embedding: string
        }
        Returns: string
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: number[]
      }
      halfvec_out: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      l2_normalize:
      | {
        Args: {
          "": string
        }
        Returns: string
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      | {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": string[]
        }
        Returns: string
      }
      vector_dims:
      | {
        Args: {
          "": string
        }
        Returns: number
      }
      | {
        Args: {
          "": unknown
        }
        Returns: number
      }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
