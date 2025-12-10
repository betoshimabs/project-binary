import { supabase } from "../lib/supabase";

// Define the available models and their fallback order
// const TEXT_MODELS = [
//     'gemini-2.0-flash',
//     'gemini-2.0-flash-lite',
//     'gemini-1.5-flash',
//     'gemini-1.5-pro',
//     'gemini-1.5-flash-8b'
// ];

/**
 * Service to interact with Google's Gemini API with fallback support.
 * 
 * Note: Requires VITE_GEMINI_API_KEY in .env.local
 */
export const aiService = {

    /**
     * Tries models in the defined order until successful or all fail.
     * 
     * @param prompt The input prompt for text generation.
     * @returns The generated text.
     */
    async generateText(prompt: string): Promise<string> {
        // --- POLLINATIONS.AI IMPLEMENTATION (TEMPORARY REPLACEMENT) ---
        const models = ['openai', 'qwen', 'mistral'];

        for (const model of models) {
            try {
                const response = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: 'You are a helpful RPG Game Master assistant.' },
                            { role: 'user', content: prompt }
                        ],
                        model: model,
                        private: true,
                        seed: Math.floor(Math.random() * 1000)
                    })
                });

                if (!response.ok) {
                    console.warn(`Pollinations model '${model}' failed: ${response.statusText}`);
                    continue; // Try next model
                }

                const text = await response.text();
                if (text && text.trim().length > 0) return text;

            } catch (error) {
                console.warn(`Pollinations model '${model}' error:`, error);
            }
        }

        throw new Error("All Pollinations models failed.");
    },

    /* 
    // --- GEMINI IMPLEMENTATION (DISABLED) ---
    // ...
    */

    /**
     * Internal helper to make the raw fetch call.
     */
    async callGeminiApi(model: string, apiKey: string, payload: any) {
        // Using v1beta as it typically hosts the newer models/features like 2.0-flash-preview
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `API Error: ${response.statusText}`);
        }

        return data;
    },

    /**
     * Generates an image using the Pollinations.ai API.
     * Returns Base64 string to maintain compatibility.
     */
    async generateImage(prompt: string): Promise<string> {
        try {
            // Encode prompt and settings
            // flux works well for structured/artistic.
            // width/height=128 appropriate for pixel art avatars.
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://pollinations.ai/p/${encodedPrompt}?width=128&height=128&seed=${Math.floor(Math.random() * 1000)}&model=flux&nologo=true`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Pollinations API Error: ${response.statusText}`);

            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            // Convert to Base64
            // @ts-ignore
            const base64 = btoa(new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ''
            ));
            return base64;
        } catch (error) {
            console.error("Image generation failed:", error);
            throw error;
        }
    },

    /**
     * Fetches a prompt template from Supabase and substitutes variables.
     */
    async getPrompt(key: string, variables: Record<string, string> = {}): Promise<string> {
        const { data, error } = await supabase
            .from('system_prompts')
            .select('template')
            .eq('key', key)
            .single();

        if (error || !data) {
            console.error(`Failed to fetch prompt '${key}'`, error);
            // Return a default prompt if DB fails, to prevent crash
            if (key === 'master_interaction') return "Você é um Mestre de RPG cyberpunk. Responda com frieza e mistério.";
            throw new Error(`Prompt template not found: ${key}`);
        }

        let prompt = data.template;
        Object.entries(variables).forEach(([varName, value]) => {
            // Replace {{variable}} globally
            const regex = new RegExp(`{{${varName}}}`, 'g');
            prompt = prompt.replace(regex, value);
        });

        return prompt;
    },

    /**
     * Generates a character avatar using instructions from the DB.
     * Uses Pollinations.ai as the image provider.
     */
    async generateCharacterAvatar(
        character: { physical_description: string; origin_description: string; name: string }
    ): Promise<string> {
        const prompt = await this.getPrompt('character_avatar', {
            physical_description: character.physical_description,
            origin_description: character.origin_description,
            name: character.name
        });

        return this.generateImage(prompt);
    },

    /**
     * Generates descriptions and effects for character skills.
     */
    async generateCharacterSkills(
        rules: string,
        campaign: any,
        character: any,
        skills: { passive: string; active1: string; active2: string }
    ): Promise<{
        passive: { effect: string, cost: string },
        active1: { effect: string, cost: string },
        active2: { effect: string, cost: string },
        equipment: {
            weapon: { name: string, attribute: string, effect: string },
            armor: { name: string, ac: string, effect: string }
        }
    }> {
        // Flatten inputs for string substitution
        const variables = {
            rules: rules,
            campaign: campaign ? JSON.stringify(campaign) : 'Genérica',
            character: JSON.stringify(character),
            'skills.passive': skills.passive,
            'skills.active1': skills.active1,
            'skills.active2': skills.active2
        };

        const prompt = await this.getPrompt('character_creation', variables);

        const result = await this.generateText(prompt);
        // Clean markdown code blocks if present
        const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse JSON from AI", cleanJson);
            throw new Error("Invalid format received from AI");
        }
    },

    /**
     * Generates a concise summary of the recent narrative to maintain context.
     */
    async generateSummary(recentMessages: any[], previousSummary: string = ''): Promise<string> {
        const prompt = `
        [TAREFA]: Sintetize os eventos recentes deste RPG cyberpunk em um resumo conciso (máximo 1 parágrafo).
        
        [RESUMO ANTERIOR]:
        ${previousSummary || "Início da aventura."}

        [DIALOGOS RECENTES]:
        ${recentMessages.map(m => `${m.sender}: ${m.content}`).join('\n')}

        [INSTRUÇÃO]: Mantenha fatos importantes (nomes, itens, ferimentos, localização atual). Ignore detalhes supérfluos.
        `;

        return this.generateText(prompt);
    },

    /**
     * Generates a response from the AI Game Master (Master Interaction).
     * 
     * @param userAction The player's input action or dialogue.
     * @param context Game state context (optional).
     * @param history Context including summary and recent messages.
     */
    async generateMasterInteraction(
        userAction: string,
        context: any = {},
        history: { summary?: string, recentMessages?: any[] } = {}
    ): Promise<string> {
        try {
            // Fetch the master instructions (or use fallback if DB fails)
            let instructions = await this.getPrompt('master_interaction');

            // FORCE OVERRIDE: Add strict constraints
            instructions += `
            \n\n[NOVAS REGRAS ESTRITAS]:
            1. FORMATO: Escreva como um livro. NÃO USE etiquetas como 'Narrativa:', 'Processamento:', 'Feedback Visual:'. Apenas o texto corrido.
            2. RITMO: Avance a história! Não fique apenas reagindo. Se a cena estagnar, introduza um perigo, uma descoberta ou uma mudança no ambiente.
            3. DADOS (IMPORTANTE): NÃO peça testes para ações simples ou sem risco (ex: olhar ao redor, abrir porta destrancada). Peça testes APENAS se houver risco, pressão de tempo ou consequência interessante para falha.
               - Se pedir teste: "Tente [Ação]. Role [Atributo] + [Perícia]." (E termine com: "Role os dados e me fale quantos sucessos obteve.")
               - Se NÃO pedir teste: Narre a ação do jogador tendo sucesso imediato e pergunte o que ele faz a seguir.
            4. REGRAS: JAMAIS explique mecânicas (explosão, pares, TN).
            5. DANO: Se o jogador sofrer dano, descreva a dor E o valor numérico explicitamente (ex: "A lâmina corta seu braço. Você sofre 2 de dano.").
            6. AUTONOMIA: JAMAIS sugira ações para o jogador.
            7. HUD: Não mostre HP/XP.
            8. FINALIZAÇÃO: Termine sempre com "O que você faz?" se não estiver pedindo rolagem.
            `;

            // Extract context
            const { character, campaign } = context;

            // Construct prompt efficiently
            let fullPrompt = `${instructions}\n`;

            if (campaign) {
                fullPrompt += `\n[AMBIENTAÇÃO DA CAMPANHA]:\nTitulo: ${campaign.title}\nDescrição: ${campaign.description}\n`;
            }

            if (character) {
                fullPrompt += `\n[PERSONAGEM ATUAL]:\nNome: ${character.name}\nDescrição: ${character.physical_description}\n`;
                if (character.attributes) fullPrompt += `Atributos: ${JSON.stringify(character.attributes)}\n`;
                if (character.skills) fullPrompt += `Perícias: ${JSON.stringify(character.skills)}\n`;
            }

            if (history.summary) {
                fullPrompt += `\n[RESUMO DA HISTÓRIA ATÉ AGORA]:\n${history.summary}\n`;
            }

            if (history.recentMessages && history.recentMessages.length > 0) {
                fullPrompt += `\n[MENSAGENS RECENTES]:\n${history.recentMessages.map(m => `${m.sender.toUpperCase()}: ${m.content}`).join('\n')}\n`;
            }

            fullPrompt += `\n[ESTADO ATUAL]: ${JSON.stringify(context)}\n\n[JOGADOR]: "${userAction}"\n\n[MESTRE]:`;

            return await this.generateText(fullPrompt);
        } catch (error) {
            console.error("Master Interaction Fallback Triggered:", error);
            return ":: SISTEMA :: ERRO DE CONEXÃO COM A MATRIX. Tente novamente.";
        }
    }
};
