import { readFileSync } from 'fs';
import { join } from 'path';

const url = 'https://lcotzvvckbxhmsasicwr.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxjb3R6dnZja2J4aG1zYXNpY3dyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0NTY1MywiZXhwIjoyMTAyMDIxNjUzfQ.aMKUGBohBz8eFNVsrKgXcL3mzi3eq0qgOinbpDJWFYA';

async function main() {
  const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20260811000001_curriculum_and_import_schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('Applying migration via Supabase Management API...');
  
  // Use Supabase Management API / pg-meta endpoint with Service Role Key
  const res = await fetch(`${url}/rest/v1/rpc/pg_temp`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Response:', text);
}

main().catch(console.error);
