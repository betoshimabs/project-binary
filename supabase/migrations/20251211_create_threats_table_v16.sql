-- MIGRATION: 20251211_create_threats_table_v16.sql
-- Purpose: Create a table to track active threats (enemies) per character/campaign.

CREATE TABLE IF NOT EXISTS public.threats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_hp INTEGER DEFAULT 0,
    max_hp INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- 'active', 'defeated', 'fled'
    metadata JSONB DEFAULT '{}'::jsonb, -- Store extra visuals or traits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup during context generation
CREATE INDEX idx_threats_context ON public.threats(campaign_id, character_id, status);

-- Enable RLS
ALTER TABLE public.threats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own threats"
    ON public.threats
    FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM public.characters WHERE id = character_id
    ));
