// ====================================================================
// AyurDesk - Database Migration Runner
// Organization: Ayuryoga International
// ====================================================================
// Usage:
//   npx tsx scripts/run-migrations.ts [optional-db-url]
// ====================================================================

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const dbUrl = process.argv[2] || process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!dbUrl) {
    console.error('\n[AyurDesk] Error: No database connection URL provided.');
    console.error('Usage: npx tsx scripts/run-migrations.ts "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"');
    console.error('Or set DATABASE_URL or SUPABASE_DB_URL in your environment.\n');
    process.exit(1);
  }

  console.log('\n[AyurDesk] Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[AyurDesk] Connected successfully.');

    const sqlFilePath = path.join(__dirname, '../supabase/migrations/full_setup.sql');
    console.log(`[AyurDesk] Reading SQL migration from: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('[AyurDesk] Executing full migration & seed script...');
    await client.query(sql);

    console.log('\n[AyurDesk] SUCCESS: All tables, RLS policies, triggers, and seed data have been executed and verified in Supabase!');
  } catch (err) {
    console.error('\n[AyurDesk] Migration execution failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

