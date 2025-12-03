# @budget/schemas

Shared Zod schemas for the BudgetWise application with OpenAPI generation support.

## Overview

This package contains:
- **Zod v4 schemas** for validation across frontend and backend
- **OpenAPI generator** that converts schemas to OpenAPI 3.1 spec

## Installation

```bash
pnpm install
```

## Usage

### Using Schemas

Import schemas and types in your code:

```typescript
import { 
  LoginInputSchema, 
  BudgetDTOSchema,
  CreateTransactionInputSchema,
  type LoginInput,
  type BudgetDTO 
} from '@budget/schemas';

// Validate input
const result = LoginInputSchema.safeParse(data);
if (result.success) {
  const validated: LoginInput = result.data;
}
```

### Generating OpenAPI Spec

Generate OpenAPI 3.1 documentation from Zod schemas:

```bash
pnpm run openapi:generate
```

**Output:**
- `dist/openapi.json` - OpenAPI spec in JSON format
- `dist/openapi.yaml` - OpenAPI spec in YAML format

## Available Schemas

### Authentication
| Schema | Description |
|--------|-------------|
| `LoginInputSchema` | Email and password for login |
| `SignupInputSchema` | New user registration data |
| `RefreshTokenInputSchema` | Token refresh request |
| `AuthUserSchema` | Authenticated user info |
| `AuthTokensSchema` | JWT access/refresh tokens |
| `AuthSessionSchema` | Complete session with user and tokens |
| `AuthErrorSchema` | Auth error response |

### Budgets
| Schema | Description |
|--------|-------------|
| `CreateBudgetInputSchema` | Create budget request |
| `UpdateBudgetInputSchema` | Update budget request |
| `BudgetDTOSchema` | Budget API response |
| `BudgetStatusSchema` | Budget with spending info |
| `BudgetPeriodSchema` | Budget period enum |

### Categories
| Schema | Description |
|--------|-------------|
| `CreateCategoryInputSchema` | Create category request |
| `UpdateCategoryInputSchema` | Update category request |
| `CategoryDTOSchema` | Category API response |

### Transactions
| Schema | Description |
|--------|-------------|
| `CreateTransactionInputSchema` | Create transaction request |
| `UpdateTransactionInputSchema` | Update transaction request |
| `TransactionDTOSchema` | Transaction API response |
| `CategorizationResultSchema` | AI categorization result |
| `ParsedInvoiceSchema` | AI invoice parsing result |

### Common
| Schema | Description |
|--------|-------------|
| `CurrencySchema` | Supported currency codes |
| `MoneySchema` | Money value in cents |
| `UserDTOSchema` | User profile data |

## How OpenAPI Generation Works

The generator uses [zod-openapi](https://github.com/samchungy/zod-openapi) which is compatible with Zod v4.

### Adding OpenAPI Metadata

Use Zod's `.meta()` method to add OpenAPI documentation:

```typescript
const MySchema = z
  .object({
    name: z.string().min(1).meta({ 
      description: "User's display name" 
    }),
    email: z.email().meta({ 
      description: "User's email address" 
    }),
  })
  .meta({
    id: "MySchema",  // Registers as a reusable component
    description: "My schema description",
  });
```

### Registering New Endpoints

Edit `src/openapi-generator.ts` to add new API paths:

```typescript
const document = createDocument({
  // ...
  paths: {
    "/my-endpoint": {
      get: {
        tags: ["MyTag"],
        summary: "Get something",
        description: "Detailed description",
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": { schema: MyResponseSchema },
            },
          },
        },
      },
    },
  },
});
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Compile TypeScript to dist/ |
| `pnpm openapi:generate` | Generate OpenAPI spec |

## Dependencies

- **zod** `^4.1.12` - Schema validation
- **zod-openapi** `^5.4.2` - OpenAPI generation
- **yaml** `^2.7.0` - YAML serialization (dev)
- **tsx** `^4.19.0` - TypeScript execution (dev)

## Testing the API with Swagger UI

### Option 1: Built-in Swagger UI (Recommended)

The API serves Swagger UI directly at `/docs`:

1. **Set up local environment:**
   ```bash
   # Copy the example env file and fill in your Supabase credentials
   cp apps/api/.dev.vars.example apps/api/.dev.vars
   ```
   
   Edit `.dev.vars` with your credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_JWT_SECRET=your-jwt-secret
   ```

2. **Start the local API server:**
   ```bash
   cd apps/api && pnpm run dev
   ```
   
   The server runs locally using Wrangler (Cloudflare Workers dev server).

3. **Open Swagger UI:** http://localhost:8787/docs

4. **Test endpoints** - Click "Try it out" on any endpoint

### Troubleshooting

**Auth endpoints return 404:**
- Auth routes only mount when `authProvider` is configured
- Ensure your `.dev.vars` has valid Supabase credentials
- Check the terminal for errors like "tokenVerifier is required"

**"Cannot find module" errors:**
- Run `pnpm install` at the root
- If issues persist, run `pnpm run build` in dependent packages

### Option 2: Swagger Editor (External)

You can also use the external Swagger Editor:

1. **Start the local API server** (as above)

2. **Open Swagger Editor:** https://editor.swagger.io

3. **Import the OpenAPI spec:**
   - File → Import file → Select `packages/schemas/dist/openapi.json`
   - Or paste the YAML content from `packages/schemas/dist/openapi.yaml`

4. **Select the local server:**
   - In the server dropdown, choose "Local development (http://localhost:8787)"

> **Note:** Testing against `api.budgetwise.app` from Swagger Editor will fail due to CORS. The production API only allows requests from approved domains (budgetwise.ca, etc.).

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Redirects to /docs |
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | Raw OpenAPI spec |
| `GET /health` | Health check |

## Validator Compatibility Notes

The generator produces **OpenAPI 3.1.0** specification which has some differences from 3.0:

1. **Nullable types**: OpenAPI 3.1 uses `type: "null"` syntax (JSON Schema style) instead of 3.0's `nullable: true`. Some validators may flag this.

2. **YAML null handling**: In YAML, the string `"null"` must be quoted to distinguish it from the YAML null value. Some validators incorrectly expect unquoted `null`.

3. **Status codes**: Status codes like `"200"` are quoted in YAML for proper parsing. Some validators may incorrectly flag these.

**Recommendation**: Use the JSON output (`openapi.json`) for maximum compatibility. The YAML output may have validation warnings with some tools that don't fully support OpenAPI 3.1.