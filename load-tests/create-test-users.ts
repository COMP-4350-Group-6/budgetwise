import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from apps/api/.dev.vars
const envPath = path.resolve(__dirname, '../apps/api/.dev.vars');
let SUPABASE_URL = '';
let SUPABASE_SERVICE_ROLE_KEY = '';

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key?.trim() === 'SUPABASE_URL') {
        SUPABASE_URL = value?.trim() || '';
      }
      if (key?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') {
        SUPABASE_SERVICE_ROLE_KEY = value?.trim() || '';
      }
    }
  });
}

// Allow override from environment
SUPABASE_URL = process.env.SUPABASE_URL || SUPABASE_URL || 'https://yikylzhrskotiqnaitwz.supabase.co';
SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found');
  console.error('   Checked: apps/api/.dev.vars and environment variables');
  process.exit(1);
}

console.log(`Using Supabase URL: ${SUPABASE_URL}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const NUM_USERS = 20;
const TEST_PASSWORD = 'LoadTest123!'; // All test users share this password

interface TestUser {
  email: string;
  id?: string;
  accessToken?: string;
}

async function createTestUsers(): Promise<TestUser[]> {
  console.log(`Creating ${NUM_USERS} test users...`);
  const users: TestUser[] = [];

  for (let i = 0; i < NUM_USERS; i++) {
    const email = `loadtest${i.toString().padStart(2, '0')}@budgetwise.ca`;
    
    try {
      // Create user using admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: TEST_PASSWORD,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: `Load Test User ${i}`,
          defaultCurrency: 'CAD'
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`  ⚠️ User ${i}: ${email} already exists, fetching...`);
          // Try to get existing user
          const { data: existingUsers } = await supabase.auth.admin.listUsers();
          const existing = existingUsers?.users.find((u: { email?: string }) => u.email === email);
          if (existing) {
            users.push({ email, id: existing.id });
          }
        } else {
          console.error(`  ❌ User ${i}: ${error.message}`);
        }
      } else if (data.user) {
        console.log(`  ✓ User ${i}: ${email} (${data.user.id})`);
        users.push({ email, id: data.user.id });
      }
    } catch (e) {
      console.error(`  ❌ User ${i}: ${(e as Error).message}`);
    }
  }

  return users;
}

async function getTokensForUsers(users: TestUser[]): Promise<void> {
  console.log(`\nGetting access tokens for ${users.length} users...`);

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: TEST_PASSWORD
      });

      if (error) {
        console.error(`  ❌ ${user.email}: ${error.message}`);
      } else if (data.session) {
        user.accessToken = data.session.access_token;
        console.log(`  ✓ ${user.email}: Got token`);
      }
    } catch (e) {
      console.error(`  ❌ ${user.email}: ${(e as Error).message}`);
    }
  }
}

async function seedDataForUsers(users: TestUser[]): Promise<void> {
  console.log(`\nSeeding default categories for ${users.length} users...`);

  for (const user of users) {
    if (!user.id) continue;

    try {
      // Call the seed categories endpoint for each user
      const response = await fetch(`${SUPABASE_URL.replace('.supabase.co', '')}-api.budgetwise.ca/categories/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`  ✓ ${user.email}: Categories seeded`);
      } else {
        console.log(`  ⚠️ ${user.email}: Categories may already exist`);
      }
    } catch {
      // Ignore errors - categories might already exist
    }
  }
}

async function main() {
  // Step 1: Create users
  const users = await createTestUsers();
  console.log(`\n✅ Created/found ${users.length} users`);

  // Step 2: Get tokens
  await getTokensForUsers(users);
  const usersWithTokens = users.filter(u => u.accessToken);
  console.log(`\n✅ Got tokens for ${usersWithTokens.length} users`);

  // Step 3: Save tokens to JSON
  const tokens = usersWithTokens.map(u => u.accessToken);
  const tokensPath = path.join(__dirname, 'tokens.json');
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  console.log(`\n✅ Saved ${tokens.length} tokens to load-tests/tokens.json`);

  // Also save first token to token.txt for single-user mode
  if (tokens.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'token.txt'), tokens[0]!);
    console.log(`✅ First token saved to load-tests/token.txt`);
  }

  // Step 4: Try to seed data (optional, might fail if API not configured for external calls)
  // await seedDataForUsers(usersWithTokens);

  console.log(`\n🎉 Done! Run load test with:`);
  console.log(`   k6 run -e BASE_URL=https://api.budgetwise.ca load-tests/load-test.js`);
}

main().catch(console.error);