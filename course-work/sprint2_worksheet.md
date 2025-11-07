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

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Run a profiler on your API while exercising every endpoint.
>
> 2. [ ] Identify:
>
>    - [ ] Which endpoint is the slowest.
>
>    - [ ] Whether the slowdown is fixable — and why/why not.
>
> 3. [ ] Include profiler output (linked or attached).


## 5. Last Dash

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] What issues do you foresee in the final sprint?


## 6. Show Off

> [!IMPORTANT]
> ### Worksheet Question
>
> 1. [ ] Each team member highlights their best work (code, UI, design, integration, mocks, etc.).
>
> Remember: good refactored code should be simple and elegant.
>
> 2. [ ] Each member must commit their own update — commit logs will be checked.

### Ahnaf



### Bryce
**CSV Transaction Import Feature**

I implemented a CSV upload feature that allows users to bulk import transactions from spreadsheet files. Users can upload a CSV file with their transaction data, and the system automatically parses it and imports the transactions.

**What it does**
- Parses CSV files with flexible column names (works with "amount", "price", "total", etc.)
- Handles different date formats automatically
- Automatically categorizes transactions using AI based on the description
- Shows a preview before importing
- Displays errors for any rows that fail to import
- Shows imported transactions immediately after import

**Key files:**
- [`apps/frontend/src/lib/csvParser.ts`](../../apps/frontend/src/lib/csvParser.ts) for CSV parsing logic
- [`apps/frontend/src/services/transactionsService.ts`](../../apps/frontend/src/services/transactionsService.ts)  API service for bulk import
- [`apps/api/src/routes/transactions.ts`](../../apps/api/src/routes/transactions.ts) Backend endpoint for the bulk import
- [`apps/frontend/src/app/(protected)/transactions/page.tsx`](../../apps/frontend/src/app/(protected)/transactions/page.tsx) UI component

**Commit**: [https://github.com/COMP-4350-Group-6/budgetwise/pull/130/commits/a58c5777a7b07d61260f1cdf08157f762be0edee]



### Ramatjyot



### Robert



### Sid



### Stephanie





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
