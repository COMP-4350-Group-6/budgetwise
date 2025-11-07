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
