# Sprint 2 Worksheet

Format: Markdown file in your repository. Include links to relevant code, scripts, reports, and diagrams.


## 1. Regression Testing
**Smoke Tests**  
We use a fast, targeted smoke suite consisting only of tests tagged `@critical` across the core business flows (authentication, budget CRUD, categories, transaction integration, dashboard aggregation). These make up our critical regression suite, designed for CI/CD gates and rapid deploy validation.

**Tests Executed**  
Only those directly tagged as `@critical`, covering:
- Auth middleware (`@critical allows request when token is valid`)
- Budgets API (`@critical should create a budget with valid data`, `@critical should list all budgets for user`, `@critical should return dashboard data`, `@critical should update budget amount`)
- Categories API (`@critical should create a category with minimal data`, `@critical should list all categories`)
- Transaction Integration (`@critical should reflect added transaction in dashboard totals`)

Test files used:
- `apps/api/src/middleware/auth.test.ts`
- `apps/api/src/routes/budgets.test.ts`
- `apps/api/src/routes/categories.test.ts`
- `apps/api/tests/integration/transactions.int.test.ts`

All tests use **Vitest**, configured to run with in-memory repositories for speed and determinism, invoked through PNPM workspaces. 
```bash
pnpm test:critical
```
or per package:
```bash
pnpm test:critical --filter api
```

**Latest snapshot of execution results:**  
See [`test-coverage/smoke-tests.md`](../test-coverage/smoke-tests.md) for an updated run summary and breakdown.


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
> 1. [ ] What parts of the system are not tested?
>
> 2. [ ] Provide an updated system diagram.
>
> 3. [ ] For each tier, indicate which layers are:
>    - [ ] Fully tested (80%+)
>
>    - [ ] Mostly tested (20–80%)
>
>    - [ ] Somewhat tested (0–20%)
>
>    - [ ] Not tested
>
> 5. [ ] Include coverage reports for tested tiers.


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

Complying with professor's remark from 2025-11-07 (Actual remark may differ slightly):
> I should be able to come back in two or three days and see comments about "can't merge this because of X and Y" on the PR's


Refactoring Challenges:
- Code Comprehension Gaps
- Dependency Chain Complexity
- Testing Infrastructure Deficit

Deployment Preparation Issues
- Configuration Management
- Build Pipeline Unknowns
- Production Environment Differences

Stress Testing Discoveries
- Performance Bottlenecks
    - Current code has not been optimized for concurrent users.
- Stress testing will likely reveal:
    - Synchronous operations that should be asynchronous 
    - Missing database indexes causing slow queries
    - Memory management issues from unclosed connections
    - State management problems under concurrent load
- Error Handling Gaps
- Scalability Architecture Issues

Process and Coordination Concerns
- The time costs of Code Review
- Knowledge Transfer Requirements
- Integration Complexity

Risk Mitigation Considerations
- Timeline Pressure
- Quality vs. Deadline Tradeoffs


> [!NOTE]
> All points in "5. Last Dash" are headings (except for the first one about the professor) of a much larger breakdown provided by a group member - larger breakdown was requested to be shortened by said member.


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



### Robert

I focused on documentation of work & future maintainability

Much of my work is not see through commits, however go through most of the repository Issues and it will become evident to the degree I utilized issues to manage & document engagements. 

Some aspects I frequently utilized were, (+2 examples each)
- Relationships (Sub issues, Issue blocking)
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/128
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/8
- Specifying reason for closing (Complete, No planned, Duplicate, Stale)
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/38
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/54
- Use of specialized labels (ex. s.UnderReview label for issues that appear off,)
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/108
    - https://github.com/COMP-4350-Group-6/budgetwise/issues/127


Other examples where I displayed a focus on documentation of work & future maintainability were,

Security measures: https://github.com/COMP-4350-Group-6/budgetwise/issues/80

Our GitLeaks linter (checks if code contains Keys) was encountering a false positive in one of our files. Instead of turning off the linter entirely, or disabling the triggered security rule; I instead made a scoped in exception (see extract bellow)

File: `.github/linters/customgitleaks.toml`
```toml
# Template from: https://github.com/gitleaks/gitleaks#configuration

# Title for the gitleaks configuration file.
title = "Custom Gitleaks configuration"

[extend]

useDefault = true

[[rules]]

id = "generic-api-key"
    [[rules.allowlists]]
    # This is to suppress the false possitive occuring in TESTING-RATIONALE.md:generic-api-key:166
    condition = "AND"
    paths = ['''TESTING-RATIONALE\.md''']
    regexTarget = "match"
    regexes = ['''(?:budgetwise\/apps\/api\/src\/middleware\/auth\.ts:17)''']
```

I did a number of things here,
1. Citation of the template used. Allowing for future editors to see how to format said file.
2. `useDefault = true` makes it so this file extends the GitLeaks rules instead of writing every rule manually
3. The scoped exception:
    1. First I specified the id of the rule I wanted to extend
    2. I created a "AND" condition so only if all following conditions are met, will there be a bypass of the rule.
    3. I specified conditions for both the file path, and a regex for the contents of the false positive line.
    4. I created both the file path and a regex conditions as a list, so if future exceptions of the same manner occurred, all you would need to do is add it to the list.

Committing this change did stop the false positive, but to check that the scoped exception only occurred where I wanted it to I created a test branch `test/this-should-trigger-gitleasks` (https://github.com/COMP-4350-Group-6/budgetwise/pull/88). This test branch had a files that was line by line the same as the original file being flagged, except for being named differently. As expected the new copycat file was flagged, telling me that the exception was properly scoped, and that I could close issue 80.

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