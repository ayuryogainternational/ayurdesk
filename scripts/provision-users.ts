// ====================================================================
// AyurDesk - Daily Operations Management System
// User Provisioning Script: scripts/provision-users.ts
// Organization: Ayuryoga International
// ====================================================================
// Usage:
//   npx tsx scripts/provision-users.ts
//
// Environment variables:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   STAFF_SHILPA_EMAIL (e.g. shilpa@ayuryoga.example.com)
//   STAFF_GOKUL_EMAIL  (e.g. gokul@ayuryoga.example.com)
//   ADMIN_EMAIL        (e.g. admin@ayuryoga.example.com)
//   INITIAL_TEMP_PASSWORD (min 8 characters)
// ====================================================================

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  console.log('\n======================================================');
  console.log(' AyurDesk - Secure Account Provisioning');
  console.log(' Organization: Ayuryoga International');
  console.log('======================================================\n');

  const supabaseUrl = process.env.SUPABASE_URL || await askQuestion('Enter Supabase Project URL: ');
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || await askQuestion('Enter Supabase Service Role Key: ');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Supabase URL and Service Role Key are required.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl.trim(), supabaseServiceKey.trim(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const shilpaEmail = process.env.STAFF_SHILPA_EMAIL || await askQuestion('Enter Shilpa (Staff) Email: ');
  const gokulEmail = process.env.STAFF_GOKUL_EMAIL || await askQuestion('Enter Gokul (Staff) Email: ');
  const adminEmail = process.env.ADMIN_EMAIL || await askQuestion('Enter Owner / Administrator Email: ');
  const tempPassword = process.env.INITIAL_TEMP_PASSWORD || await askQuestion('Enter Common Temporary Password (min 8 chars): ');

  if (tempPassword.length < 8) {
    console.error('Error: Temporary password must be at least 8 characters long.');
    process.exit(1);
  }

  const usersToProvision = [
    { email: shilpaEmail.trim(), fullName: 'Shilpa', role: 'staff' as const },
    { email: gokulEmail.trim(), fullName: 'Gokul', role: 'staff' as const },
    { email: adminEmail.trim(), fullName: 'Owner/Admin', role: 'admin' as const },
  ];

  for (const user of usersToProvision) {
    console.log(`\nProvisioning ${user.fullName} (${user.email}) as ${user.role}...`);

    // Check if user already exists
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`Error listing users: ${listError.message}`);
      continue;
    }

    const existing = listData.users.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

    if (existing) {
      console.log(`User ${user.email} already exists. Updating role and metadata...`);
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(existing.id, {
        password: tempPassword,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
          must_change_password: true,
        },
      });

      if (updateAuthError) {
        console.error(`Failed to update auth user: ${updateAuthError.message}`);
      } else {
        await supabase.from('profiles').upsert({
          id: existing.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          must_change_password: true,
          updated_at: new Date().toISOString(),
        });
        console.log(`Updated profile for ${user.fullName} successfully.`);
      }
    } else {
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
          must_change_password: true,
        },
      });

      if (createError) {
        console.error(`Failed to create user ${user.email}: ${createError.message}`);
      } else if (newUserData.user) {
        // Upsert profile in public.profiles
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: newUserData.user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          must_change_password: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error(`Failed to create profile: ${profileError.message}`);
        } else {
          console.log(`Successfully created account for ${user.fullName} (${user.email}) [Role: ${user.role}].`);
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log(' Account Provisioning Complete!');
  console.log(' Users are set with must_change_password = true');
  console.log(' They will be forced to change password upon first login.');
  console.log('======================================================\n');

  rl.close();
}

main().catch((err) => {
  console.error('Fatal error during provisioning:', err);
  rl.close();
  process.exit(1);
});
