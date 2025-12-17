-- MIGRATION: 20251211_add_mutable_stats_v8.sql
-- Purpose: Add proper tracking for Current HP and Current Mana.
-- Without this, the AI has to guess or rely on short-term memory for damage/costs.

ALTER TABLE public.characters 
ADD COLUMN IF NOT EXISTS current_hp INTEGER DEFAULT 10,  -- Current HP
ADD COLUMN IF NOT EXISTS max_hp INTEGER DEFAULT 10,      -- Max HP default
ADD COLUMN IF NOT EXISTS current_mp INTEGER DEFAULT 5,   -- Current Mana
ADD COLUMN IF NOT EXISTS max_mp INTEGER DEFAULT 5;       -- Max Mana default

-- Note: In the application, these should be calculated based on attributes:
-- Max HP = Base(10) + Brute
-- Max MP = Base(5) + Intelligence
