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
