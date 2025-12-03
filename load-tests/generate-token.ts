import { SignJWT } from 'jose';
import fs from 'fs';
import path from 'path';

// Load environment variables from apps/api/.dev.vars
const envPath = path.resolve(__dirname, '../apps/api/.dev.vars');
let jwtSecret = '';

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && key.trim() === 'SUPABASE_JWT_SECRET' && value) {
      jwtSecret = value.trim();
    }
  });
}

if (!jwtSecret) {
  console.error('Error: SUPABASE_JWT_SECRET not found in apps/api/.dev.vars');
  process.exit(1);
}

const NUM_USERS = 20; // Number of virtual users to generate tokens for

async function generateToken(index: number): Promise<string> {
  const secret = new TextEncoder().encode(jwtSecret);
  const userId = `mock-load-test-user-${index.toString().padStart(2, '0')}`;
  
  const jwt = await new SignJWT({
      sub: userId,
      email: `loadtest${index}@example.com`,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'https://budgetwise.ca/load-test'
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secret);
    
  return jwt;
}

async function main() {
  console.log(`Generating ${NUM_USERS} mock user tokens...`);
  
  const tokens: string[] = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const token = await generateToken(i);
    tokens.push(token);
    console.log(`  ✓ User ${i.toString().padStart(2, '0')}: mock-load-test-user-${i.toString().padStart(2, '0')}`);
  }
  
  // Save all tokens as JSON array
  const tokensPath = path.join(__dirname, 'tokens.json');
  fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
  console.log(`\n✅ ${NUM_USERS} tokens saved to load-tests/tokens.json`);
  
  // Also save first token to token.txt for backward compatibility
  const singleTokenPath = path.join(__dirname, 'token.txt');
  fs.writeFileSync(singleTokenPath, tokens[0]);
  console.log(`✅ First token also saved to load-tests/token.txt`);
}

main().catch(console.error);