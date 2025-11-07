# BudgetWise Testing Coverage - System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER                                  │
│                         Coverage: 53.86% (Mostly)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────┐          ┌──────────────────────────┐        │
│  │   Next.js Frontend       │          │      API Routes          │        │
│  │   (React Components)     │◄────────►│   (Hono Framework)       │        │
│  │                          │   HTTP    │                          │        │
│  │  Coverage: 53.86%        │          │  Coverage: 59.48%        │        │
│  │  - Pages: ~60%           │          │  - Routes: ~70%          │        │
│  │  - Components: ~40%      │          │  - Middleware: ~62%      │        │
│  │  - Utilities: 100%       │          │  - Container: 100%       │        │
│  │  - Services: 100%        │          │                          │        │
│  └──────────────────────────┘          └──────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION TIER                                    │
│                         Coverage: 73.33% (Mostly)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                         Use Cases Layer                           │      │
│  │                      Coverage: 73.33%                             │      │
│  │                                                                    │      │
│  │  ✓ Budget Management (100%)   ✓ Transaction Mgmt (~80%)          │      │
│  │  ✓ Category Management (100%) ✗ AI Features (0%)                 │      │
│  │  ✓ Authentication (100%)                                          │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                      ▲                                       │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    Composition Layer (DI)                         │      │
│  │                      Coverage: 0% (Not Tested)                    │      │
│  │                                                                    │      │
│  │  ✗ Cloudflare Worker Container (0%)                              │      │
│  │  ✗ Web Auth Client Container (0%)                                │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DOMAIN TIER                                       │
│                         Coverage: 34.78% (Mostly)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                      Domain Entities                              │      │
│  │                     Coverage: 34.78%                              │      │
│  │                                                                    │      │
│  │  ✓ Budget (100%)        ✓ Category (100%)                        │      │
│  │  ✓ Transaction (100%)   ✓ User (100%)                            │      │
│  │  ✗ Money (50%)          ✗ LLM Models (0%)                        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                         Ports (Interfaces)                        │      │
│  │                     Coverage: N/A (TypeScript Interfaces)         │      │
│  │                                                                    │      │
│  │  Defines contracts for:                                           │      │
│  │  - Repository interfaces                                          │      │
│  │  - Service interfaces (Auth, Categorization, Invoice Parser)     │      │
│  │  - System interfaces (Clock, ID Generator)                        │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE TIER                                  │
│                         Coverage: 69.58% (Mostly)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────┐                    │
│  │  Persistence Adapters  │  │   Service Adapters      │                    │
│  │                        │  │                         │                    │
│  │  Local Storage:        │  │  OpenRouter AI:         │                    │
│  │  ✓ Coverage: 81.52%    │  │  ✓ Coverage: 100%       │                    │
│  │    (Fully Tested)      │  │    (Fully Tested)       │                    │
│  │                        │  │                         │                    │
│  │  - Budgets: 56%        │  │  - Categorization: 100% │                    │
│  │  - Categories: 100%    │  │  - Invoice Parser: 100% │                    │
│  │  - Transactions: 100%  │  │                         │                    │
│  │                        │  │                         │                    │
│  │  Supabase:             │  │  Auth-Supabase:         │                    │
│  │  ✓ Coverage: 34.24%    │  │  ✓ Coverage: 62.85%     │                    │
│  │    (Mostly Tested)     │  │    (Mostly Tested)      │                    │
│  │                        │  │                         │                    │
│  │  - Mappers: 100%       │  │  - Signup: 100%         │                    │
│  │  - Transactions: 100%  │  │  - Login: 100%          │                    │
│  │  - Categories: ~3%     │  │  - Refresh: ~30%        │                    │
│  │  - Budgets: ~3%        │  │  - Logout: ~30%         │                    │
│  │  - Users: ~3%          │  │                         │                    │
│  │  - LLM Calls: ~6%      │  │                         │                    │
│  └────────────────────────┘  └────────────────────────┘                    │
│                                                                              │
│  ┌────────────────────────┐                                                 │
│  │   System Adapters      │                                                 │
│  │   Coverage: 70%        │                                                 │
│  │   (Mostly Tested)      │                                                 │
│  │                        │                                                 │
│  │  ✓ Clock: 100%         │                                                 │
│  │  ✓ ID Gen: 68%         │                                                 │
│  └────────────────────────┘                                                 │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │                    External Services                            │        │
│  │                  Coverage: 0% (Not Tested)                      │        │
│  │                                                                  │        │
│  │  ✗ Supabase Database (Integration tested indirectly)            │        │
│  │  ✗ OpenRouter API (Mocked in tests)                             │        │
│  │  ✗ Cloudflare Workers Platform (Deployment target)              │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
  ✓ = Tested (has tests)
  ✗ = Not Tested (no tests)
  Fully Tested: 80%+ coverage
  Mostly Tested: 20-80% coverage
  Somewhat Tested: 0-20% coverage
  Not Tested: 0% (no tests exist)
```

## Overall Repository Coverage

**Total Coverage: 55.3%** (3,681 of 6,651 lines)
- **Functions: 74.5%** (193 of 259 functions)

## Coverage by Architecture Tier

| Tier | Coverage | Classification | Status |
|------|----------|----------------|--------|
| **Presentation** | 53-59% | Mostly Tested | ✓ |
| **Application** | 73% | Mostly Tested | ✓ |
| **Domain** | 35% | Mostly Tested | ⚠️ |
| **Infrastructure** | 70% | Mostly Tested | ✓ |
| **Composition** | 0% | Not Tested | ✗ |
