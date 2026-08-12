import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const rawPassword = 'Yaksharth@2007';

const config = {
  name: 'Supabase Pooler (port 6543)',
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.lcotzvvckbxhmsasicwr',
  password: rawPassword,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

async function main() {
  console.log(`Connecting to ${config.name}...`);
  const client = new Client(config);
  try {
    await client.connect();
    console.log('✓ Connected successfully!');

    const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20260811000002_phase3_learning_loop_schema.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('Executing Phase 3 migration SQL...');
    await client.query(sql);
    console.log('✓ Phase 3 migration executed successfully!');

    const res = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );
    console.log('✓ Database Tables Present:', res.rows.map((r) => r.table_name));

    await client.end();
  } catch (err: any) {
    console.error('✗ Migration failed:', err.message || err);
    try { await client.end(); } catch {}
  }
}

main().catch(console.error);
