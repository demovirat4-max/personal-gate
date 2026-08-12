import { readFileSync } from 'fs';
import { join } from 'path';
import { Client } from 'pg';

const rawPassword = 'Yaksharth@2007';

const connectionConfigs = [
  {
    name: 'Supabase Pooler (port 6543)',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.lcotzvvckbxhmsasicwr',
    password: rawPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  {
    name: 'Supabase Pooler Session Mode (port 5432)',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    user: 'postgres.lcotzvvckbxhmsasicwr',
    password: rawPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  },
];

async function main() {
  for (const config of connectionConfigs) {
    console.log(`Trying ${config.name}...`);
    const client = new Client(config);
    try {
      await client.connect();
      console.log(`✓ Connected successfully using ${config.name}!`);

      const sqlPath = join(process.cwd(), 'supabase', 'migrations', '20260811000001_curriculum_and_import_schema.sql');
      const sql = readFileSync(sqlPath, 'utf-8');

      console.log('Executing Phase 2 migration SQL...');
      await client.query(sql);
      console.log('✓ Migration executed successfully!');

      const res = await client.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
      );
      console.log('✓ Database Tables Created:', res.rows.map((r) => r.table_name));

      // Seed default GATE CS 2028 subjects
      console.log('Seeding default GATE CS 2028 subjects...');
      const seedSql = `
        INSERT INTO subjects (title, code, weightage_marks, order_index) VALUES
        ('Engineering Mathematics', 'EM', 13.00, 1),
        ('General Aptitude', 'GA', 15.00, 2),
        ('Digital Logic', 'DL', 6.00, 3),
        ('Computer Organization and Architecture', 'COA', 8.00, 4),
        ('Programming and Data Structures', 'DS', 10.00, 5),
        ('Algorithms', 'ALGO', 8.00, 6),
        ('Theory of Computation', 'TOC', 7.00, 7),
        ('Compiler Design', 'CD', 4.00, 8),
        ('Operating System', 'OS', 9.00, 9),
        ('Database Management System', 'DBMS', 8.00, 10),
        ('Computer Networks', 'CN', 12.00, 11)
        ON CONFLICT (code) DO NOTHING;
      `;
      await client.query(seedSql);
      console.log('✓ Default GATE CS 2028 subjects seeded successfully!');

      const checkSeed = await client.query('SELECT title, code FROM subjects ORDER BY order_index;');
      console.log('✓ Seeded Subjects:');
      checkSeed.rows.forEach((r) => console.log(`  - ${r.code}: ${r.title}`));

      await client.end();
      return;
    } catch (err: any) {
      console.error(`✗ Failed ${config.name}:`, err.message || err);
      try { await client.end(); } catch {}
    }
  }
  console.error('All connection attempts failed.');
}

main().catch(console.error);
