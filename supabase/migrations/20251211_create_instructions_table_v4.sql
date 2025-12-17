-- MIGRATION: 20251211_create_instructions_table_v4.sql
-- Purpose: Create a dedicated 'instructions' table for modular narrative guidelines.
-- Separates "Mindset Modules" from generic "System Prompts".

-- 1. Create Table
CREATE TABLE IF NOT EXISTS public.instructions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('combat', 'magic', 'social', 'exploration', 'lore', 'inventory')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.instructions ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow read access to all users (same as rules)
DROP POLICY IF EXISTS "Allow read access to all users" ON public.instructions;
CREATE POLICY "Allow read access to all users" ON public.instructions
    FOR SELECT USING (true);

-- 4. SEED DATA (Moved from System Prompts -> Instructions)
TRUNCATE TABLE public.instructions;

-- INSTRUCTION: COMBAT
INSERT INTO public.instructions (category, title, content) VALUES 
('combat', 'Combat Narrative Guidelines', 
'MÓDULO DE COMBATE:
    
DIRETRIZES:
1. Iniciativa: Peça teste de FLUIDO.
2. Ataque/Defesa: Contagem de Sucessos (Pares 2,4,6,8). Explosão no 8.
3. Dano: (Sucessos Ataque - Sucessos Defesa). >0 Remove Corações. <=0 Bloqueado/Esquivado.
4. Narrativa: Se Dano=0 mas Ataque>Defesa, descreva vantagem narrativa (empurrão/desequilíbrio).

EXEMPLO DE COMPORTAMENTO (COMBATE):
Usuário: "Ataquei com machado. Tirei 2, 5, 8, 4 (no 8 explodiu e deu 1 no dado extra)."
IA: "Cálculo:
2 (Par)=1. 5 (Ímpar)=0. 8 (Par+Explosão)->1(Ímpar)=1 Total. 4 (Par)=1.
Total Ataque: 3 Sucessos.
Guarda defende (BRUTO): 1 Sucesso.
Resultado: 3 - 1 = 2 Dano.
Narrativa: O machado rasga o ombro dele, apagando 2 Corações. Ele recua gritando. O que faz?"');

-- INSTRUCTION: SOCIAL
INSERT INTO public.instructions (category, title, content) VALUES 
('social', 'Social Narrative Guidelines', 
'MÓDULO SOCIAL:

ATRIBUTOS SOCIAIS:
- Presença (Liderança/Intimidação) vs Sutileza (Furtividade/Mentira).
- Inteligência (Lógica) vs Instinto (Intuição).

DIRETRIZES:
1. NPCs devem ter personalidade distinta.
2. Testes Sociais seguem a regra padrão (TN: Fácil=1, Médio=2, Difícil=3).
3. Falhas sociais têm consequências imediatas (hostilidade, perda de confiança).');

-- INSTRUCTION: EXPLORATION
INSERT INTO public.instructions (category, title, content) VALUES 
('exploration', 'Exploration & Skill Guidelines', 
'MÓDULO EXPLORAÇÃO / PERÍCIA:

RESOLUÇÃO DE TESTES (TN):
- Fácil: 1 Sucesso.
- Médio: 2 Sucessos.
- Difícil: 3 Sucessos.
- Impossível: 4+ Sucessos.

EXEMPLO DE COMPORTAMENTO (PERÍCIA):
Usuário: "Quero hackear o painel."
IA: "O painel solta faíscas. Exige lógica. Role INTELIGÊNCIA. Dificuldade Média (preciso de 2 Sucessos)."');

-- INSTRUCTION: MAGIC (Netrunning/Abilities)
INSERT INTO public.instructions (category, title, content) VALUES 
('magic', 'Magic & Abilities Guidelines', 
'MÓDULO MAGIA / NETRUNNING / HABILIDADES:

DIRETRIZES:
1. Custo: Habilidades Ativas têm custo em BITS (Mana).
2. Verificação: Verifique se o jogador tem Bits suficientes [■].
   - Se tiver: Narre o efeito e peça para apagar os Bits.
   - Se não tiver: A habilidade falha ou consome Vida (se agressivo).
3. Limite: Max 1 Passiva e 2 Ativas.');

-- INSTRUCTION: LORE (World)
INSERT INTO public.instructions (category, title, content) VALUES 
('lore', 'Lore & World Guidelines', 
'MÓDULO LORE:
DIRETRIZES:
1. Contexto: Use elementos do cenário Cyberpunk (chuva ácida, neon, mega-corporações) nas descrições.
2. Profundidade: Responda perguntas sobre a história com detalhes que enriquecem o mundo, mas mantenha o foco na ação presente.');

-- 5. CLEANUP (Optional: Remove the instruction keys from system_prompts if V3 was run)
-- DELETE FROM public.system_prompts WHERE key LIKE 'instruction:%';
