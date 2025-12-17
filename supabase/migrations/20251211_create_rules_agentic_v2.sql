-- MIGRATION: 20251211_create_rules_agentic_v2.sql
-- Purpose: Create 'rules' table and seed it with the ACTUAL Project Binary rules extracted from AdminRules.tsx
-- This enables the Agentic AI to understand the specific "Even/Odd" system, Brute/Fluid attributes, etc.

-- 1. Create Table (if not exists)
CREATE TABLE IF NOT EXISTS public.rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('core', 'combat', 'attributes', 'resources', 'skills', 'progression', 'lore')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Clean existing data to avoid duplicates
TRUNCATE TABLE public.rules;

-- 3. SEED DATA (Extracted from AdminRules.tsx)

-- CAPSULE 1: CORE MECHANICS (The Binary System)
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('core', 'The Binary System (Dice Rules)', 
'CORE RULES:
1. Dice: We ONLY use the D8 (8-sided die).
2. Success: EVENS (2, 4, 6, 8) = 1 Success. ODDS (1, 3, 5, 7) = 0 Fail.
3. Overclock: Rolling an 8 is a CRITICAL SUCCESS. It counts as 1 Success AND you roll again. If even, add +1. Repeat while rolling 8s.
4. Checks: Roll number of dice equal to Attribute. Count successes.
   - Example: 3, 4, 8. -> 3(Odd, 0), 4(Even, 1), 8(Even+Reroll). Reroll=2(Even, 1). Total = 3 Successes.',
ARRAY['dice', 'roll', 'd8', 'success', 'fail', 'overclock', 'check']);

-- CAPSULE 2: ATTRIBUTES (Brute/Fluid, etc)
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('attributes', 'Attributes & Stats', 
'ATTRIBUTES:
Attributes work in pairs (8 points total per pair). If one is high, the other is low.
1. BRUTE vs FLUID:
   - BRUTE: Strength, resistance, poison save, lifting.
   - FLUID: Agility, running, acrobatics, aiming.
2. INTELLIGENCE vs INSTINCT:
   - INT: Logic, machines, knowledge.
   - INST: Perception, danger sense, reflexes.
3. PRESENCE vs SUBTLETY:
   - PRES: Leadership, intimidation, will.
   - SUBT: Stealth, deception, hiding.',
ARRAY['attribute', 'stat', 'brute', 'fluid', 'intelligence', 'instinct', 'presence', 'subtlety']);

-- CAPSULE 3: COMBAT
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('combat', 'Binary Combat Rules', 
'COMBAT SEQUENCE:
1. Initiative: Everyone rolls FLUID. Highest successes acts first.
2. Attacking: Choose weapon. Roll its Attribute (e.g., Axe=Brute, Bow=Fluid). Count Successes.
3. Defending: Target rolls Defense Attribute (Brute to Block, Fluid to Dodge). Count Successes.
4. Damage Calculation: Attack Successes - Defense Successes = DAMAGE.
   - (If result <= 0, no damage).',
ARRAY['fight', 'attack', 'defense', 'damage', 'initiative', 'weapon', 'armor']);

-- CAPSULE 4: RESOURCES (HP & Mana)
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('resources', 'Health & Mana (Visual)', 
'RESOURCES:
1. HEALTH [♥]: Represented by Hearts. 1 Damage = -1 Heart. 0 Hearts = Death.
2. MANA [■]: Represented by Bits. Used for Active Skills.
   - Cost is paid by erasing Bits [■] -> [ ].
   - Recovered by resting or items.',
ARRAY['hp', 'health', 'heart', 'mana', 'bit', 'energy', 'die']);

-- CAPSULE 5: SKILLS
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('skills', 'Abilities & Memory Limit', 
'SKILL SLOTS:
Character has limited memory (3 Slots max):
1. 1 PASSIVE: Always on, no cost. Chosen at creation. Cannot change.
2. 2 ACTIVES: Powerful effects, cost Mana (Bits).
   - SUBSTITUTION RULE: To learn a new Active skill, you MUST forget an old one.',
ARRAY['skill', 'ability', 'passive', 'active', 'spell', 'power']);

-- CAPSULE 6: PROGRESSION
INSERT INTO public.rules (category, title, content, keywords) VALUES 
('progression', 'Level Up (XP Bar)', 
'EVOLUTION:
XP Bar has 8 slots: [ ][ ][ ][ ][ ][ ][ ][ ].
- GM marks [X] for mission success.
- When full (8/8), Level Up!
- REWARD: Choose ONE: +1 Max Heart [♥] OR +1 Max Bit [■].',
ARRAY['xp', 'level', 'level up', 'evolution', 'experience']);

-- 4. Enable RLS (Safety Check)
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read access to all users" ON public.rules;
CREATE POLICY "Allow read access to all users" ON public.rules FOR SELECT USING (true);
