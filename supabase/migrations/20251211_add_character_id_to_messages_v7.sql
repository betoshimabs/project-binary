-- MIGRATION: 20251211_add_character_id_to_messages_v7.sql
-- Purpose: Add 'character_id' to messages table to allow filtering chat history by character.
-- This prevents different characters in the same campaign from seeing each other's messages (unless desired).

-- 1. Add column
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE;

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_character_id ON public.messages(character_id);

-- 3. Update RLS (Optional, assuming existing RLS checks campaign_id)
-- If you have specific RLS for characters, ensure it allows access.
-- Generally, if a user owns the character, they can read the messages.
