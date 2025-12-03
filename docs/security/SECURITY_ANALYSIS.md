# Static Application Security Testing (SAST) Analysis Report

## 1. Security Analysis Tool Description

### Tool: ESLint with eslint-plugin-security

**eslint-plugin-security** is a static analysis security testing (SAST) plugin for ESLint that identifies potential security vulnerabilities in JavaScript and TypeScript code. It is specifically designed for Node.js applications and integrates seamlessly with existing ESLint workflows.

#### Why This Tool?

1. **Language Support**: Analyzes TypeScript/JavaScript - the main languages used in our project (Next.js frontend + Hono API backend)
2. **Integration**: Works within our existing ESLint infrastructure, requiring minimal setup
3. **CI/CD Ready**: Runs automatically on every commit via our GitHub Actions workflow
4. **Comprehensive Coverage**: Detects common security issues including:
   - Regular Expression Denial of Service (ReDoS)
   - Code injection (eval, Function constructor)
   - Object injection attacks
   - Path traversal vulnerabilities
   - Timing attacks
   - Unsafe file system operations

### How We Ran the Analysis

The security analysis was executed using the following command from the project root:

```bash
pnpm lint
```

This command runs ESLint with the security plugin across all packages in our monorepo via Turborepo, analyzing:
- `apps/frontend/` - Next.js frontend application
- `apps/api/` - Hono API backend
- `packages/domain/` - Domain logic

---

## 2. Analysis Results Summary

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 0 | No critical vulnerabilities found |
| High | 0 | No high vulnerabilities found |
| Medium | 1 | Potential timing attack detected |
| Low | 15 | Object injection sink warnings |

**Total Security Issues**: 16 findings  
**Total Code Quality Issues**: 37 findings (unused variables, missing dependencies, etc.)

---

## 3. Five Randomly Selected Problems - Discussion

### Problem 1: Potential Timing Attack (security/detect-possible-timing-attacks)

**File**: `apps/frontend/src/app/(public)/signup/page.tsx:32`

**Code**:
```typescript
if (password !== confirmPassword) {
  setError("Passwords do not match.");
  setIsLoading(false);
  return;
}
```

**What It Detected**: The tool flagged a string comparison that could potentially leak timing information.

**Analysis**: This is a **false positive** in our context. The rule is designed to catch timing attacks where an attacker could measure response time differences when comparing secrets (like password hashes). However, in this case:
- We're comparing two user-provided values (password vs confirm password)
- Both values come from the same user in the same request
- This is a UX validation, not a security check against stored credentials
- The actual password verification happens server-side with proper constant-time comparison

**Risk Level**: Low (False Positive)

**Mitigation**: No action required. The actual authentication comparison happens in Supabase's auth system which uses secure constant-time comparison.

---

### Problem 2: Generic Object Injection Sink (security/detect-object-injection)

**File**: `apps/frontend/src/lib/csvParser.ts:89-92`

**Code**:
```typescript
const amountStr = values[amountIdx]?.trim();
const dateStr = values[dateIdx]?.trim();
const description = purchaseNameIdx >= 0 ? values[purchaseNameIdx]?.trim() : undefined;
```

**What It Detected**: Using a variable as an array index could allow object injection if the index comes from user input.

**Analysis**: The tool warns about using variables to access array elements because if `amountIdx` came from untrusted input, an attacker could potentially access prototype properties. In our case:
- `amountIdx` is derived from parsing CSV headers against a known whitelist
- The `values` array comes from parsing a user-uploaded CSV file
- The indices are validated against known column names before use

**Risk Level**: Low - The indices are derived from our own header parsing logic, not directly from user input.

**Mitigation**: The current implementation is acceptable because:
1. We validate headers against a known whitelist
2. Array access with numeric indices doesn't expose prototype pollution
3. We could add explicit bounds checking for additional safety

---

### Problem 3: Object Injection in Budget Calculation (security/detect-object-injection)

**File**: `apps/frontend/src/app/(protected)/budget/page.tsx:221-227`

**Code**:
```typescript
const categorySpentMap: Record<string, number> = {};
for (const t of monthlyTx) {
  const catId = t.categoryId;
  if (!catId) continue;
  categorySpentMap[catId] = (categorySpentMap[catId] || 0) + t.amountCents;
}
// ...
const spent = categorySpentMap[catKey] || 0;
```

**What It Detected**: Using a variable (`catId`, `catKey`) as an object property accessor.

**Analysis**: Object injection vulnerabilities occur when an attacker can control the property name being accessed, potentially accessing `__proto__` or other dangerous properties. In this case:
- `categoryId` values come from our database (Supabase)
- They are ULIDs (Universally Unique Lexicographically Sortable Identifiers)
- The data flow is: Database → API → Frontend state
- Users cannot directly control these values

**Risk Level**: Low - Category IDs are system-generated ULIDs, not user input.

**Mitigation**: Could use `Object.hasOwn()` or `Map` instead of plain objects for additional safety:
```typescript
const categorySpentMap = new Map<string, number>();
```

---

### Problem 4: Dynamic Icon Component Selection (security/detect-object-injection)

**File**: `apps/frontend/src/components/dashboard/statCard.tsx:40`

**Code**:
```typescript
const IconComponent = DASHBOARD_ICONS[icon];
```

**What It Detected**: Using a variable to access object properties.

**Analysis**: This is a common React pattern for dynamic component selection. The `icon` prop is a string that maps to a predefined set of icon components:
- `DASHBOARD_ICONS` is a constant object defined in our codebase
- The `icon` prop comes from parent components with TypeScript type constraints
- Invalid icon values would result in `undefined`, not prototype access

**Risk Level**: Very Low - TypeScript enforces valid icon names at compile time.

**Mitigation**: The current implementation is safe due to:
1. TypeScript type constraints on the `icon` prop
2. The lookup object is a constant, not user-modifiable
3. Adding `Object.hasOwn()` check would be over-engineering

---

### Problem 5: Period-Based Sorting with Object Lookup (security/detect-object-injection)

**File**: `apps/frontend/src/components/budgets/categorySpending.tsx:118`

**Code**:
```typescript
const periodOrder = { DAILY: 1, WEEKLY: 2, MONTHLY: 3, YEARLY: 4 };
return periodOrder[aPeriod] - periodOrder[bPeriod];
```

**What It Detected**: Using variables to access object properties in a sort comparison.

**Analysis**: This sorts budget categories by their period type. The `aPeriod` and `bPeriod` values:
- Come from our database schema where `period` is an enum
- Are constrained to: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`
- TypeScript enforces these values at compile time

**Risk Level**: Very Low - Values are database enum types, not user input.

**Mitigation**: No action needed. The enum constraint ensures only valid keys are used. Alternative approach using Map:
```typescript
const periodOrder = new Map([['DAILY', 1], ['WEEKLY', 2], ['MONTHLY', 3], ['YEARLY', 4]]);
return (periodOrder.get(aPeriod) ?? 5) - (periodOrder.get(bPeriod) ?? 5);
```

---

## 4. Critical and High Vulnerability Handling

**No Critical or High vulnerabilities were detected** in the security analysis.

The eslint-plugin-security tool identified only **Medium** and **Low** severity issues, all of which were analyzed and determined to be either:
1. False positives due to the specific context of our application
2. Low-risk patterns where the data source is trusted (database-generated IDs, enum values)

### Two Additional Problems Discussed (As Required When No Critical/High Issues)

#### Additional Problem 1: Unused Variables (@typescript-eslint/no-unused-vars)

**Files**: Multiple locations across frontend and API

**Examples**:
- `apps/frontend/src/app/(protected)/budget/page.tsx:50` - unused `router`
- `apps/api/src/routes/auth.ts:72` - unused `body` variable

**Analysis**: While not security vulnerabilities, unused variables can indicate:
- Dead code that should be removed
- Incomplete implementations
- Potential logic errors where a variable was meant to be used

**Recommendation**: Remove unused variables to improve code clarity and prevent confusion during security reviews.

#### Additional Problem 2: Missing React Hook Dependencies (react-hooks/exhaustive-deps)

**File**: `apps/frontend/src/components/dashboard/spendingOverview.tsx:74`

**Analysis**: Missing dependencies in `useMemo` hooks can cause:
- Stale data being displayed to users
- Inconsistent application state
- Potential security issues if stale authentication state is used

**Recommendation**: Add missing dependencies or properly memoize dependent values to ensure data consistency.

---

## 5. Commit Links for Fixes

Since no Critical or High vulnerabilities were found, no security fixes were required. However, the following commits added the security analysis tooling:

- **Add eslint-plugin-security SAST tool**: [0dbbc11](https://github.com/COMP-4350-Group-6/budgetwise/commit/0dbbc11)
  - Added `eslint-plugin-security` to workspace
  - Added `typescript-eslint` for API linting
  - Updated `apps/frontend/eslint.config.mjs` with security rules
  - Created `apps/api/eslint.config.mjs` with security rules
  - Enabled linting in `apps/api/package.json`

- **Add SAST security analysis documentation**: [f3f3d60](https://github.com/COMP-4350-Group-6/budgetwise/commit/f3f3d60)
  - Created `course-work/SECURITY_ANALYSIS.md` with full analysis
  - Attached `security-analysis-report.txt` as appendix

---

## 6. Appendix: Full Static Analysis Report

See: `security-analysis-report.txt` (attached separately)

### Summary Statistics

```
Frontend:
  ✖ 32 problems (0 errors, 32 warnings)
  - Security rules: 16 warnings
  - Code quality: 16 warnings

API:
  ✖ 21 problems (0 errors, 21 warnings)
  - Security rules: 0 warnings
  - Code quality: 21 warnings

Total: 53 problems (0 errors, 53 warnings)
```

---

## AI Acknowledgement
The creation of this security analysis report was assisted by Claude Opus 4.5 (Cursor).
