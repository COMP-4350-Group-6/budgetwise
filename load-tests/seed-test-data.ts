import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'https://api.budgetwise.ca';

// Load tokens from tokens.json
const tokensPath = path.join(__dirname, 'tokens.json');
if (!fs.existsSync(tokensPath)) {
  console.error('❌ tokens.json not found. Run create-test-users.ts first.');
  process.exit(1);
}

const tokens: string[] = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
console.log(`Loaded ${tokens.length} tokens`);
console.log(`Using API: ${BASE_URL}`);

// Quick health check
async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    console.log(`Health check: ${res.status} ${res.ok ? '✓' : '✗'}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Health response:', JSON.stringify(data));
    }
    
    // Test auth/me with first token
    const authRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokens[0]}` }
    });
    console.log(`Auth /me: ${authRes.status} ${authRes.ok ? '✓' : '✗'}`);
    
    // Test categories GET (v1 API)
    const catRes = await fetch(`${BASE_URL}/v1/categories`, {
      headers: { 'Authorization': `Bearer ${tokens[0]}` }
    });
    console.log(`GET /v1/categories: ${catRes.status}`);
    if (!catRes.ok) {
      const text = await catRes.text();
      console.log('Categories error:', text.substring(0, 200));
    }
  } catch (e) {
    console.error(`Health check failed: ${(e as Error).message}`);
    process.exit(1);
  }
}

async function seedCategoriesForUser(token: string, index: number): Promise<boolean> {
  try {
    // First try to seed default categories via the API (v1)
    const seedRes = await fetch(`${BASE_URL}/v1/categories/seed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (seedRes.ok) {
      const data = await seedRes.json();
      console.log(`  ✓ User ${index}: Categories seeded (${data.categories?.length || 0} categories)`);
      return true;
    }

    console.log(`  Debug User ${index}: Seed returned ${seedRes.status}`);

    // If seed endpoint doesn't exist, create categories manually
    if (seedRes.status === 404) {
      // Create a few default categories manually
      const categories = [
        { name: 'Groceries', icon: '🛒', color: '#4CAF50' },
        { name: 'Transport', icon: '🚗', color: '#2196F3' },
        { name: 'Entertainment', icon: '🎬', color: '#9C27B0' },
        { name: 'Bills', icon: '📄', color: '#FF5722' },
        { name: 'Shopping', icon: '🛍️', color: '#E91E63' }
      ];

      let created = 0;
      for (const cat of categories) {
        const res = await fetch(`${BASE_URL}/v1/categories`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cat)
        });
        if (res.ok) {
          created++;
        } else {
          const errText = await res.text();
          console.log(`    Category "${cat.name}" failed: ${res.status} - ${errText.substring(0, 50)}`);
        }
      }
      console.log(`  ✓ User ${index}: Created ${created} categories`);
      return created > 0;
    }

    const errorText = await seedRes.text();
    console.log(`  ⚠️ User ${index}: ${seedRes.status} - ${errorText.substring(0, 100)}`);
    return false;
  } catch (error) {
    console.error(`  ❌ User ${index}: ${(error as Error).message}`);
    return false;
  }
}

async function createSampleTransaction(token: string, index: number): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amountCents: Math.floor(Math.random() * 10000) + 100, // $1-$100
        occurredAt: new Date().toISOString(),
        note: `Seed transaction for loadtest user ${index}`
      })
    });

    if (res.ok) {
      console.log(`  ✓ User ${index}: Sample transaction created`);
      return true;
    }

    const errorText = await res.text();
    console.log(`  ⚠️ User ${index}: Transaction failed - ${res.status} - ${errorText.substring(0, 100)}`);
    return false;
  } catch (error) {
    console.error(`  ❌ User ${index}: Transaction error - ${(error as Error).message}`);
    return false;
  }
}

async function main() {
  // First verify API is reachable
  await checkHealth();
  
  console.log('\n📦 Seeding categories for test users...\n');
  
  let categoriesSeeded = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (await seedCategoriesForUser(tokens[i]!, i)) {
      categoriesSeeded++;
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\n✅ Categories seeded for ${categoriesSeeded}/${tokens.length} users`);

  console.log('\n💳 Creating sample transactions for test users...\n');
  
  let transactionsCreated = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (await createSampleTransaction(tokens[i]!, i)) {
      transactionsCreated++;
    }
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✅ Transactions created for ${transactionsCreated}/${tokens.length} users`);
  console.log('\n🎉 Done! Now run the load test:');
  console.log('   k6 run -e BASE_URL=https://api.budgetwise.ca load-test.js');
}

main().catch(console.error);