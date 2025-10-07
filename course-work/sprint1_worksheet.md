# Sprint 1 Worksheet

This deliverable focuses on testing coverage, test importance, and environment reproducibility.

**Format**: Markdown file in your repository, linking to test files, coverage reports, and any supporting documentation.

## 1. Testing Plan

- Link to your testing plan in the repository.

## 2. Unit / Integration / Acceptance Testing

### General Rule:

Every user story must have at least one test before it is considered complete.

### Backend

- API layer: 100% method coverage (every method has at least 1 tested line).

- Logic classes: ≥80% line coverage.

- Integration tests: 100% class coverage, with strong line & method coverage.

### Frontend

- Logic layer (if present): ≥80% coverage.

- UI tests: Describe approach and coverage.

- If unit tests are missing for some classes/methods, explain why and how quality is being ensured.

- Describe any unusual/unique aspects of your testing approach.

### Coverage Report

- Provide class and line coverage reports (link or screenshot).

## 3. Testing Importance

List your top 3 tests for each category:

### Unit Tests:

[File path with clickable GitHub link] – short description of what it tests.

### Integration Tests:
    
[File path with clickable GitHub link] – short description of what it tests.

### Acceptance Tests:

- If automated: [File path with clickable GitHub link] – story it tests.

- If manual: Link to GitHub issue with detailed steps & expected outcomes.

## 4. Reproducible Environments

Act as if you are a new developer joining another team’s project.

- Attempt to build and run their application locally (max 1 hour).

- Try running their unit, integration, and other tests.

- Take screenshots of:

  - Successful runs (app working, tests passing)

  - Failures (error messages, logs)

Write a short report (paragraph or bullet points) on:

- Clarity of documentation.

- Whether you could run it successfully and how long it took.

- Issues faced (especially relevant to distributed systems).

---

## Sprint 1 Quick Checklist

- [ ] Link to testing plan.

- [ ] Backend: API 100% method coverage, logic classes ≥80% line coverage.

- [ ] Backend integration tests: 100% class coverage.

- [ ] Frontend logic coverage ≥80% (if applicable).

- [ ] UI test approach described.

- [ ] Missing tests explained (if any).

- [ ] Coverage report included.

- [ ] Top 3 unit tests linked & described.

- [ ] Top 3 integration tests linked & described.

- [ ] Top 3 acceptance tests linked & described.

- [ ] Environment setup for another team tested (screenshots + notes).
