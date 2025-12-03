# Sprint 3 Worksheet

Format: Markdown file in your repository, with all supporting files linked.

## 1. Load Testing

> [!IMPORTANT]
>
> ### Worksheet Question
>
> 1. [x] Describe your load testing environment:
>    
>    - [x] Tools used.
>    
>    - [x] Load test cases.
>   
> 2. [x] Provide the test report.
>
> 3. [x] Discuss one bottleneck found.
>
> 4. [x] State whether you met your non-functional requirements.
>
>    - If not, why? Could you meet them with more resources/money?
>   
> 5. [x] If using JMeter:
>
>    - [x]  Upload .jmx file to GitHub and provide link.
>          
>    - [x]  Include snapshot of results.

## 1. Load Testing Environment

### Infrastructure
| Component | Details |
|-----------|---------|
| **API Server** | Cloudflare Workers (Edge, globally distributed) |
| **Database** | Supabase (PostgreSQL) |
| **LLM Service** | OpenRouter → Google Gemini 2.0 Flash Lite |
| **Domain** | `api.budgetwise.ca` |

### Test Machine
| Spec | Value |
|------|-------|
| OS | macOS Sequoia |
| Location | Winnipeg, Canada |
| Network | Residential broadband |

---

## 2. Tools Used

### Primary Tool: [Grafana k6](https://k6.io/)

k6 is an open-source load testing tool built for developer experience. We chose k6 over alternatives like JMeter because:

- **JavaScript-based**: Native scripting that matches our TypeScript codebase
- **CLI-first**: Easy CI/CD integration without GUI overhead
- **Modern protocols**: Built-in HTTP/2, WebSocket support
- **Rich metrics**: Custom metrics, thresholds, and detailed reporting
- **Lightweight**: Single binary, no JVM or dependencies

### Supporting Tools
| Tool | Purpose |
|------|---------|
| `tsx` | TypeScript execution for test setup scripts |
| `@supabase/supabase-js` | User creation and token generation |
| `k6-reporter` | HTML report generation |

### Test Files
```
load-tests/
├── load-test.js           # Main k6 load test script
├── create-test-users.ts   # Creates 20 test users in Supabase
├── seed-test-data.ts      # Seeds categories/transactions for users
├── tokens.json            # JWT tokens (20 unique users)
└── README.md              # Setup instructions
```

---

## 3. Load Test Cases

### Non-Functional Requirements
From our project specification:
- **20 concurrent users**
- **200 requests per minute** (minimum)
- **Response time p95 < 500ms**
- **Error rate < 1%**

### Test Scenarios

| Test Case | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| **TC-1: Authentication** | `/auth/me` | GET | Verify JWT token validation and user profile retrieval |
| **TC-2: List Transactions** | `/v1/transactions` | GET | Retrieve user's transaction history |
| **TC-3: List Categories** | `/v1/categories` | GET | Retrieve user's budget categories |
| **TC-4: Create Transaction** | `/v1/transactions` | POST | Create a new financial transaction |
| **TC-5: Invoice Parsing** | `/v1/transactions/parse-invoice` | POST | LLM-powered invoice OCR (5% of iterations) |

### Test Configuration

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Sustained load
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],       // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],         // < 1% failure rate
    http_reqs: ['rate>3.33'],               // > 200 req/min
    invoice_parsing_duration: ['p(95)<10000'], // LLM ops < 10s
  },
};
```

### Multi-User Simulation

Each of the 20 virtual users (VUs) authenticates with a **unique JWT token** from a real Supabase account, ensuring realistic session isolation:

```javascript
const vuIndex = (__VU - 1) % tokenData.length;
const token = tokenData[vuIndex]; // Different user per VU
```

---

## 4. Test Results

### Summary

| Metric | Result | Threshold | Status |
|--------|--------|-----------|--------|
| **Total Requests** | 2,720 | - | - |
| **Request Rate** | 1,350/min (22.50/s) | >200/min | ✅ **PASS** (6.75x target) |
| **Response Time (p95)** | 211.78ms | <500ms | ✅ **PASS** |
| **Error Rate** | 0.51% | <1% | ✅ **PASS** |
| **Concurrent Users** | 20 VUs | 20 | ✅ **PASS** |
| **Duration** | 2m 0.9s | - | - |
| **Iterations** | 672 | - | - |

### Detailed Metrics

#### Per-Endpoint Response Times (ms)

| Endpoint | Avg | Median | p90 | p95 | Max |
|----------|-----|--------|-----|-----|-----|
| `GET /auth/me` | 38.88 | 36 | 45 | 64 | 162 |
| `GET /v1/transactions` | 157.56 | 149 | 197 | 215 | 614 |
| `GET /v1/categories` | 152.35 | 145 | 188 | 207 | 384 |
| `POST /v1/transactions` | 152.82 | 142 | 190 | 214 | 868 |
| `POST /v1/.../parse-invoice` | 4,835 | 5,098 | 5,903 | 6,207 | 6,333 |

#### Check Results

| Check | Pass | Fail | Pass Rate |
|-------|------|------|-----------|
| auth/me status 200 | 672 | 0 | 100% ✅ |
| auth/me has user id | 672 | 0 | 100% ✅ |
| auth/me has email | 672 | 0 | 100% ✅ |
| GET /transactions 200 | 672 | 0 | 100% ✅ |
| transactions is array | 672 | 0 | 100% ✅ |
| GET /categories 200 | 672 | 0 | 100% ✅ |
| categories is array | 672 | 0 | 100% ✅ |
| POST /transactions 201 | 672 | 0 | 100% ✅ |
| created tx has id | 672 | 0 | 100% ✅ |
| invoice parsed (200) | 18 | 14 | 56% ⚠️ |
| has merchant | 18 | 14 | 56% ⚠️ |

**Overall Check Success Rate: 99.54%**

---

## 5. Bottleneck Analysis: Invoice Parsing

### The Problem

The LLM-powered invoice parsing endpoint (`POST /v1/transactions/parse-invoice`) is **125x slower** than CRUD operations:

| Operation Type | Avg Response Time |
|----------------|-------------------|
| CRUD Operations | ~38-158ms |
| **Invoice Parsing** | **4,835ms** |

### Root Causes

#### 1. External API Chain
```
Client → Cloudflare Worker → OpenRouter → Google Gemini → back
```
Each network hop adds 50-200ms of latency.

#### 2. Vision Model Inference
The `google/gemini-2.0-flash-lite-001` model must:
1. Decode base64 image (~15KB-200KB)
2. Run OCR on invoice text
3. Parse document structure
4. Generate structured JSON response

Even "flash" models require 3-5 seconds for multi-modal inputs.

#### 3. Token Generation
- System prompt: ~500 tokens
- Max completion: 6,400 tokens (increased from 800 to handle complex invoices)
- Total: ~7,000 tokens per request potential

#### 4. OpenRouter Rate Limiting
OpenRouter implements rate limits that affect concurrent requests:
- **44% failure rate** (14 of 32 invoice requests failed)
- Rate limits are per-account, not per-API-key
- Free tier: ~3-10 requests/minute for vision models
- Throttled requests return HTTP 429 or timeout

**How OpenRouter Rate Limits Work:**
```
1. Token-based: Limits on tokens per minute (TPM)
2. Request-based: Limits on requests per minute (RPM)
3. Model-specific: Vision models have stricter limits
4. Burst handling: Short bursts allowed, then throttled
```

### Why This Is Expected (Not a Bug)

LLM operations are **fundamentally different** from CRUD:

| Characteristic | CRUD | LLM |
|----------------|------|-----|
| Computation Location | Edge (Cloudflare) | Remote (Google Cloud) |
| Processing Type | Database lookup | Neural network inference |
| Latency | Milliseconds | Seconds |
| Cost | Sub-cent | 1-5 cents per image |

### Mitigation Strategies

1. **Async Processing**: Return job ID immediately, process in background
2. **Client UX**: Show progress indicator, expected wait time (5-10s)
3. **Rate Limiting**: Limit 5 invoice uploads per user per minute
4. **Caching**: Don't re-parse identical images (hash-based dedup)
5. **Batch Optimization**: Collect multiple invoices, process sequentially

---

## 6. Non-Functional Requirements: Status

### ✅ All Core Requirements Met

| Requirement | Target | Actual | Status |
|-------------|--------|--------|--------|
| Concurrent Users | 20 | 20 | ✅ Met |
| Throughput | 200 req/min | 1,350 req/min | ✅ **6.75x exceeded** |
| Response Time (p95) | <500ms | 212ms | ✅ **58% under target** |
| Error Rate | <1% | 0.51% | ✅ Met |

### ⚠️ LLM Feature Partially Met

The invoice parsing feature (optional enhancement) has:
- 56% success rate under concurrent load (18/32 requests)
- Average 4.8s response time (within 10s threshold)

**This is acceptable** because:
1. Invoice parsing is a non-critical enhancement
2. Core budgeting functionality (CRUD) is 100% reliable
3. LLM operations are inherently slower and more resource-intensive

---

## 7. Could We Improve With More Resources?

### Yes, but with diminishing returns

| Investment | Expected Improvement | Cost Impact |
|------------|---------------------|-------------|
| **Faster LLM Model** (Claude 3.5 Sonnet) | 20-30% faster | 3x per request |
| **Dedicated API Tier** (OpenRouter Pro) | Higher rate limits | $50-200/month |
| **Edge Caching** | Repeat queries instant | Minimal |
| **Background Workers** | Better UX (async) | Development time |
| **Regional Replicas** | Lower latency globally | Supabase Pro ($25/mo) |

### Recommended Priority

1. **Low-Hanging Fruit**: Implement async job queue for invoice parsing (free)
2. **Quick Win**: Add image hash caching (prevents duplicate processing)
3. **If needed**: Upgrade to higher OpenRouter rate limits

### Current Architecture Is Cost-Efficient

- Cloudflare Workers: Free tier (100K req/day)
- Supabase: Free tier (500MB database, 50K auth requests)
- OpenRouter: Pay-per-use (~$0.01/invoice)

**Total monthly cost at current scale: ~$5-10**

---

## 8. Conclusion

BudgetWise's API **passes all non-functional requirements** for Sprint 3:

- ✅ 20 concurrent users supported
- ✅ 1,350 requests/minute (6.75x the 200 req/min target)
- ✅ 212ms p95 response time (58% under 500ms threshold)
- ✅ 0.51% error rate (under 1% threshold)
- ✅ 99.54% overall check success rate

The identified bottleneck (LLM invoice parsing) is:
- Expected behavior for AI features (external API dependency)
- Isolated from core functionality (56% success, but core is 100%)
- Addressable with async processing or rate limit upgrades if needed

---

## Appendix: Running the Load Test

### Prerequisites
```bash
brew install k6  # macOS
# or: https://grafana.com/docs/k6/latest/set-up/install-k6/
```

### Setup (One-time)
```bash
cd load-tests
pnpm install
pnpm exec tsx create-test-users.ts  # Creates 20 test users
```

### Run Load Test
```bash
k6 run -e BASE_URL=https://api.budgetwise.ca load-test.js
```

### View Report
Open [load-test-report-2025-12-03T00-43-33-427Z.html](https://github.com/user-attachments/files/23893429/load-test-report-2025-12-03T00-43-33-427Z.html) in a browser.

---

## Files on GitHub

- [`load-tests/load-test.js`](./load-test.js) - k6 test script
- [`load-tests/create-test-users.ts`](./create-test-users.ts) - User setup
- [`load-tests/README.md`](./README.md) - Documentation
- [`load-tests/LOAD_TEST_REPORT.md`](./LOAD_TEST_REPORT.md) - This report

  
## 2. Security Analysis

> [!IMPORTANT]
>
> ### Worksheet Question 
>
> 1. [ ] Describe your chosen security analysis tool and how you ran it.
>    
>    - [ ] Tool must analyze the main language used in your project.
>   
> 2. [ ] Attach static analysis report as an appendix.
>
> 3. [ ] Randomly select 5 detected problems and discuss what you see.
>
> 4. [ ] **Required:** Handle or mitigate all Critical and High vulnerabilities.
>
>    - [ ] Attach commit links for these fixes.
>   
> 5. [ ] If no critical/high vulnerabilities: Discuss 2 other problems found.


## 3. Continuous Integration & Deployment (CI/CD)

> [!IMPORTANT]
>
> ### Worksheet Question 
>
> 1. [ ]  Describe your CI/CD environment.
>   
> 2. [ ]  Provide clickable link to your pipeline (e.g., GitHub Actions workflow, Jenkins pipeline file).
>
> 3. [ ]  Provide two snapshots:
>
>    - [ ] One for CI execution.
>   
>    - [ ] One for CD execution.



## 4. Reflections

> [!IMPORTANT]
>
> ### Worksheet Question 
>
> 1. [x]  Design Changes
>
>    - In one paragraph: What would you change about the design of your project now that you’ve been through development?
>   
> 2. [x]  Project Setup Changes
>
>   - In one paragraph: What would you change about the course/project setup?

       - Requirements?

       - Check-ins?

       - Process changes?
### Design Changes

Now that we’ve been through development, one major change we would make to the design of the project is ensuring a clearer separation between UI components, data-fetching logic, and layout responsibilities from the very beginning. As the app grew, certain components became tightly coupled with state and layout logic, which made updates and styling more complicated than necessary. If we were to start again, we would prioritize a more modular component structure, standardized styling patterns, and a shared UI design system to prevent inconsistencies across pages. We would also define clearer flows for user interactions (like spending breakdowns, weekly vs calendar views, and dashboard navigation) earlier in the design phase to avoid reworking these features mid-development.

### Project Setup Changes
For the overall course and project setup, one thing we would change is having clearer expectations around requirements and milestones earlier on. At times, it felt like key details - especially around the tech stack, documentation standards, and presentation format were inferred rather than explicitly given. More structured and consistent check-ins would have helped keep the group aligned, especially during weeks with heavier workloads across other courses. In terms of process, having dedicated time for planning and architectural decisions at the start of the project would have reduced refactoring later on, and a more guided approach to setting up CI/CD, testing strategy, and team workflows would have made the development process smoother.

## 4. Individual AI/External Reflections 

> [!IMPORTANT]
>
> ### Worksheet Question 
>
> 1. [ ]  If you used AI or external references: Given an example of a problem you tried to solve, what did the tool produce (summary is fine), and what did you rewrite, validate, or learn from its response?
>
>   - If you did not use AI: Why not? What influenced that choice, and how did you approach problem-solving instead?
>   
>   - Length guideline: approximately 5–8 sentences. Focus only on your own actions and understanding.

### Ahnaf: AI/External Resource Reflection:

I used Claude-Opus-4.1 for initial development scaffolding in Sprint 0-1 and for project coordination starting in Sprint 2. 
For the early sprints, Claude helped me generate mock data structures and a localStorage-based persistence layer, which gave us a working prototype before the backend was ready. However, the frontend output needed significant polishing. components had inconsistent spacing, hardcoded pixel values, and race conditions where rapid actions caused localStorage to desync.
In Sprint 2, I started using Claude to break down tasks and track team progress once coordination issues became apparent. This taught me AI is great for getting a foundation quickly, but the output always needs human refinement. It also showed me how AI can really help structure information, in this case, the messy chatlogs of our work.

### Sid:

### Steph: AI / External Resource Reflection

During this project, I used AI (ChatGPT-4o) as a support tool to help me debug and refine several front-end components. One specific problem I tried to solve was that the weekly bar chart and calendar selection logic were returning the wrong day’s transactions, and the UI header was showing long, unreadable date strings. The AI initially gave me a general explanation of why my state values were inconsistent (mixing short day labels with full date strings), but I rewrote the solution to fit my actual component structure and to avoid breaking the rest of the layout. I validated the implementation by manually testing both views and confirming that clicking either a bar or a calendar day produced identical, correctly filtered results. Another area where I used AI was improving the UI design of the transaction rows and legend styling; the tool provided CSS patterns, but I adapted spacing, shadows, and colors to match our existing theme. Through this process, I learned how to unify date handling in React components, how to make state transitions predictable, and how to design reusable UI patterns that look consistent across a dashboard. Overall, AI helped me reason through problems faster, but I still had to understand the underlying logic, rewrite portions of the solution, and ensure it fit our codebase and our team’s design direction.

### Ramatjyot:

### Bryce:

One problem I tried to solve with AI was the hierarchical budget dropdown feature. We had attempted several implementations that failed already so when it was my turn I went straight to AI for help. Even after trying many AI suggested approaches, none of them ever fully worked. So once I reached this wall I decided to finally step back and investigate whether the issue was elsewhere, and I realized the real problem was that our backend and database weren't set up to support hierarchical budgets in the first place. What I learned from this is that my approach was flawed. I went to AI first instead of fully understanding the system constraints which would have led me to a solution much faster. Once I recognized the architectural limitation, I suggested that we remove the multi budget feature since supporting it would require a major refactor of our business logic. In the real world that wouldn't be the correct decision, but given the scope of this course project, we chose not to implement it. The bigger lesson I can take away from this is that I need to completely understand and solve complex problems before I even think of AI, and when I do it should only be used as a coding aid or to solve problems small in scope, not a system wide problem solver.


## Sprint 3 Quick Checklist

- [x] Load testing environment described.

- [x] Test report + bottleneck discussion included.

- [x] Non-functional goals assessed.

- [x] JMeter .jmx file linked (if applicable) + results snapshot.

- [ ] Security tool described + full report attached.

- [ ] 5 problems discussed (or 2 if no critical/high).

- [ ] Critical/high vulnerabilities fixed + commit links included.

- [ ] CI/CD environment described + pipeline link.

- [ ] CI and CD execution snapshots included.

- [x] Design changes paragraph included.

- [x] Project setup changes paragraph included.
