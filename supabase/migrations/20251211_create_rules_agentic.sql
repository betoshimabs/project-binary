-- MIGRATION: 20251211_create_rules_agentic.sql
-- Purpose: Create 'rules' table and seed it with dynamic context modules for the Agentic AI.

-- 1. Create Table (if not exists)
CREATE TABLE IF NOT EXISTS public.rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('combat', 'magic', 'social', 'exploration', 'lore', 'inventory')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow read access to everyone (for now, or authenticated users)
-- Drop if exists to avoid error
DROP POLICY IF EXISTS "Allow read access to all users" ON public.rules;
CREATE POLICY "Allow read access to all users" ON public.rules
    FOR SELECT USING (true);

-- 4. SEED DATA (The "Knowledge Capsules")
-- Clear existing data to avoid duplicates/conflicts during development
TRUNCATE TABLE public.rules;

-- MODULE: COMBAT
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('combat', 'General Combat', 
'COMBAT RULES:
1. Initiative: d10 + Reflexes. Highest goes first.
2. Actions: 1 Major (Attack/Cast), 1 Minor (Move).
3. Attack Roll: Attribute + Skill + 1d10 vs Target TN (Defense).
4. Damage: Weapon Damage + Net Successes. Subtracted from Armor, then HP.
5. Critical: Natural 10 explodes (roll again +10).', 
ARRAY['attack', 'damage', 'initiative', 'weapon', 'fight']);

-- MODULE: MAGIC/NETRUNNING (Generic Cyberpunk equivalent)
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('magic', 'Netrunning / Hacking', 
'NETRUNNING RULES:
1. Access: Must be within range or jacked in.
2. Breach Protocol: INT + Hacking vs Firewall TN.
3. Quickhacks: Cost RAM. Instant effect.
4. ICE: Defensive programs that attack the runner. 
5. Overheat: Taking too much damage in Cyberspace causes physical damage.', 
ARRAY['hack', 'spell', 'cyber', 'ram', 'breach']);

-- MODULE: SOCIAL
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('social', 'Social Interaction', 
'SOCIAL RULES:
1. Persuasion: EMP + Persuasion vs Willpower.
2. Intimidation: BODY (Physical) or COOL (Psychological) + Intimidation.
3. Deception: COOL + Subterfuge vs Empathy.
4. NPCs: Have dispositions (Friendly, Neutral, Hostile). Actions shift this.', 
ARRAY['talk', 'lie', 'persuade', 'intimidate', 'convince']);

-- MODULE: EXPLORATION
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('exploration', 'Exploration & Stealth', 
'EXPLORATION RULES:
1. Stealth: DEX + Stealth vs Perception.
2. Perception: INT + Perception vs Stealth TN.
3. Travel: Fatigue checks every 4 hours (BODY + Endurance).
4. Scavenging: LUCK check for loot quality.', 
ARRAY['sneak', 'hide', 'search', 'travel', 'look']);

-- MODULE: LORE (Cyberpunk Setting)
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('lore', 'World Setting: Neo-Kyoto 2099', 
'SETTING:
The world is dominated by MegaCorps (Arasaka, Militech). 
The "Data Flux" is a corrupted version of the internet. 
Implants are common but cause Cyberpsychosis if overused.
The currency is "Credits" (€$).
The streets are dangerous, lit by neon and soaked in acid rain.', 
ARRAY['world', 'history', 'city', 'corporation', 'lore']);

-- MODULE: INVENTORY
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('inventory', 'Inventory & Equipment', 
'INVENTORY RULES:
1. Encumbrance: Max Carry = BODY * 10kg.
2. Weapons: Have tags (Light, Heavy, Silent).
3. Consumables: Medkits heal 1d6 HP. Stimpacks boost Reflexes.', 
ARRAY['item', 'bag', 'loot', 'equip']);
