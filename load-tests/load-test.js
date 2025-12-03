import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Trend } from 'k6/metrics';
import encoding from 'k6/encoding';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// Custom metrics for detailed analysis
const invoiceParsingDuration = new Trend('invoice_parsing_duration');
const authMeDuration = new Trend('auth_me_duration');
const transactionsGetDuration = new Trend('transactions_get_duration');
const categoriesGetDuration = new Trend('categories_get_duration');
const transactionsPostDuration = new Trend('transactions_post_duration');

// Load tokens - one per virtual user for realistic simulation
// Usage:
//   - Generate multiple tokens: npx tsx load-tests/generate-token.ts
//   - Or single token: k6 run -e AUTH_TOKEN=your-jwt-token load-tests/load-test.js
const tokenData = new SharedArray('tokens', function() {
  // First check for env variable (single token mode)
  if (__ENV.AUTH_TOKEN) {
    return [__ENV.AUTH_TOKEN];
  }
  
  // Try to load multiple tokens from tokens.json
  try {
    const tokensFile = open('./tokens.json');
    return JSON.parse(tokensFile);
  } catch (e) {
    // Fall back to single token file
    try {
      return [open('./token.txt').trim()];
    } catch (e2) {
      console.error('Error reading tokens. Either:');
      console.error('  1. Run: npx tsx load-tests/generate-token.ts');
      console.error('  2. Or pass token directly: k6 run -e AUTH_TOKEN=your-jwt load-tests/load-test.js');
      return [''];
    }
  }
});

// Load a sample invoice image (base64 encoded)
const invoiceData = new SharedArray('invoice', function() {
  try {
    const img = open('../profiler/invoices/invoice_1_grocery.jpg', 'b');
    return [encoding.b64encode(img)];
  } catch (e) {
    console.warn('Could not load invoice image. Invoice parsing test will be skipped.');
    return [null]; // null to properly skip invoice test
  }
});

// Non-Functional Requirement:
// - 20 concurrent users
// - 200 requests per minute total (10 req/min per user = ~1 request every 6 seconds)
// Current test: Each iteration makes 4 requests with 4s sleep = ~48 requests/min per VU at full load
// With 20 VUs: ~960 requests/min (well exceeds 200 req/min requirement)

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users for sustained load
    { duration: '30s', target: 0 },  // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],    // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],      // Less than 1% failure rate
    http_reqs: ['rate>3.33'],            // At least 200 req/min = 3.33 req/s
    invoice_parsing_duration: ['p(95)<10000'], // LLM operations can be slow, allow 10s
  },
};

// Configure target URL via environment variable or default to local
// Usage: k6 run -e BASE_URL=https://api.budgetwise.ca load-tests/load-test.js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';

export default function () {
  // Each VU gets a different token for realistic multi-user simulation
  // __VU is the virtual user ID (1-indexed)
  const vuIndex = (__VU - 1) % tokenData.length;
  const token = tokenData[vuIndex];
  
  if (!token) {
    console.error('No token found. Aborting.');
    return;
  }

  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  // 1. Get User Profile - Track with custom metric
  const meStart = Date.now();
  const meRes = http.get(`${BASE_URL}/auth/me`, params);
  authMeDuration.add(Date.now() - meStart);
  check(meRes, {
    'auth/me status 200': (r) => r.status === 200,
    'auth/me has user id': (r) => {
      try { return r.json('id') !== undefined; }
      catch { return false; }
    },
    'auth/me has email': (r) => {
      try { return r.json('email') !== undefined; }
      catch { return false; }
    },
  });

  sleep(0.5);

  // 2. Get Transactions (v1 API)
  const txStart = Date.now();
  const transactionsRes = http.get(`${BASE_URL}/v1/transactions`, params);
  transactionsGetDuration.add(Date.now() - txStart);
  check(transactionsRes, {
    'GET /transactions 200': (r) => r.status === 200,
    'transactions is array': (r) => {
      try { return Array.isArray(r.json('transactions')); }
      catch { return false; }
    },
  });
  
  sleep(0.5);

  // 3. Get Categories (v1 API)
  const catStart = Date.now();
  const categoriesRes = http.get(`${BASE_URL}/v1/categories`, params);
  categoriesGetDuration.add(Date.now() - catStart);
  check(categoriesRes, {
    'GET /categories 200': (r) => r.status === 200,
    'categories is array': (r) => {
      try { return Array.isArray(r.json('categories')); }
      catch { return false; }
    },
  });

  sleep(0.5);

  // 4. Create a Transaction (v1 API)
  const payload = JSON.stringify({
    amountCents: Math.floor(Math.random() * 10000) + 100, // $1-$100
    occurredAt: new Date().toISOString(),
    note: `Load Test Transaction VU${__VU} iter${__ITER}`,
  });

  const createStart = Date.now();
  const createRes = http.post(`${BASE_URL}/v1/transactions`, payload, params);
  transactionsPostDuration.add(Date.now() - createStart);
  check(createRes, {
    'POST /transactions 201': (r) => r.status === 201,
    'created tx has id': (r) => {
      try { return r.json('transaction.id') !== undefined; }
      catch { return false; }
    },
  });

  sleep(0.5);

  // 4. Parse Invoice (LLM Operation) - v1 API
  // Only run this occasionally (5% of iterations) to avoid overwhelming the LLM API
  if (Math.random() < 0.05 && invoiceData[0] !== null) {
    const invoicePayload = JSON.stringify({
      imageBase64: invoiceData[0],
    });
    
    const start = Date.now();
    const invoiceRes = http.post(`${BASE_URL}/v1/transactions/parse-invoice`, invoicePayload, params);
    const duration = Date.now() - start;
    
    invoiceParsingDuration.add(duration);

    check(invoiceRes, {
      'invoice parsed (200)': (r) => r.status === 200,
      'has merchant': (r) => r.json('invoice.merchant') !== undefined,
    });
  }
}

// Generate comprehensive reports
export function handleSummary(data) {
  // Add timestamp to report filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`load-test-report-${timestamp}.html`]: htmlReport(data),
    [`load-test-results-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}