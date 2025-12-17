-- MIGRATION: 20251211_simplify_advantage_rule_v15.sql
-- Purpose: Simplify Advantage/Disadvantage to fixed +/- 1 Dice (User Request).

UPDATE public.rules
SET content = 'RULE OF CIRCUMSTANCE:
1. The GM may Modify the Dice Pool based on the situation.
   - ADVANTAGE: Add +1 Dice. (e.g., High ground, flanking, help, preparation).
   - DISADVANTAGE: Subtract -1 Dice. (e.g., Rain, darkness, slippery floor, injury, suppression).
2. TRANSPARENCY REQUIRED:
   - The GM MUST explicitly state the modifier in the narration request.
   - Format: "Role X Dice (Base Y +/- Z Reason)".
   - Example: "Role 3 Dice (Fluido 4 - 1 Rain)".'
WHERE title = 'Advantage & Disadvantage (Circumstance)';
