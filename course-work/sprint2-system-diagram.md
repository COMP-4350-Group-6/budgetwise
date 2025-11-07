# BudgetWise System Architecture & Testing Coverage

## Architecture Tiers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                             │
│  ┌─────────────────────────┐  ┌────────────────────────────┐   │
│  │  Frontend (Next.js)      │  │  API (Hono/Workers)        │   │
│  │  - Pages/Routes          │  │  - Routes/Endpoints        │   │
│  │  - Components            │  │  - Middleware              │   │
│  │  - Hooks                 │  │  - Container (DI)          │   │
│  │  - Services              │  │                            │   │
│  │  - Utils/Lib             │  │                            │   │
│  │                          │  │                            │   │
│  │  Coverage: ~36% lines    │  │  Tests exist but failing   │   │
│  │  Status: Mostly Tested   │  │  (env config issues)       │   │
│  │                          │  │  Status: Mostly Tested     │   │
│  └─────────────────────────┘  └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Use Cases (Business Logic)                             │   │
│  │  - Budget operations (create, update, list, delete)     │   │
│  │  - Category operations                                  │   │
│  │  - Transaction operations                               │   │
│  │  - Auth operations                                      │   │
│  │  - Dashboard aggregations                               │   │
│  │                                                          │   │
│  │  Coverage: ~92% lines, 93% branches, 100% functions     │   │
│  │  Status: Fully Tested (90/90 tests passing)            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DOMAIN TIER                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Domain Models (Pure Business Logic)                    │   │
│  │  - Budget entity & invariants                           │   │
│  │  - Category entity                                      │   │
│  │  - Transaction entity                                   │   │
│  │  - User entity                                          │   │
│  │  - Money value object                                   │   │
│  │                                                          │   │
│  │  Coverage: ~71% lines, 95.5% branches, 68.4% functions  │   │
│  │  Status: Mostly Tested (152/152 tests passing)         │   │
│  │  Note: Lower line coverage due to barrel exports        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE TIER                            │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │   Ports      │  │   Adapters     │  │   Schemas        │   │
│  │  (Interfaces)│  │                │  │  (Validation)    │   │
│  │              │  │  - Auth        │  │                  │   │
│  │              │  │    (Supabase)  │  │                  │   │
│  │              │  │  - Persistence │  │                  │   │
│  │              │  │    (Local,     │  │                  │   │
│  │              │  │     Supabase)  │  │                  │   │
│  │              │  │  - System      │  │                  │   │
│  │              │  │    (Clock, ID) │  │                  │   │
│  │              │  │  - Services    │  │                  │   │
│  │              │  │                │  │                  │   │
│  │  Coverage:   │  │  Auth: ~76%    │  │  Coverage: N/A   │   │
│  │  Not Tested  │  │  Others: 0%    │  │  Not Tested      │   │
│  │  (Interfaces)│  │  Status:       │  │  (Pure schemas)  │   │
│  │              │  │  Somewhat      │  │                  │   │
│  │              │  │  Tested        │  │                  │   │
│  └──────────────┘  └────────────────┘  └──────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Composition (Dependency Injection)                     │  │
│  │   - Cloudflare Worker container                          │  │
│  │   - Web Auth Client container                            │  │
│  │                                                           │  │
│  │   Coverage: 0%                                           │  │
│  │   Status: Not Tested                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Coverage Legend

- **Fully Tested (80%+)**: Use Cases layer
- **Mostly Tested (20-80%)**: Domain layer, Frontend, API
- **Somewhat Tested (0-20%)**: Auth adapters only
- **Not Tested (0%)**: 
  - Ports (interface definitions only)
  - Persistence adapters (local & Supabase)
  - System adapters (clock, ID generator)
  - Services adapters
  - Schemas (pure Zod validation schemas)
  - Composition/DI containers
  - Frontend UI components
  - E2E tests
