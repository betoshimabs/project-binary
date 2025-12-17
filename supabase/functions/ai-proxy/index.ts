import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const body = await req.json()
        const { action, prompt, model = 'openai', seed, system } = body

        console.log(`Request: ${action}, Model: ${model}`);

        // --- TEXT GENERATION ---
        if (action === 'generate_text') {
            const messages = [
                { role: 'system', content: system || 'You are a helpful RPG Game Master assistant.' },
                { role: 'user', content: prompt }
            ];

            // Pollinations AI POST endpoint (Backend-to-Backend)
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    model,
                    seed: seed || Math.floor(Math.random() * 1000),
                    jsonMode: false
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error(`Pollinations POST failed: ${response.status} - ${errText}`);

                // Throw specific error to be returned in catch block
                throw new Error(`Pollinations Provider Error (${response.status}): ${errText.substring(0, 100)}`);
            }

            const text = await response.text()
            return new Response(text, {
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            })
        }

        // --- IMAGE GENERATION ---
        if (action === 'generate_image') {
            // Just return the constructed URL for now, mirroring the client-side logic but safe
            const encodedPrompt = encodeURIComponent(prompt);
            const url = `https://pollinations.ai/p/${encodedPrompt}?width=128&height=128&seed=${seed || Math.floor(Math.random() * 1000)}&model=flux&nologo=true`;

            return new Response(JSON.stringify({ url }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error) {
        console.error("Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
