
> @root/budgeting@ lint /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise
> turbo run lint

turbo 2.5.8

• Packages in scope: @budget/adapters-auth-supabase, @budget/adapters-openrouter, @budget/adapters-persistence, @budget/adapters-persistence-local, @budget/adapters-persistence-supabase, @budget/adapters-system, @budget/composition-cloudflare-worker, @budget/composition-web-auth-client, @budget/config, @budget/domain, @budget/ports, @budget/schemas, @budget/usecases, @budgetwise/e2e-tests, api, frontend
• Running lint in 16 packages
• Remote caching disabled
@budget/domain:lint: cache hit, replaying logs da06db03e6712668
@budget/domain:lint: 
@budget/domain:lint: > @budget/domain@0.0.0 lint /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/packages/domain
@budget/domain:lint: > echo skip
@budget/domain:lint: 
@budget/domain:lint: skip
frontend:lint: cache hit, replaying logs 38fe857bd1ae7d4f
frontend:lint: 
frontend:lint: > frontend@0.1.0 lint /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend
frontend:lint: > eslint
frontend:lint: 
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/postcss.config.mjs
frontend:lint:   1:1  warning  Assign object to a variable before exporting as module default  import/no-anonymous-default-export
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/app/(protected)/budget/page.tsx
frontend:lint:    50:9   warning  'router' is assigned a value but never used  @typescript-eslint/no-unused-vars
frontend:lint:   221:9   warning  Generic Object Injection Sink                security/detect-object-injection
frontend:lint:   222:12  warning  Generic Object Injection Sink                security/detect-object-injection
frontend:lint:   227:23  warning  Generic Object Injection Sink                security/detect-object-injection
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/app/(protected)/home/page.tsx
frontend:lint:   112:9  warning  'insight' is assigned a value but never used  @typescript-eslint/no-unused-vars
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/app/(protected)/transactions/page.tsx
frontend:lint:    37:10  warning  'budgets' is assigned a value but never used                                                                                      @typescript-eslint/no-unused-vars
frontend:lint:   138:5   warning  React Hook useMemo has missing dependencies: 'endOfMonth' and 'startOfMonth'. Either include them or remove the dependency array  react-hooks/exhaustive-deps
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/app/(public)/signup/page.tsx
frontend:lint:   32:5  warning  Potential timing attack, left side: true  security/detect-possible-timing-attacks
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/components/budgets/categorySpending.tsx
frontend:lint:     7:10  warning  'budgetService' is defined but never used      @typescript-eslint/no-unused-vars
frontend:lint:   118:14  warning  Generic Object Injection Sink                  security/detect-object-injection
frontend:lint:   118:37  warning  Generic Object Injection Sink                  security/detect-object-injection
frontend:lint:   137:11  warning  'progress' is assigned a value but never used  @typescript-eslint/no-unused-vars
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/components/dashboard/spendingOverview.tsx
frontend:lint:   42:9  warning  The 'startOfWeek' object construction makes the dependencies of useMemo Hook (at line 52) change on every render. To fix this, wrap the initialization of 'startOfWeek' in its own useMemo() Hook  react-hooks/exhaustive-deps
frontend:lint:   46:9  warning  The 'endOfWeek' object construction makes the dependencies of useMemo Hook (at line 52) change on every render. To fix this, wrap the initialization of 'endOfWeek' in its own useMemo() Hook      react-hooks/exhaustive-deps
frontend:lint:   74:6  warning  React Hook useMemo has missing dependencies: 'dayNames', 'endOfWeek', and 'startOfWeek'. Either include them or remove the dependency array                                                        react-hooks/exhaustive-deps
frontend:lint:   85:6  warning  React Hook useMemo has a missing dependency: 'dayNames'. Either include it or remove the dependency array                                                                                          react-hooks/exhaustive-deps
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/components/dashboard/statCard.tsx
frontend:lint:   40:25  warning  Variable Assigned to Object Injection Sink  security/detect-object-injection
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/components/transactions/categoryBreakdown.tsx
frontend:lint:   21:3  warning  'onCategorizeNow' is defined but never used  @typescript-eslint/no-unused-vars
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/components/transactions/modals/uploadInvoiceModal.tsx
frontend:lint:   76:15  warning  Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/lib/csvParser.ts
frontend:lint:    58:9   warning  'categoryIdx' is assigned a value but never used    @typescript-eslint/no-unused-vars
frontend:lint:    61:9   warning  'categoryIdIdx' is assigned a value but never used  @typescript-eslint/no-unused-vars
frontend:lint:    82:18  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:    89:25  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:    90:23  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:    91:50  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:    92:57  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:    98:43  warning  Generic Object Injection Sink                       security/detect-object-injection
frontend:lint:   140:16  warning  'e' is defined but never used                       @typescript-eslint/no-unused-vars
frontend:lint:   173:18  warning  Variable Assigned to Object Injection Sink          security/detect-object-injection
frontend:lint: 
frontend:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/frontend/src/services/transactionsService.ts
frontend:lint:    2:10  warning  'authClient' is defined but never used  @typescript-eslint/no-unused-vars
frontend:lint:   43:10  warning  'ulid' is defined but never used        @typescript-eslint/no-unused-vars
frontend:lint: 
frontend:lint: ✖ 32 problems (0 errors, 32 warnings)
frontend:lint: 
api:lint: cache hit, replaying logs 8c95397a8648bfd1
api:lint: 
api:lint: > api@0.0.0 lint /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api
api:lint: > eslint src/
api:lint: 
api:lint: 
api:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api/src/middleware/auth.test.ts
api:lint:   16:21   warning  'decodeProtectedHeader' is defined but never used  @typescript-eslint/no-unused-vars
api:lint:   34:45   warning  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
api:lint:   44:45   warning  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
api:lint:   52:113  warning  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
api:lint:   54:45   warning  Unexpected any. Specify a different type           @typescript-eslint/no-explicit-any
api:lint: 
api:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api/src/middleware/errors.ts
api:lint:   5:15  warning  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
api:lint: 
api:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api/src/routes/auth.ts
api:lint:    72:11  warning  'body' is assigned a value but never used  @typescript-eslint/no-unused-vars
api:lint:   110:11  warning  'body' is assigned a value but never used  @typescript-eslint/no-unused-vars
api:lint:   125:11  warning  'body' is assigned a value but never used  @typescript-eslint/no-unused-vars
api:lint: 
api:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api/src/routes/budgets.test.ts
api:lint:   12:38  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   69:13  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   69:47  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   69:60  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   73:7   warning  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars
api:lint:   78:19  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint: 
api:lint: /Users/sf/Documents/UofM/F2025/COMP 4350-2/budgetwise/apps/api/src/routes/categories.test.ts
api:lint:   13:38  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   63:13  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   63:47  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   63:60  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint:   67:7   warning  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars
api:lint:   74:19  warning  Unexpected any. Specify a different type     @typescript-eslint/no-explicit-any
api:lint: 
api:lint: ✖ 21 problems (0 errors, 21 warnings)
api:lint: 

 Tasks:    3 successful, 3 total
Cached:    3 cached, 3 total
  Time:    203ms >>> FULL TURBO

