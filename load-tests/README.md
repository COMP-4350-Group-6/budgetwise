# Load Testing with k6

This directory contains scripts for load testing the BudgetWise API using [k6](https://k6.io/).

---

## Sprint 3 - Load Testing Environment Description

### Tools Used
- **k6** (v0.47+): Open-source load testing tool by Grafana Labs
  - Modern JavaScript-based scripting
  - Built-in metrics collection and thresholds
  - Support for custom metrics (used for LLM latency tracking)
- **Node.js/tsx**: For JWT token generation
- **jose**: JWT library for signing test tokens

### Test Environment
- **Target**: BudgetWise API running on Cloudflare Workers
- **Local Development**: `http://localhost:8787` (via Wrangler)
- **Authentication**: Supabase-compatible JWT tokens (HS256)

---

## Prerequisites

1.  **Install k6**: Follow the instructions [here](https://k6.io/docs/get-started/installation/).
    *   MacOS: `brew install k6`
    *   Windows: `winget install k6`
    *   Linux: `sudo apt-get install k6` (Debian/Ubuntu)

2.  **Install Dependencies**: Ensure project dependencies are installed.
    ```bash
    pnpm install
    ```

3.  **Environment Setup**:
    *   Ensure `apps/api/.dev.vars` exists and contains `SUPABASE_JWT_SECRET`.
    *   Ensure your API is running locally (default: `http://localhost:8787`).

## Running the Load Test

### Option A: Local Development (localhost)

1.  **Start the API Server**:
    ```bash
    cd apps/api && pnpm dev
    ```

2.  **Generate a Mock User Token**:
    This script generates a valid JWT signed with your local secret and saves it to `load-tests/token.txt`.
    ```bash
    npx tsx load-tests/generate-token.ts
    ```

3.  **Run the k6 Test**:
    ```bash
    k6 run load-tests/load-test.js
    ```

### Option B: Production API (api.budgetwise.ca)

1.  **Get a Production JWT Token**:
    - Log into the app at https://budgetwise.ca
    - Open DevTools (F12) → Application → Local Storage
    - Copy the `supabase.auth.token` value (or `sb-<project>-auth-token`)
    - Save the access_token to `load-tests/token.txt`
    
    Or use curl:
    ```bash
    # Login to get a session token
    curl -X POST 'https://yikylzhrskotiqnaitwz.supabase.co/auth/v1/token?grant_type=password' \
      -H 'apikey: YOUR_SUPABASE_ANON_KEY' \
      -H 'Content-Type: application/json' \
      -d '{"email":"loadtest@example.com","password":"your-test-password"}'
    ```

2.  **Run against Production**:
    ```bash
    k6 run -e BASE_URL=https://api.budgetwise.ca load-tests/load-test.js
    ```

### Option C: Branch Preview URL (Recommended for Testing)

1.  Create a branch and push to trigger Cloudflare deployment
2.  Get the preview URL from the GitHub Actions workflow (e.g., `https://your-branch-frontend.ramatjyot13-ca.workers.dev`)
3.  The API preview will be at a similar URL pattern
4.  Run:
    ```bash
    k6 run -e BASE_URL=https://your-branch-api-preview-url load-tests/load-test.js
    ```

### Generating Reports

```bash
# JSON output for analysis
k6 run --out json=results.json -e BASE_URL=https://api.budgetwise.ca load-tests/load-test.js

# Summary to file
k6 run -e BASE_URL=https://api.budgetwise.ca load-tests/load-test.js 2>&1 | tee load-test-results.txt
```

---

## Test Cases

### Load Test Scenario (`load-test.js`)

The test simulates a realistic user workflow with authenticated API calls:

| Phase | Duration | Virtual Users | Description |
|-------|----------|---------------|-------------|
| Ramp-up | 30s | 0 → 20 | Gradually increase load |
| Steady State | 60s | 20 | Sustained load |
| Ramp-down | 30s | 20 → 0 | Graceful decrease |

**Total Test Duration**: 2 minutes

### Endpoints Tested Per Iteration

Each virtual user performs these operations per iteration:

| Endpoint | Method | Description | Expected Response |
|----------|--------|-------------|-------------------|
| `/auth/me` | GET | Verify JWT authentication | 200 OK |
| `/transactions` | GET | Fetch user's transactions | 200 OK |
| `/categories` | GET | Fetch user's categories | 200 OK |
| `/transactions` | POST | Create a new transaction | 201 Created |
| `/transactions/parse-invoice` | POST | LLM invoice parsing (5% of iterations) | 200 OK |

---

## Metrics & Thresholds (Non-Functional Requirements)

### Capacity Requirement
> **The system must handle 20 concurrent users with 200 requests per minute.**

### Pass/Fail Criteria

| Metric | Threshold | Requirement |
|--------|-----------|-------------|
| `http_req_duration` | p(95) < 500ms | 95% of requests complete within 500ms |
| `http_req_failed` | rate < 1% | Less than 1% error rate |
| `http_reqs` | rate > 3.33/s | At least 200 requests/minute throughput |
| `invoice_parsing_duration` | p(95) < 10000ms | LLM operations complete within 10s |

### Key Metrics Collected

- **Request Duration**: Min, Max, Mean, P50, P90, P95, P99
- **Request Rate**: Requests per second
- **Error Rate**: Failed requests percentage
- **Virtual Users**: Active VUs over time
- **Custom Metric**: `invoice_parsing_duration` for LLM latency

---

## Load Test Results (Actual Run)

### Summary (Latest Run - Dec 3, 2025)
```
✓ http_req_duration: p(95)=211.78ms (target: <500ms) - PASS
✓ invoice_parsing_duration: p(95)=6207ms (target: <10s) - PASS
✓ http_reqs: 22.50 req/s = 1350 req/min (target: >200 req/min) - PASS
✓ http_req_failed: 0.51% (target: <1%) - PASS
```

### Interpretation
- **Performance**: ✅ EXCELLENT - API responds in ~212ms p95
- **Throughput**: ✅ EXCEEDS requirements (1350 vs 200 req/min = 6.75x)
- **CRUD Operations**: ✅ 100% success rate
- **LLM Operations**: ⚠️ 56% success rate (rate limit throttling)

### Check Results

| Check | Pass | Fail | Rate |
|-------|------|------|------|
| auth/me status 200 | 672 | 0 | 100% ✅ |
| auth/me has user id | 672 | 0 | 100% ✅ |
| GET /transactions 200 | 672 | 0 | 100% ✅ |
| GET /categories 200 | 672 | 0 | 100% ✅ |
| POST /transactions 201 | 672 | 0 | 100% ✅ |
| invoice parsed (200) | 18 | 14 | 56% ⚠️ |

**Overall: 99.54% check success rate**

---

## Expected Bottleneck: LLM Invoice Parsing

Based on the profiler reports in `/profiler/`, the **LLM invoice parsing** is the primary bottleneck:

| Metric | Auto-Categorization | Invoice Parsing |
|--------|---------------------|-----------------|
| Mean Latency | ~682ms | ~4835ms |
| P95 Latency | ~1103ms | ~6207ms |
| Max Latency | ~2614ms | ~6333ms |

**Why it's slow**: Invoice parsing requires:
1. Base64 image encoding/decoding
2. Vision model processing (OpenRouter → Google Gemini)
3. Structured data extraction from visual content
4. External API network latency

**Mitigation Strategy**:
- Run invoice parsing on only 5% of load test iterations
- Set separate, relaxed threshold (10s) for LLM operations
- Consider async/queue-based processing for production

---

## OpenRouter Rate Limiting Explained

### How OpenRouter Rate Limits Work

BudgetWise uses [OpenRouter](https://openrouter.ai) as an LLM gateway to access Google Gemini for invoice parsing. OpenRouter implements rate limiting that directly impacts load test performance.

### Rate Limit Types

| Limit Type | Description | Impact |
|------------|-------------|--------|
| **RPM (Requests Per Minute)** | Hard cap on API calls | HTTP 429 when exceeded |
| **TPM (Tokens Per Minute)** | Limits total tokens processed | Requests queued/throttled |
| **Concurrent Requests** | Parallel request limits | Requests queued |
| **Model-Specific Limits** | Vision models have stricter limits | Invoice parsing affected |

### Free Tier Limits

OpenRouter's free tier has approximate limits:
- **Text models**: ~10-20 requests/minute
- **Vision models**: ~3-10 requests/minute (varies by model)
- **Token limits**: ~100K tokens/minute

### How It Affects Load Testing

During our load test with 20 concurrent users:

```
20 VUs × 5% invoice probability = ~1 invoice request/second
OpenRouter Vision Limit = ~3-10 requests/minute

Result: Many requests throttled or rejected (429 errors)
```

### Rate Limit Behavior Observed

| Scenario | Behavior |
|----------|----------|
| Under limit | Normal 3-5s response |
| Approaching limit | Increased latency (5-7s) |
| At/over limit | HTTP 429 "Too Many Requests" |
| Sustained overload | Requests queued, 10-12s latency |

### Load Test Results vs Rate Limits

| Run | Requests | Success | Failure | Failure Cause |
|-----|----------|---------|---------|---------------|
| Run 1 | 32 | 18 (56%) | 14 (44%) | Rate limit → 429 |
| Run 2 | 29 | 18 (62%) | 11 (38%) | Rate limit → 429 |

### Why This Isn't a Bug

The 44-56% invoice parsing failure rate under load is **expected behavior**:
1. OpenRouter rate-limits are per-account, not per-request
2. Vision models (Gemini) have stricter limits than text models
3. Concurrent users all share the same OpenRouter API key
4. Free tier limits are intentionally restrictive

### Solutions

| Solution | Complexity | Cost |
|----------|------------|------|
| **Reduce concurrency** | Easy | Free |
| **Add retry logic** | Medium | Free |
| **Implement request queue** | Medium | Free |
| **Upgrade OpenRouter tier** | Easy | $50-200/month |
| **Use multiple API keys** (load balancing) | Medium | Variable |

### Recommended: Rate-Limited Queue

For production, implement a server-side queue:

```typescript
// Pseudo-code for rate-limited queue
const invoiceQueue = new RateLimitedQueue({
  maxPerMinute: 5,
  retryOn429: true,
  backoffMultiplier: 2
});

// User requests go to queue, not directly to OpenRouter
await invoiceQueue.add(invoiceParseJob);
```

This ensures 100% eventual success while respecting rate limits

---

## Sample Test Output

After running `k6 run load-tests/load-test.js`, you'll see output like:

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: load-tests/load-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 20 max VUs, 2m30s max duration (incl. graceful stop)
           default: Up to 20 looping VUs for 2m0s over 3 stages

running (2m00.0s), 00/20 VUs, 1200 complete and 0 interrupted iterations
default ✓ [======================================] 00/20 VUs  2m0s

     ✓ status is 200
     ✓ has user id
     ✓ status is 201 or 200
     ✓ invoice parsed (200)
     ✓ has merchant

     checks.........................: 100.00% ✓ 4800  ✗ 0
     http_req_duration..............: avg=45ms min=12ms med=38ms max=312ms p(90)=89ms p(95)=124ms
   ✓ http_req_failed................: 0.00%   ✓ 0     ✗ 4800
     http_reqs......................: 4800    40/s
     invoice_parsing_duration.......: avg=1850ms min=1200ms med=1780ms max=4200ms p(90)=2800ms p(95)=3500ms
     iteration_duration.............: avg=4.2s min=4.0s med=4.1s max=8.5s p(90)=4.5s p(95)=5.2s
     iterations.....................: 1200    10/s
     vus............................: 1       min=1   max=20
     vus_max........................: 20      min=20  max=20
```

---

## Comparison: k6 vs JMeter

| Feature | k6 | JMeter |
|---------|-----|--------|
| Scripting | JavaScript | XML/GUI |
| Setup | Single binary | Java dependency |
| CI/CD Integration | Excellent | Good |
| Resource Usage | Lightweight | Heavy |
| Cloud Native | Yes | No |
| Custom Metrics | Easy | Moderate |

We chose **k6** for its modern JavaScript API, lightweight footprint, and easy CI/CD integration with GitHub Actions.