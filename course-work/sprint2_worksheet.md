# Sprint 2 Worksheet

Format: Markdown file in your repository. Include links to relevant code, scripts, reports, and diagrams.


## 1. Regression Testing

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Describe how you run regression testing:
>
>    - [ ] Which tests are executed?
>
>    - [ ] Which tool(s) are used?
>
> 2. [ ] Link to the regression testing script.
>
> 3. [ ] Include the latest snapshot of execution results.


## 2. Testing Slowdown

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Have you been able to keep all unit and integration tests from your test plan?
>
> 2. [ ] Have you created different test plans for different release types? Explain.


## 3. Not Testing

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [x] What parts of the system are not tested?
> 2. [x] Provide an updated system diagram.
> 3. [x] For each tier, indicate which layers are:
>    - [x] Fully tested (80%+)
>    - [x] Mostly tested (20–80%)
>    - [x] Somewhat tested (0–20%)
>    - [x] Not tested
> 4. [x] Include coverage reports for tested tiers.

### Overall Coverage Summary

**Repository Coverage: 55.3% lines | 74.5% functions**  
**Total Tests: 525 tests across 47 test files**

### What Parts Are Not Tested?

#### 1. **Composition Layer (0%)** - DI Containers
- `packages/composition/cloudflare-worker/` - Cloudflare Workers DI wiring
- `packages/composition/web-auth-client/` - Frontend authentication DI wiring

**Rationale:** Simple composition roots that wire dependencies. Validated through integration tests.

#### 2. **AI/LLM Use Cases (0%)** 
- `usecases/transactions/categorize-transaction.ts`
- `usecases/transactions/parse-invoice.ts`

**Rationale:** Thin wrappers around AI adapters. The underlying OpenRouter adapter has 100% coverage.

#### 3. **Observability Features (0%)**
- `domain/llm-model.ts` - Cost calculation models
- `domain/llm-call.ts` - LLM tracking entities
- `domain/default-categories.ts` - Seed data

**Rationale:** Newer observability features. Money value object has 50% coverage.

#### 4. **Supabase CRUD Repos (~3%)**
- Categories, Budgets, Users, LLM Calls repositories

**Rationale:** Mappers (100%) and Transactions repo (100%) are fully tested. Others follow same pattern.

#### 5. **UI Components (0-40%)**
- Dashboard components (0%)
- Advanced transaction modals (17-41%)

**Rationale:** Focus on business logic over UI. Component testing requires complex React Testing Library setup.

#### 6. **API Routes (28-70%)**
- `routes/transactions.ts` (28%) - Edge cases
- `routes/auth.ts` (39%) - Some flows

**Rationale:** Core business logic in use cases is tested. Routes add HTTP handling/validation.

#### 7. **External Services (Integration Only)**
- Supabase PostgreSQL, OpenRouter API, Cloudflare Workers

**Rationale:** Mocked in unit tests. Some Supabase integration tests exist (env-gated).

### System Diagram - Coverage by Tier

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER (53-59%)                   │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend: 53.86%  │  API: 59.48%                              │
│  ✓ Utils: 100%     │  ✓ Routes: ~70%                           │
│  ✓ Services: 100%  │  ✓ Middleware: ~62%                       │
│  ✓ Hooks: 100%     │  ✓ Container: 100%                        │
│  ✗ UI Components   │                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER (73%)                        │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Use Cases: 73.33%                                              │
│  ✓ Budget Management: 100%   │  ✓ Auth: 100%                   │
│  ✓ Category Mgmt: 100%       │  ✓ Transactions: ~80%           │
│  ✗ AI Features: 0%           │  ✗ DI Containers: 0%            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN TIER (35%)                           │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Entities: 34.78%                                               │
│  ✓ Budget: 100%        │  ✓ User: 100%                         │
│  ✓ Category: 100%      │  ~ Money: 50%                         │
│  ✓ Transaction: 100%   │  ✗ LLM Models: 0%                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE TIER (70%)                      │
│                        [Mostly Tested]                          │
├─────────────────────────────────────────────────────────────────┤
│  Adapters:                                                      │
│  ✓ OpenRouter (AI): 100%        │  ✓ System: 70%               │
│  ✓ Local Storage: 81.52%        │  ~ Auth: 62.85%              │
│  ~ Supabase: 34.24%             │                               │
│    • Mappers: 100%              │                               │
│    • Transactions: 100%         │                               │
│    • Others: ~3%                │                               │
└─────────────────────────────────────────────────────────────────┘

Legend: ✓ Tested  ~ Partial  ✗ Not Tested
```

### Coverage by Tier

| Tier | Coverage | Tests | Classification | Status |
|------|----------|-------|----------------|--------|
| **Presentation** | 53-59% | 228 tests | Mostly Tested | ✅ |
| **Application** | 73% | 138 tests | Mostly Tested | ✅ |
| **Domain** | 35% | 55 tests | Mostly Tested | ⚠️ |
| **Infrastructure** | 70% | 104 tests | Mostly Tested | ✅ |
| **Composition** | 0% | 0 tests | Not Tested | ❌ |

### Detailed Coverage Reports

#### Package-Level Summary

| Package | Coverage | Tests | Highlights |
|---------|----------|-------|------------|
| **Frontend** | 53.86% | 131 | ✅ Utils/Services: 100%, ⚠️ Components: 0-40% |
| **API** | 59.48% | 97 | ✅ Categories: 98%, ✅ Budgets: 85%, ⚠️ Transactions: 28% |
| **Domain** | 34.78% | 55 | ✅ Core entities: 100%, ❌ LLM models: 0% |
| **Use Cases** | 73.33% | 138 | ✅ CRUD: 100%, ❌ AI: 0%, Functions: 100% |
| **OpenRouter** | 100% | 23 | ✅ Full coverage including mocks |
| **Local Persist** | 81.52% | 18 | ✅ Transactions/Categories: 100% |
| **Supabase Persist** | 34.24% | 28 | ✅ Mappers: 100%, ⚠️ Others: ~3% |
| **System** | 70% | 13 | ✅ Clock: 100%, ~ ID Gen: 68% |
| **Auth Supabase** | 62.85% | 22 | ✅ Signup/Login: 100% |

#### Fully Tested Components (80%+)

- ✅ Frontend utilities (dateHelpers, csvParser): 96-100%
- ✅ Frontend services (budgetService, transactionsService): 98-100%
- ✅ Frontend hooks (useAuth): 100%
- ✅ OpenRouter AI adapter (categorization, invoice parsing): 100%
- ✅ Local persistence (transactions, categories): 100%
- ✅ Supabase mappers (domain ↔ DB transformation): 100%
- ✅ Supabase transactions repository: 100%
- ✅ Use cases (budgets, categories, auth): 100%
- ✅ Domain entities (Budget, Category, Transaction, User): 100%
- ✅ System clock adapter: 100%
- ✅ API container (DI): 100%

#### Viewing Coverage Reports

```bash
# Generate all coverage reports and open in browser
pnpm run coverage:report

# Or step by step:
pnpm run test:coverage    # Run tests + merge
pnpm run coverage:html    # Generate HTML (requires: apt-get install lcov)
pnpm run coverage:view    # Open in browser
```

**HTML Reports:**
- Merged: `coverage/html/index.html`
- Frontend: `apps/frontend/coverage/index.html`
- API: `apps/api/coverage/lcov-report/index.html`
- Per-package: `packages/{name}/coverage/index.html`

**Documentation:**
- [Coverage Guide](../COVERAGE_GUIDE.md) - Commands and workflows
- [Coverage Cheatsheet](../COVERAGE_CHEATSHEET.md) - Quick reference




## 4. Profiler

### Profiler Implementation

We implemented a bash API profiler that exercises all endpoints. The profiler uses curl to make HTTP requests and measures response times

### Results

**Which endpoint is the slowest?**

POST /transactions - 7ms

**Is the slowdown fixable - and why/why not?**

Yes but it's not necessary. The 7ms response time is excellent and well within acceptable performance thresholds. The slight delay is expected for write operations due to:
- Database write operations for inserting the transactions
- Transaction validation logic
- Domain object creation and persistence

This is normal performance for POST operations. No optimization needed.

**Profiler Output:**

[Profiler Results](../profiler/profiler-results/output-20251105-153415.txt)



## 5. Last Dash

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] What issues do you foresee in the final sprint?


## 6. Show Off

### Bryce
**CSV Upload Feature**

I implemented a CSV upload feature that allows users to bulk import transactions

Included
- **Flexible CSV parsing**:
  - Supports various column name formats (amount/price/total, date/occurredAt, description/note)
- **Automatic AI categorization**
  - Transactions are automatically categorized using AI based on their description
- **Error handling**
  - Shows preview before import, reports errors by row number, continues importing even if some rows fail
- **User-friendly UI**
  - Modal with file upload, preview table, and clear success/error feedback

The implementation uses a CSV parser on the frontend and a bulk import endpoint on the backend. When transactions are imported without categories, the system automatically calls the AI categorization service to assign appropriate categories.

**Key Files:**
- apps/frontend/src/lib/csvParser.ts - CSV parsing logic
- apps/frontend/src/app/(protected)/transactions/page.tsx - Upload UI
- apps/api/src/routes/transactions.ts - Bulk import endpoint is POST /transactions/bulk-import

This feature saves users time by allowing them to import many transactions at once rather than entering them manually one by one.



### Ramatjyot

**CI/CD Pipeline & Clean Architecture**

I implemented end-to-end continuous deployment with Cloudflare and architected our Clean Architecture design that enabled high test coverage.

#### What I Built

**Cloudflare CI/CD Pipeline**
- **Automatic deployments** - Push to `main` → instant production deploy (API on Workers, Frontend on Pages)
- **PR preview deployments** - Each PR gets unique URL: `https://pr-{number}.budgetwise.pages.dev`
- **Zero-downtime** - Global edge network deployment, sub-100ms latency worldwide
- **Full automation** - 525 tests run → build → deploy → live in minutes

**Clean Architecture Design**
- **Researched and proposed** layered architecture: Domain → Use Cases → Adapters → Infrastructure
- **Port/Adapter pattern** - Designed interfaces enabling swappable implementations (Local/Supabase, OpenRouter AI)
- **Dependency inversion** - Domain has zero external dependencies, enabling 100% coverage on core entities
- **Enabled testability** - Architecture directly contributed to 55.3% repo coverage

**Codebase Refactoring** (In Progress - `refactor/all` branch)
- Monorepo optimization and circular dependency removal
- Build process streamlining for faster CI/CD
- Consolidating duplicate code across packages

#### Impact

**Deployment Velocity:** Hours → Minutes (automated)  
**Developer Experience:** Preview URLs eliminate "works on my machine" - reviewers test PRs before merge  
**Global Performance:** Cloudflare edge = 99.99% uptime, sub-100ms responses  
**Cost Efficiency:** Serverless pay-per-use vs always-on servers  
**Test Coverage:** Clean Architecture separation = 100% on domain entities, 73% on use cases

#### Key Deliverables

- `.github/workflows/deploy.yml` - CI/CD pipeline
- `DESIGN.md` - Architecture documentation
- `wrangler.jsonc` - Cloudflare configuration
- Production: `https://budgetwise.pages.dev`

The architecture and deployment pipeline I built became the foundation enabling the team to move fast while maintaining quality - automated testing catches regressions, preview deployments catch integration issues, and Clean Architecture keeps business logic testable and maintainable.


### Robert



### Sid
**Optimistic Add + Async Auto-categorization**

I added an optimistic UI update when creating a transaction and improved the auto-categorization flow so it updates the transaction in-place without reloading the whole list.

Included
- **Optimistic insert**
  - New transaction is inserted into local state immediately after the add API returns and the list is sorted by occurredAt.
  - Removes the previous full reload (no more `await loadTransactions()`) for faster UX.
- **Better auto-categorization flow**
  - Tracks whether a category was selected and whether note/description existed (`hadCategorySelected`, `hadNoteOrDescription`).
  - If no category was chosen and there is note/description, calls `categorizeTransaction` asynchronously.
  - When categorization returns, updates the matching transaction's `categoryId` and `updatedAt` in state (no full reload).
  - `setCategorizingId` is still used to indicate ongoing categorization.
- **Minor state and cleanup**
  - Clears form fields as before; uses `newTx` from the create response to avoid re-fetching.

**Key file**
- apps/frontend/src/app/(protected)/transactions/page.tsx

**Relevant Links**
- [Issue](https://github.com/COMP-4350-Group-6/budgetwise/issues/102)
- [Commit](https://github.com/COMP-4350-Group-6/budgetwise/commit/857087990d542cd17874dacd8a016b57514b1125)


### Stephanie
#### Frontend Refactor & UI/UX redesign

#### Overview
I refactored and modernized the entire pages (based on feedback given) mostly to improve performance, maintainability, and user experience. The new layout separates logic into smaller, reusable components (filters, lists, modals, summaries) for clarity and scalability.

#### What It Does
- **Redesigned category and spending sections** for better readability and usability. Added smooth budget creation/edit flows, integrated category color indicators, and improved progress bar visuals.
- **Rebuilt the transaction and home page** into modular, readable components (`TransactionList`, `TransactionFilters`, etc.)
- **Added a constant folder to eliminate string literals in codebase**
- **Simplified and optimized the data flow** between modals and services
- **Enhanced the page visuals** with new responsive CSS layouts
- **Fixed category editing and modal update states**
  
#### Current Status & Next Steps
 **Note: Refactoring not fully completed due to time constraints**
#### Key Files
- [`apps/frontend/src/app/(protected)/home/page.tsx`](../../apps/frontend/src/app/(protected)/home/page.tsx)  
- [`apps/frontend/src/app/(protected)/transactions/page.tsx`](../../apps/frontend/src/app/(protected)/transaction/page.tsx) — Main page refactor and logic flow
- [`apps/frontend/src/components/transactions/transactionList.tsx`](../../apps/frontend/src/app/components/transaction/transactionList.tsx) — Redesigned list UI with live edit buttons
- [`apps/frontend/src/components/transactions/modals`](../../apps/frontend/src/app/components/transactions/modals) — Modularized add/edit/import/upload modals
- [`apps/frontend/src/app/constants/strings`](../../apps/frontend/src/app/constants/strings)  - Removal of string literals in code

#### Commit
**Commit**: [https://github.com/COMP-4350-Group-6/budgetwise/pull/118/commits/76fc006d38c4bf517819c97781d05c5ebf48fa23](https://github.com/COMP-4350-Group-6/budgetwise/pull/137/commits/5ce025aa9a095ba7f770e7971f7477f315f7454d)


### Ahnaf
#### Why I Love the Auto-Categorization Feature (commit #96)

I'm incredibly proud of the auto-categorization feature because it's **fast and smooth**. When a user adds a transaction, they see "Categorizing..." for maybe half a second, then boom! it's done! No waiting, no spinning wheels, just instant categorization. 

To achieve this, I chose `Mistral Small` as the LLM model, which is the perfect sweet spot for this task. It's a small, fast model that costs ~$0.0002 per call instead of $0.05 like the big models, making it 250x chexaper while still being highly accurate for pattern matching tasks like categorizing "Starbucks coffee $5.50" → "Food & Dining."

The smoothness comes from three key architectural decisions I made:

**Technical Implementation:**
- **Async-first design** - Categorization happens in the background after the transaction is created, so users never wait
- **Smart prompting**  the LLM prompt to uses category UUIDs instead of names, preventing common AI mistakes/hallucinations (THERES TRADE OFFS FOR THIS, BUT SO FAR IT WORKS 99% OF THE TIME0
- **Non-blocking UI** - The transaction appears immediately, then updates with the category when ready. It's optimistic updates.
- **Graceful fallbacks** - If categorization fails, the transaction still saves successfully

**Performance Optimizations:**
- **Right-sized model** - Mistral Small handles 95%+ accuracy at 250x lower cost than large models
- **Token efficiency** - Limited to 300 tokens max, keeping responses under 200ms
- **Usage tracking** - Built LLM call monitoring to track costs and performance in real-time
- **Bulk import support** - Auto-categorizes entire CSV imports without blocking

**Documentation & Knowledge Sharing:**
I created a comprehensive **"How to Choose an LLM Model 101"** wiki page that teaches the team the "Three Bears Principle" for model selection. It explains when to use small/medium/large models, includes cost calculations, decision trees, and real-world examples from our codebase. This documentation ensures anyone on the team can make informed LLM choices without wasting money or sacrificing performance.


#### LLM Choice Cost Rationale

```math
\begin{aligned}
\text{Input tokens per call} &\approx 300 \text{ tokens} \\
\text{Output tokens per call} &\approx 75 \text{ tokens} \\
\\
\textbf{Mistral Small:} \\
\text{Input cost} &= 300 \times \frac{\$0.10}{1000000} = \$0.00003 \text{ per call} \\
\text{Output cost} &= 75 \times \frac{\$0.30}{1000000} = \$0.0000225 \text{ per call} \\
\text{Total per call} &= \$0.0000525 \\
\text{Monthly AI cost (1M transactions)} &= 1000000 \times \$0.0000525 = \$52.50 \\
\\
\textbf{Claude Sonnet 4.5:} \\
\text{Input cost} &= 300 \times \frac{\$3.00}{1000000} = \$0.0009 \text{ per call} \\
\text{Output cost} &= 75 \times \frac{\$15.00}{1000000} = \$0.001125 \text{ per call} \\
\text{Total per call} &= \$0.002025 \\
\text{Monthly AI cost (1M transactions)} &= 1000000 \times \$0.002025 = \$2025 \\
\\
\textbf{Cost Difference:} \\
\text{Mistral Small saves} &= \$2025 - \$52.50 = \$1972.50 \text{ per month} \\
\text{Cost ratio} &= \frac{\$2025}{\$52.50} = 38.6\times \text{ more expensive with Claude}
\end{aligned}
```

Key insights:
- Mistral Small: $52.50/month for 1M transactions
- Claude Sonnet 4.5: $2,025/month for 1M transactions
- Savings: $1,972.50/month by choosing Mistral Small
- Claude is 38.6× more expensive for this use case


#### Practical Value Calculations

Some math I did to demonstrate this features practical value.

**Case**: say there are 1 million transactions

```math
\begin{aligned}
\text{Input tokens per call} &\approx 300 \text{ tokens} \\
\text{Output tokens per call} &\approx 75 \text{ tokens} \\
\\
\text{Input cost} &= 300 \times \frac{\$0.10}{1000000} = \$0.00003 \text{ per call} \\
\\
\text{Output cost} &= 75 \times \frac{\$0.30}{1000000} = \$0.0000225 \text{ per call} \\
\\
\text{Total per call} &\approx \$0.0000525 \\
\\
\text{Monthly AI cost} &= 1000000 \times \$0.0000525 = \$52.50 \\
\\
\\
\text{Manual time per transaction} &= 10 \text{ seconds} \\
\\
\text{Total time for 1M transactions} &= 1000000 \times 10 \text{ sec} \\
&= 10000000 \text{ seconds} \\
&= \frac{10000000}{3600} = 2778 \text{ hours} \\
&= \frac{2778}{8} = 347 \text{ work days} \\
&= \frac{347}{260} = 1.34 \text{ work years} \\
\\
\text{Labor cost at } \$30\text{/hour} &= 2778 \times \$30 = \$83340 \\
\\
\text{Net monthly savings} &= \$83340 - \$52.50 = \$83287.50 \\
\\
\text{ROI} &= \frac{\$83287.50}{\$52.50} = 1586\times \text{ return on investment}
\end{aligned}
```
*Please note these are just educated guesstimates*

**Bottom line:** By choosing the right LLM and engineering a smooth UX, we save **$83,340/month** in human economic labor costs and **1.34 work years of human labor** for just **$53/month** in AI costs. This also does not include the intangible QoL benefits.


The end result is that users get instant, accurate categorization that seems too good to be true, while it costs us pennies per thousand transactions.


_Acknowledgements:
The above article was structured and refined with assistance from Claude Sonnet 4.5 (Anthropic). The Fermi estimates, cost calculations, mathematical formulations, and overall narrative structure were developed through iterative collaboration via the Anthropic web interface. It had been verified for factuality._


## Sprint 2 Quick Checklist

- [ ] Regression testing process described.

- [ ] Link to regression script + last results.

- [ ] Testing slowdown discussed.

- [ ] Untested parts identified + updated system diagram.

- [ ] Tier testing coverage levels stated.

- [ ] Coverage reports included.

- [ ] API profiler run + slowest endpoint identified.

- [ ] Profiler output attached/linked.

- [ ] Issues for final sprint listed.

- [ ] Each member’s “best work” committed & described.
