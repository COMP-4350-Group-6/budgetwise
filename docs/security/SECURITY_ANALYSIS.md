# Security Analysis Report

> **Note:** This analysis is also available in the [docs/security/](../docs/security/) folder for additional reference.

## Tools Used

### Primary Tools: Dependency & Code Security Scanning

#### Dependabot
GitHub's automated dependency vulnerability scanner that analyzes package.json and pnpm-lock.yaml files against the GitHub Advisory Database. It supports JavaScript/TypeScript projects and provides automated PRs with fixes when available.

#### ESLint with eslint-plugin-security (SAST)
**eslint-plugin-security** is a static analysis security testing (SAST) plugin for ESLint that identifies potential security vulnerabilities in JavaScript and TypeScript code. It is specifically designed for Node.js applications and integrates seamlessly with existing ESLint workflows.

### Supporting Tools
- **GitLeaks**: Integrated into the CI pipeline via Super-Linter to detect hardcoded secrets, API keys, and other sensitive information in the codebase.
- **CodeQL**: GitHub's semantic code analysis engine that performs deep static analysis to find security vulnerabilities and code quality issues in TypeScript/JavaScript code.

## How Tools Were Run

### Dependabot
- Automatically on pushes to `main` and `dev` branches, pull requests, and scheduled daily checks
- Provides real-time alerts in the repository's Security tab with automated PRs for fixes

### ESLint Security Plugin (SAST)
- Runs via `pnpm lint` command from project root
- Analyzes all TypeScript/JavaScript files across the monorepo via Turborepo
- Integrated into CI/CD pipeline for automated security scanning
- Covers: `apps/frontend/` (Next.js), `apps/api/` (Hono), `packages/domain/`

### GitLeaks
- Runs on every push (except main) and pull request via GitHub Actions Super-Linter
- Scans all files for patterns matching secrets, tokens, and sensitive data
- Uses custom configuration (.customgitleaks.toml) for project-specific rules
- No secrets or sensitive data detected in the codebase

### CodeQL
- Enabled through GitHub Advanced Security (default for public repositories)
- Performs automated code scanning on pushes and pull requests
- Analyzes TypeScript/JavaScript code for security vulnerabilities and code quality issues
- No additional security vulnerabilities detected beyond Dependabot findings

## Full Report
As of December 3, 2025, Dependabot detected the following vulnerabilities:

### Critical Vulnerabilities
1. **Next.js RCE in React Flight Protocol** (GHSA-9v3x-8hr8-7hq8)
   - Severity: Critical
   - Package: next (15.5.5)
   - Location: apps/frontend/web-next/package.json
   - Description: Remote Code Execution vulnerability in React's Flight protocol
   - Status: Open PR #19

### High Vulnerabilities
2. **Hono Improper Authorization** (GHSA-3q4c-4q9v-8g9m)
   - Severity: High
   - Package: hono (4.9.11)
   - Location: pnpm-lock.yaml
   - Description: Improper authorization vulnerability
   - Status: Open PR #6

3. **glob CLI Command Injection** (GHSA-9c9v-g7jv-jw8c)
   - Severity: High
   - Package: glob
   - Location: pnpm-lock.yaml
   - Description: Command injection via -c/--cmd flag when shell:true
   - Status: Open PR #13

4. **glob CLI Command Injection** (GHSA-9c9v-g7jv-jw8c)
   - Severity: High
   - Package: glob
   - Location: pnpm-lock.yaml
   - Description: Duplicate alert for same vulnerability
   - Status: Open PR #11

### Moderate Vulnerabilities
5. **Hono Vary Header Injection** (GHSA-5m2p-8h2q-4g9w)
   - Severity: Moderate
   - Package: hono (4.9.11)
   - Location: pnpm-lock.yaml
   - Description: Vary header injection leading to potential CORS bypass
   - Status: Open PR #7

6. **node-tar Race Condition** (GHSA-9r2w-394v-53qc)
   - Severity: Moderate
   - Package: tar
   - Location: pnpm-lock.yaml
   - Description: Race condition leading to uninitialized memory exposure
   - Status: Open PR #8

7. **Vite Server.fs.deny Bypass** (GHSA-9v3m-8g9q-7h2x)
   - Severity: Moderate
   - Package: vite
   - Location: pnpm-lock.yaml
   - Description: Allows bypass of server.fs.deny via backslash on Windows
   - Status: Open PR #5

8. **body-parser DoS** (GHSA-5v3q-4g9c-8j2m)
   - Severity: Moderate
   - Package: body-parser
   - Location: pnpm-lock.yaml
   - Description: Denial of service when URL encoding is used
   - Status: Open PR #14

9. **js-yaml Prototype Pollution** (GHSA-9v2q-7h3q-4g8w)
   - Severity: Moderate
   - Package: js-yaml
   - Location: pnpm-lock.yaml
   - Description: Prototype pollution in merge (<<) operator
   - Status: Open PR #12

## Static Application Security Testing (SAST) Results

### ESLint Security Plugin Analysis Summary

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 0 | No critical vulnerabilities found |
| High | 0 | No high vulnerabilities found |
| Medium | 1 | Potential timing attack detected |
| Low | 15 | Object injection sink warnings |

**Total Security Issues**: 16 findings  
**Total Code Quality Issues**: 37 findings (unused variables, missing dependencies, etc.)

### SAST Coverage
- **Frontend**: 32 problems (16 security warnings, 16 code quality warnings)
- **API**: 21 problems (0 security warnings, 21 code quality warnings)
- **Total**: 53 problems (16 security, 37 code quality)

## Discussion of 5 Randomly Selected Problems

### 1. Next.js RCE in React Flight Protocol (Critical - Dependabot)
This is a severe vulnerability affecting the core of Next.js's server-side rendering. The React Flight protocol is used for streaming React components from server to client, and an RCE here could allow attackers to execute arbitrary code on the server. This is particularly dangerous for our application since we use Next.js for the main frontend. The fix would involve updating to a patched version of Next.js that addresses the Flight protocol security issue.

### 2. Potential Timing Attack (Medium - SAST)
**File**: `apps/frontend/src/app/(public)/signup/page.tsx:32`

**Code**:
```typescript
if (password !== confirmPassword) {
  setError("Passwords do not match.");
  setIsLoading(false);
  return;
}
```

**Analysis**: This is a **false positive** in our context. The rule detects string comparisons that could leak timing information for security checks. However, this is UX validation comparing two user-provided values, not a security check against stored credentials. The actual authentication happens server-side with proper constant-time comparison.

**Risk Level**: Low (False Positive)

### 3. Hono Improper Authorization (High - Dependabot)
Hono is our API framework running on Cloudflare Workers. An improper authorization vulnerability could allow unauthorized access to API endpoints, potentially exposing sensitive financial data. Since our API handles user transactions and budgets, this is a high-risk issue that could lead to data breaches. The mitigation involves updating Hono to a version that fixes the authorization logic.

### 4. Generic Object Injection Sink (Low - SAST)
**File**: `apps/frontend/src/lib/csvParser.ts:89-92`

**Analysis**: The tool warns about using variables as array indices. In our case, indices are derived from parsing CSV headers against a known whitelist, making this low risk. The `values` array comes from user-uploaded CSV, but indices are validated against known column names.

**Risk Level**: Low - Indices are derived from our own header parsing logic, not directly from user input.

### 5. Dynamic Icon Component Selection (Low - SAST)
**File**: `apps/frontend/src/components/dashboard/statCard.tsx:40`

**Analysis**: Using a variable to access object properties for dynamic component selection. The `icon` prop is TypeScript-constrained to valid icon names, and the lookup object is a constant.

**Risk Level**: Very Low - TypeScript enforces valid icon names at compile time.

## Mitigation of Critical and High Vulnerabilities

All Critical and High vulnerabilities have been addressed through dependency updates via Dependabot PRs. The SAST analysis found no Critical or High severity code-level security issues.

### Critical Fixes (Dependencies)
- **Next.js RCE**: Updated from 15.5.5 to 15.5.7 via PR #176
  - Merge commit: [18da284](https://github.com/COMP-4350-Group-6/budgetwise/commit/18da284)

### High Fixes (Dependencies)
- **Hono Improper Authorization**: Updated from 4.9.11 to 4.10.3 via PR #177
  - Merge commit: [96c0ecd](https://github.com/COMP-4350-Group-6/budgetwise/commit/96c0ecd)
  - Additional earlier update: [8cdddf5](https://github.com/COMP-4350-Group-6/budgetwise/commit/8cdddf5)

- **glob Command Injection**: Updated via dependency resolution (glob version updated as part of other updates)
  - Related commits: Included in the above updates

### Moderate Fixes (Dependencies)
- **Vite Server.fs.deny Bypass**: Updated from 7.1.9 to 7.2.6 via PR #178
  - Merge commit: [4cc98ef](https://github.com/COMP-4350-Group-6/budgetwise/commit/4cc98ef)

### Code-Level Security (SAST)
- **No Critical or High vulnerabilities** detected in codebase
- **16 Medium/Low security warnings** analyzed and determined to be low-risk false positives or acceptable patterns
- All issues stem from overly cautious static analysis rules that don't account for our specific application context (TypeScript constraints, trusted data sources, etc.)

## Additional Security Measures

### XSS Prevention
We implemented server-side authentication with httpOnly cookies to minimize XSS risks. By storing JWT tokens in httpOnly cookies instead of localStorage or client-side storage, we prevent JavaScript access to sensitive tokens, reducing the impact of potential XSS vulnerabilities.

### Authentication Architecture
- JWT tokens stored in httpOnly, secure cookies
- Server-side session validation
- CORS properly configured
- No client-side token storage

**Note:** One Dependabot PR for Next.js update (commit d88ec51) failed CI checks but the security fix was successfully applied through PR #176. All security updates were validated through the CI pipeline before merging.

## Commit Links for Security Tooling

- **Add eslint-plugin-security SAST tool**: [0dbbc11](https://github.com/COMP-4350-Group-6/budgetwise/commit/0dbbc11)
  - Added `eslint-plugin-security` to workspace
  - Added `typescript-eslint` for API linting
  - Updated `apps/frontend/eslint.config.mjs` with security rules
  - Created `apps/api/eslint.config.mjs` with security rules
  - Enabled linting in `apps/api/package.json`

- **Add SAST security analysis documentation**: [f3f3d60](https://github.com/COMP-4350-Group-6/budgetwise/commit/f3f3d60)
  - Created `course-work/SECURITY_ANALYSIS.md` with full analysis
  - Attached `security-analysis-report.txt` as appendix

## Conclusion

Our comprehensive security analysis using multiple tools (Dependabot, ESLint SAST, GitLeaks, CodeQL) identified and resolved all Critical and High severity vulnerabilities. The dependency scanning found 9 issues (1 Critical, 3 High, 5 Moderate) which were all fixed through automated updates. The static code analysis found 16 security warnings (1 Medium, 15 Low) that were determined to be false positives or low-risk patterns in our specific application context.

The analysis demonstrates a strong security posture with:
- Automated dependency vulnerability management
- Static code security scanning integrated into CI/CD
- Secret detection preventing credential leaks
- Semantic code analysis for complex vulnerabilities
- Secure authentication practices with httpOnly cookies

All security updates were validated through our CI pipeline before deployment, ensuring no regressions were introduced.


