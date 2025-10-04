#!/usr/bin/env node
// scripts/create-test-user.js
// Creates a temporary test user in Supabase using the service role key from .env.local
// Usage: node scripts/create-test-user.js [email]
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const email = process.argv[2] || `dev+test+${Date.now()}@example.com`;
  const password = 'TempPass123!';

  try {
    // Use the Admin API to create a user
    const res = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error creating user:', e);
    process.exit(1);
  }
}

main();
