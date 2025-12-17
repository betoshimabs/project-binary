
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchContent() {
    console.log("--- SYSTEM PROMPTS ---");
    const { data: prompts, error: promptsError } = await supabase
        .from('system_prompts')
        .select('*');

    if (promptsError) console.error("Error fetching prompts:", promptsError);
    else console.log(JSON.stringify(prompts, null, 2));

    console.log("\n--- RULES ---");
    const { data: rules, error: rulesError } = await supabase
        .from('rules')
        .select('*');

    if (rulesError) console.error("Error fetching rules:", rulesError);
    else console.log(JSON.stringify(rules, null, 2));
}

fetchContent();
