// ====================================================================
// AyurDesk - Seed Initial Data
// ====================================================================

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { INITIAL_RECORDS } from '../src/lib/seedData';

// Parse .env manually
const envPath = path.join(import.meta.dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  });
}

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Using Supabase URL:', url);
const supabase = createClient(url, key);

async function seed() {
  console.log(`\nImporting ${INITIAL_RECORDS.length} initial operational records into AyurDesk...`);

  let successCount = 0;
  for (const record of INITIAL_RECORDS) {
    const { error } = await supabase
      .from('daily_reports')
      .upsert(record, { onConflict: 'report_date' });

    if (error) {
      console.error(`Failed to insert ${record.report_date}:`, error.message);
    } else {
      successCount++;
      console.log(`✓ Record for ${record.report_date} inserted.`);
    }
  }

  console.log(`\nFinished: ${successCount} / ${INITIAL_RECORDS.length} records imported.`);
}

seed().catch(console.error);
