-- MIGRATION: 20251211_add_advantage_rule_db_v14.sql
-- Purpose: Formalize the Advantage/Disadvantage mechanic in the Rules table (Category: Core).

INSERT INTO public.rules (category, title, content, keywords)
VALUES (
    'core',
    'Advantage & Disadvantage (Circumstance)',
    'RULE OF CIRCUMSTANCE:
1. The GM may Modify the Dice Pool based on the situation.
   - ADVANTAGE: Add +1 to +3 Dice. (e.g., High ground, flanking, help, preparation).
   - DISADVANTAGE: Subtract -1 to -3 Dice. (e.g., Rain, darkness, slippery floor, injury, suppression).
2. TRANSPARENCY REQUIRED:
   - The GM MUST explicitly state the modifier in the narration request.
   - Format: "Role X Dice (Base Y +/- Z Reason)".
   - Example: "Role 3 Dice (Fluido 4 - 1 Rain)".',
    ARRAY['advantage', 'disadvantage', 'modifier', 'bonus', 'penalty', 'dice']
);
