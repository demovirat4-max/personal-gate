import { createClient } from '@supabase/supabase-js';

const url = 'https://lcotzvvckbxhmsasicwr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3R6dnZja2J4aG1zYXNpY3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0NTY1MywiZXhwIjoyMTAyMDIxNjUzfQ.aMKUGBohBz8eFNVsrKgXcL3mzi3eq0qgOinbpDJWFYA';

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log('Testing direct REST client connection...');
  const { data, error } = await supabase.from('subjects').select('*').limit(1);
  console.log('Subjects query result:', { data, error });
}

main().catch(console.error);
