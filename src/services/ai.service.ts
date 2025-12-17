import { supabase } from "../lib/supabase";

/**
 * Service to interact with x.ai (Grok) API using an Agentic Architecture.
 * 
 * Agents:
 * 1. OPERATOR (Router): 'grok-4-1-fast-non-reasoning'. Fast, operational, decides context.
 * 2. NARRATOR (Creative): 'grok-4-1-fast-reasoning'. Deep thinker, immersive storyteller.
 * 
 * Note: Requires VITE_GROK_API_KEY in .env.local
 */
export const aiService = {

    // --- AGENT MODELS ---
    OPERATOR_MODEL: 'grok-4-1-fast-non-reasoning', // Or 'grok-beta' if this ID fails
    NARRATOR_MODEL: 'grok-4-1-fast-reasoning',

    /**
     * Tries text generation with a specific model.
     * Used internally by agents.
     */
    async generateWithModel(prompt: string, model: string, systemPrompt: string = ''): Promise<string> {
        const apiKey = import.meta.env.VITE_GROK_API_KEY;

        if (!apiKey) {
            throw new Error("VITE_GROK_API_KEY is missing via .env.local");
        }

        const payload = {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: model,
            stream: false,
            temperature: 0.7
        };

        // For non-reasoning operator, we want determinism
        if (model.includes('non-reasoning')) {
            payload.temperature = 0.3;
        }

        try {
            const data = await this.callGrokApi(apiKey, payload);

            if (data && data.choices && data.choices.length > 0) {
                return data.choices[0].message?.content || '';
            }
            throw new Error(`No content returned from ${model}`);
        } catch (err) {
            console.warn(`[AI AGENT] Error with ${model}:`, err);
            throw err;
        }
    },

    /**
     * OPERATOR AGENT: Decides which context modules are needed based on user action.
     * Returns an array of category keywords (e.g. ['combat', 'magic']).
     */
    async decideContext(lastMessage: string, recentHistory: string): Promise<string[]> {
        // Fetch the Operator's "Brain" from DB (managed via Admin > Instructions)
        let systemPrompt = await this.getPrompt('operator_system');

        // Fallback if DB is empty (should not happen if V5 is run)
        if (!systemPrompt || systemPrompt.length < 10) {
            systemPrompt = `
            You are the OPERATOR of a Tabletop RPG System.
            Your job is to analyze the PLAYER'S ACTION and decide which RULE MODULES are needed for the Game Master to resolve it.
            
            AVAILABLE MODULES:
            - "combat": If player attacks, defends, takes damage, or uses weapons.
            - "magic": If player casts spells, senses supernatural, or uses artifacts.
            - "social": If player talks, lies, intimidates, or interacts with NPCs.
            - "exploration": If player searches, travels, sneaks, or investigates environment.
            - "lore": If player asks about history, religion, or world details.
            - "inventory": If player uses an item, loots, or checks equipment.

            OUTPUT FORMAT:
            Return ONLY a JSON array of strings. Example: ["combat", "magic"]
            If no specific rules are needed, return empty array [].
            `;
        }

        const prompt = `
        [RECENT HISTORY]: ${recentHistory.slice(-500)}...
        [PLAYER ACTION]: "${lastMessage}"
        
        Which modules are required? JSON ONLY.
        `;

        try {
            const response = await this.generateWithModel(prompt, this.OPERATOR_MODEL, systemPrompt);

            // Clean up code blocks if present (markdown json)
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (error) {
            console.warn("[OPERATOR] Failed to decide context, defaulting to basic.", error);
            return []; // Fail safe: load nothing extra
        }
    },

    /**
     * Builds the XML context string by fetching data from Supabase.
     */
    async buildDynamicContext(categories: string[], campaign: any, character: any): Promise<string> {
        // 1. Base Context (Always present)
        let xmlContext = `<campaign_setting>\n<title>${campaign.title}</title>\n<description>${campaign.description}</description>\n</campaign_setting>\n`;

        xmlContext += `<character_sheet>\n<name>${character.name}</name>\n<visual_appearance>${character.physical_description}</visual_appearance>\n`;
        // Inject Mutable State (V8)
        xmlContext += `<status>\n<hp current="${character.current_hp ?? 10}" max="${character.max_hp ?? 10}" />\n<mp current="${character.current_mp ?? 5}" max="${character.max_mp ?? 5}" />\n</status>\n`;

        // Inject Skills & Equipment (Crucial for mechanics)
        xmlContext += `<known_moves>\n${JSON.stringify({
            passive: character.skills?.passive,
            active1: character.skills?.active1,
            active2: character.skills?.active2,
            details: character.skills?.details,
            equipment: character.skills?.equipment
        }, null, 2)}\n</known_moves>\n`;

        // Only include stats if combat or check might happen (optimization: could be refined)
        xmlContext += `<attributes>${JSON.stringify(character.attributes)}</attributes>\n`;
        xmlContext += `</character_sheet>\n`;

        // --- INJECT ACTIVE THREATS (New V16) ---
        const { data: threats } = await supabase
            .from('threats')
            .select('*')
            .eq('campaign_id', campaign.id)
            .eq('character_id', character.id)
            .eq('status', 'active');

        if (threats && threats.length > 0) {
            xmlContext += `<active_threats>\n${JSON.stringify(threats.map(t => ({ name: t.name, hp: `${t.current_hp}/${t.max_hp}` })), null, 2)}\n</active_threats>\n`;
        } else {
            xmlContext += `<active_threats>None. If enemies appear, use [[NEW_THREAT]].</active_threats>\n`;
        }

        // 2. Dynamic Rule Modules & Instructions (Fetched from DB)
        // FORCE 'core' rules to be included (Advantage/Disadvantage, Dice logic)
        const activeCategories = Array.from(new Set([...categories, 'core']));

        if (activeCategories.length > 0) {
            // A. Fetch RULES
            const { data: rules } = await supabase
                .from('rules')
                .select('category, content')
                .in('category', activeCategories);

            if (rules && rules.length > 0) {
                xmlContext += `<active_rules>\n`;
                rules.forEach(r => {
                    xmlContext += `<module name="${r.category}">${r.content}</module>\n`;
                });
                xmlContext += `</active_rules>\n`;
            }

            // B. Fetch INSTRUCTIONS (Mindset) from dedicated table
            const { data: instructions } = await supabase
                .from('instructions')
                .select('category, content')
                .in('category', activeCategories);

            if (instructions && instructions.length > 0) {
                xmlContext += `<active_instructions>\n`;
                instructions.forEach(i => {
                    xmlContext += `<guide name="${i.category}">${i.content}</guide>\n`;
                });
                xmlContext += `</active_instructions>\n`;
            }
        }

        return xmlContext;
    },

    /**
     * ORCHESTRATOR: The main entry point for the Game Master logic.
     */
    async generateMasterInteraction(
        userAction: string,
        context: any = {},
        history: { summary?: string, recentMessages?: any[] } = {},
        narrativeMode: number = 2
    ): Promise<string> {
        try {
            // --- STEP 1: OPERATOR AGENT (The Router) ---
            // Prepare a short history string for the operator
            const shortHistory = history.recentMessages
                ? history.recentMessages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')
                : '';

            console.log("🤖 Operator Analysis...");
            const requiredModules = await this.decideContext(userAction, shortHistory);
            console.log(`🤖 Operator decided on: [${requiredModules.join(', ')}]`);

            // --- STEP 2: CONTEXT BUILDER ---
            const { character, campaign } = context;
            const dynamicXml = await this.buildDynamicContext(requiredModules, campaign, character);

            // --- STEP 3: NARRATOR AGENT (The Creative) ---
            let baseInstruction = '';

            // Check if this is the very first message of the campaign
            const isStartOfCampaign = !history.recentMessages || history.recentMessages.length === 0;

            if (isStartOfCampaign) {
                console.log("🌟 Generating Campaign Intro...");
                // Fetch specialized Intro Protocol
                baseInstruction = await this.getPrompt('campaign_intro', {
                    campaign_title: campaign.title || 'Unknown World',
                    campaign_description: campaign.description || 'A mysterious place.',
                    character_name: character.name || 'Traveler',
                    character_origin: character.origin_description || 'Unknown origin.'
                });

                // Fallback for Intro
                if (!baseInstruction) {
                    baseInstruction = `You are a cinematic narrator.
                    Describe the world of ${campaign.title} and the character ${character.name} entering it.
                    Set a dark, immersive tone.`;
                }
            } else {
                // Standard Gameplay Flow
                baseInstruction = await this.getPrompt('master_interaction');

                // Fallback for Standard Play
                if (!baseInstruction || baseInstruction === "Narrate.") {
                    baseInstruction = `You are a Cyberpunk RPG Game Master. Narrate the outcome.
                    STRICT GUIDELINES:
                    1. WRITE LIKE A NOVEL. No "Narrative:" prefixes.
                    2. SHOW, DON'T TELL.
                    3. Ask for rolls only if uncertain.`;
                }
            }

            // NARRATIVE MODE SELECTOR
            let styleInstruction = "";
            switch (narrativeMode) {
                case 1:
                    styleInstruction = "DIRETRIZ DE ESTILO: MODO TÁTICO (OBJETIVA E CASUAL). Seja extremamente conciso. Use frases curtas. Foco total na ação imediata. Evite adjetivos, metáforas ou descrições poéticas. Vá direto ao ponto.";
                    break;
                case 2:
                    styleInstruction = "DIRETRIZ DE ESTILO: MODO NEUTRO. Apresente um ou outro adjetivo para ilustrar a cena, mas mantenha objetividade e linguagem simples.";
                    break;
                case 3:
                    styleInstruction = "DIRETRIZ DE ESTILO: MODO IMERSIVO (IMAGINATIVA E EVOCATIVA). Seja eloquente e literário. Explore a atmosfera, os cinco sentidos (cheiros, sons, luzes) e o drama da cena. Use vocabulário rico. Permita-se ser 'viajado' nas descrições.";
                    break;
                default:
                    styleInstruction = "DIRETRIZ DE ESTILO: MODO NEUTRO. Apresente um ou outro adjetivo para ilustrar a cena, mas mantenha objetividade e linguagem simples.";
                    break;
            }

            // --- STEP 3: CALL MODEL WITH CORTEX PROTOCOL ---
            // The `baseInstruction` is now part of the `fullPrompt` as the system prompt for the AI.
            // The `systemPrompt` argument to `generateWithModel` is a meta-instruction for the model's behavior.
            const systemPromptForModel = "You are a JSON-speaking Game Engine.";

            // Extract active threats for the prompt
            const { data: activeThreats } = await supabase
                .from('threats')
                .select('*')
                .eq('campaign_id', campaign.id)
                .eq('character_id', character.id)
                .eq('status', 'active');

            const threatsContext = activeThreats && activeThreats.length > 0
                ? JSON.stringify(activeThreats.map(t => ({ name: t.name, hp: `${t.current_hp}/${t.max_hp}` })), null, 2)
                : "Nenhuma ameaça visível.";

            let fullPrompt = `
            ${baseInstruction}
            
            ${styleInstruction}

            CONTEXTO ATUAL:
            <character_sheet>
            ${dynamicXml}
            </character_sheet>

            <active_threats>
            ${threatsContext}
            </active_threats>

            <game_history>
            ${history.summary || 'Início da aventura.'}
            </game_history>

            <recent_log>
            ${shortHistory}
            </recent_log>

            <player_action>
            ${userAction}
            </player_action>

            Responda APENAS com o JSON válido. Sem markdown "json", sem texto antes ou depois.
            `;

            // We force JSON mode if possible, or usually just strong prompting works with smart models.
            // Grok is good at following formats.
            const responseContent = await this.generateWithModel(fullPrompt, this.NARRATOR_MODEL, systemPromptForModel);

            // --- STEP 4: MECHANICS RESOLVER (CORTEX V1) ---
            let parsedResponse: any;
            try {
                // Try to find JSON if wrapped in markdown
                const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : responseContent;
                parsedResponse = JSON.parse(jsonStr);
                console.log("[CORTEX] Valid JSON received.");
            } catch (e) {
                console.error("[CORTEX] JSON Parse Error:", e);
                console.log("[CORTEX] Raw Response:", responseContent);
                // Fallback: return raw text as narrative if completely broken, or try to fix
                return "ERRO DE SINCRONIA NEURAL (JSON INVÁLIDO). TENTE NOVAMENTE.";
            }

            // A. PLAYER UPDATES
            if (parsedResponse.mechanics?.player_updates) {
                const pu = parsedResponse.mechanics.player_updates;
                // Only touch DB if changes are non-zero
                if (pu.hp_change !== 0 || pu.mp_change !== 0) {
                    const newHp = Math.min(character.max_hp || 10, Math.max(0, (character.current_hp || 10) + pu.hp_change));
                    const newMp = Math.min(character.max_mp || 5, Math.max(0, (character.current_mp || 5) + pu.mp_change));

                    await supabase.from('characters').update({
                        current_hp: newHp,
                        current_mp: newMp
                    }).eq('id', character.id);
                    console.log(`[CORTEX] Player Stats: HP ${pu.hp_change}, MP ${pu.mp_change}`);
                }
            }

            // B. THREATS LAYER
            if (parsedResponse.mechanics?.threats_layer) {
                const tl = parsedResponse.mechanics.threats_layer;

                // Spawn
                if (tl.spawn && Array.isArray(tl.spawn)) {
                    for (const s of tl.spawn) {
                        const count = s.count || 1;
                        for (let i = 1; i <= count; i++) {
                            const name = count > 1 ? `${s.name} ${i}` : s.name;
                            await supabase.from('threats').insert({
                                campaign_id: campaign.id,
                                character_id: character.id,
                                name: name,
                                max_hp: s.base_hp,
                                current_hp: s.base_hp,
                                status: 'active'
                            });
                        }
                    }
                }

                // Modify
                if (tl.modify && Array.isArray(tl.modify)) {
                    for (const m of tl.modify) {
                        const { data: currentT } = await supabase.from('threats')
                            .select('*').eq('campaign_id', campaign.id).eq('character_id', character.id)
                            .ilike('name', m.target_name).eq('status', 'active').maybeSingle();

                        if (currentT) {
                            const newHp = Math.max(0, currentT.current_hp + (m.hp_change || 0)); // Note: hp_change is typically negative for damage
                            // AI sends explicit "new_status", or we infer
                            let finalStatus = m.new_status || 'active';
                            if (newHp <= 0) finalStatus = 'defeated';

                            await supabase.from('threats').update({ current_hp: newHp, status: finalStatus }).eq('id', currentT.id);
                        }
                    }
                }

                // Remove
                if (tl.remove && Array.isArray(tl.remove)) {
                    for (const name of tl.remove) {
                        await supabase.from('threats').update({ status: 'fled' }) // or delete? fled is safer for history
                            .eq('campaign_id', campaign.id).eq('character_id', character.id)
                            .ilike('name', name);
                    }
                }
            }

            // C. WORLD STATE (Optional - just log for now or could stick in metadata)
            if (parsedResponse.world_state) {
                // Future: Update a campaign_status table
                console.log("[CORTEX] World State:", parsedResponse.world_state);
            }

            // Return ONLY the narrative text to the chat
            return parsedResponse.narrative.text;
        } catch (error) {
            console.error("Master Interaction Failed:", error);
            // Fallback to simple generation if complex flow crashes
            return this.generateText(`[FALLBACK MODE] Player said: ${userAction}. Respond as GM.`);
        }
    },

    // --- UTILS ---

    async callGrokApi(apiKey: string, payload: any) {
        const url = `https://api.x.ai/v1/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || response.statusText);
        return data;
    },

    // Legacy/Simple text generation (retained for other utility calls like summary)
    async generateText(prompt: string): Promise<string> {
        return this.generateWithModel(prompt, this.NARRATOR_MODEL, 'You are a helpful assistant.');
    },

    // Legacy Image Gen (Pollinations) - Unchanged
    async generateImage(prompt: string): Promise<string> {
        const encodedPrompt = encodeURIComponent(prompt);
        return `https://pollinations.ai/p/${encodedPrompt}?width=128&height=128&seed=${Math.floor(Math.random() * 1000)}&model=flux&nologo=true`;
    },

    // Legacy Helpers (getPrompt, etc) - Unchanged but simplified usage
    async getPrompt(key: string, variables: Record<string, string> = {}): Promise<string> {
        const { data, error } = await supabase.from('system_prompts').select('template').eq('key', key).single();
        if (error || !data) {
            if (key === 'master_interaction') return "Narrate.";
            return "";
        }
        let prompt = data.template;
        Object.entries(variables).forEach(([k, v]) => { prompt = prompt.replace(new RegExp(`{{${k}}}`, 'g'), v); });
        return prompt;
    },

    // Kept for compatibility with other components
    async generateCharacterAvatar(character: any): Promise<string> {
        const prompt = await this.getPrompt('character_avatar', {
            physical_description: character.physical_description,
            origin_description: character.origin_description,
            name: character.name
        });
        return this.generateImage(prompt);
    },

    async generateCharacterSkills(rules: string, campaign: any, character: any, skills: any): Promise<any> {
        // Simple direct call for this utility
        const variables = {
            rules: rules,
            campaign: JSON.stringify(campaign),
            character: JSON.stringify(character),
            'skills.passive': skills.passive,
            'skills.active1': skills.active1,
            'skills.active2': skills.active2
        };
        const prompt = await this.getPrompt('character_creation', variables);
        // Use Non-Reasoning model for skills generation (faster, deterministic)
        const result = await this.generateWithModel(prompt, this.OPERATOR_MODEL, 'You are a system generator.');
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        try { return JSON.parse(cleanJson); } catch { return {}; }
    },

    async generateSummary(recentMessages: any[], previousSummary: string = ''): Promise<string> {
        // Filter out mechanical messages to keep summary narrative-focused
        const narrativeMessages = recentMessages.map(m => {
            const content = m.content || '';
            // Remove lines that look like mechanics
            const narrativeLines = content.split('\n').filter((line: string) => {
                const lower = line.toLowerCase();
                return !lower.includes('obtive') &&
                    !lower.includes('sucesso') &&
                    !lower.includes('hp:') &&
                    !lower.includes('mp:') &&
                    !lower.includes('rolagem');
            });
            return { ...m, content: narrativeLines.join('\n') };
        }).filter(m => m.content.trim().length > 0);

        const prompt = `Synthesize these messages into a 1-paragraph summary:\n${narrativeMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}\nPrevious: ${previousSummary}`;
        // Use Non-Reasoning model for summarization (faster)
        return this.generateWithModel(prompt, this.OPERATOR_MODEL, 'You are a summarizer.');
    }
};
