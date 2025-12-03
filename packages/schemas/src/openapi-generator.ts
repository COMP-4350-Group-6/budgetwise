/**
 * OpenAPI Generator Script
 *
 * This script generates OpenAPI 3.1 documentation from Zod schemas.
 * Uses zod-openapi library which is compatible with Zod v4.
 *
 * Usage: npx tsx src/openapi-generator.ts
 */

import { z } from "zod/v4";
import { createDocument, createSchema } from "zod-openapi";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ============================================================================
// Schema Definitions with OpenAPI Metadata
// ============================================================================

// Currency
const CurrencySchema = z
  .enum(["USD", "EUR", "GBP", "JPY", "INR", "CAD"])
  .meta({
    id: "Currency",
    description: "Supported currency codes",
    example: "USD",
  });

// Money
const MoneySchema = z
  .object({
    cents: z.number().int().meta({ description: "Amount in smallest currency unit" }),
    currency: CurrencySchema.default("USD"),
  })
  .meta({
    id: "Money",
    description: "Money value in smallest currency unit (cents)",
  });

// Budget Period
const BudgetPeriodSchema = z
  .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
  .meta({
    id: "BudgetPeriod",
    description: "Budget time period",
    example: "MONTHLY",
  });

// Auth Input Schemas
const LoginInputSchema = z
  .object({
    email: z.email().meta({ description: "User email address" }),
    password: z.string().min(8).meta({ description: "User password (min 8 characters)" }),
  })
  .meta({
    id: "LoginInput",
    description: "Credentials for user login",
  });

const SignupInputSchema = z
  .object({
    email: z.email().meta({ description: "User email address" }),
    password: z.string().min(8).meta({ description: "User password (min 8 characters)" }),
    name: z.string().min(1).meta({ description: "User display name" }),
    defaultCurrency: CurrencySchema.default("USD"),
  })
  .meta({
    id: "SignupInput",
    description: "Data for creating a new user account",
  });

const RefreshTokenInputSchema = z
  .object({
    refreshToken: z.string().meta({ description: "JWT refresh token" }),
  })
  .meta({
    id: "RefreshTokenInput",
    description: "Refresh token for renewing authentication",
  });

// Auth Response Schemas
const AuthUserSchema = z
  .object({
    id: z.string().meta({ description: "User unique identifier" }),
    email: z.string().meta({ description: "User email address" }),
    name: z.string().meta({ description: "User display name" }),
    defaultCurrency: z.string().meta({ description: "User default currency" }),
    createdAt: z.string().meta({ description: "Account creation timestamp" }),
  })
  .meta({
    id: "AuthUser",
    description: "Authenticated user information",
  });

const AuthTokensSchema = z
  .object({
    accessToken: z.string().meta({ description: "JWT access token" }),
    refreshToken: z.string().meta({ description: "JWT refresh token" }),
    expiresAt: z.number().optional().meta({ description: "Token expiration timestamp" }),
  })
  .meta({
    id: "AuthTokens",
    description: "JWT access and refresh tokens",
  });

const AuthSessionSchema = z
  .object({
    user: AuthUserSchema,
    tokens: AuthTokensSchema,
  })
  .meta({
    id: "AuthSession",
    description: "Complete authentication session",
  });

const AuthErrorCodeSchema = z
  .enum([
    "INVALID_CREDENTIALS",
    "USER_NOT_FOUND",
    "EMAIL_ALREADY_EXISTS",
    "WEAK_PASSWORD",
    "EMAIL_NOT_CONFIRMED",
    "SESSION_EXPIRED",
    "INVALID_TOKEN",
    "NETWORK_ERROR",
    "UNKNOWN_ERROR",
  ])
  .meta({
    id: "AuthErrorCode",
    description: "Authentication error codes",
    example: "INVALID_CREDENTIALS",
  });

const AuthErrorSchema = z
  .object({
    code: AuthErrorCodeSchema,
    message: z.string().meta({ description: "Human readable error message" }),
    details: z.record(z.string(), z.unknown()).optional(),
  })
  .meta({
    id: "AuthError",
    description: "Authentication error response",
  });

// Budget Schemas
const CreateBudgetInputSchema = z
  .object({
    categoryId: z.string().min(1).meta({ description: "Category ID" }),
    name: z.string().min(1).max(100).meta({ description: "Budget name" }),
    amountCents: z.number().int().min(0).meta({ description: "Budget amount in cents" }),
    currency: CurrencySchema,
    period: BudgetPeriodSchema,
    startDate: z.string().meta({ description: "Budget start date (ISO 8601)" }),
    endDate: z.string().optional().meta({ description: "Budget end date (ISO 8601)" }),
    alertThreshold: z.number().int().min(0).max(100).optional().meta({ description: "Alert threshold percentage" }),
    isActive: z.boolean().default(true).optional().meta({ description: "Whether budget is active" }),
  })
  .meta({
    id: "CreateBudgetInput",
    description: "Data for creating a new budget",
  });

const BudgetDTOSchema = z
  .object({
    id: z.string().meta({ description: "Budget unique identifier" }),
    userId: z.string().meta({ description: "Owner user ID" }),
    categoryId: z.string().meta({ description: "Associated category ID" }),
    name: z.string().meta({ description: "Budget name" }),
    amountCents: z.number().int().meta({ description: "Budget amount in cents" }),
    currency: CurrencySchema,
    period: BudgetPeriodSchema,
    startDate: z.string().meta({ description: "Budget start date" }),
    endDate: z.string().nullable().meta({ description: "Budget end date" }),
    isActive: z.boolean().meta({ description: "Whether budget is active" }),
    alertThreshold: z.number().nullable().meta({ description: "Alert threshold percentage" }),
    createdAt: z.string().meta({ description: "Creation timestamp" }),
    updatedAt: z.string().meta({ description: "Last update timestamp" }),
  })
  .meta({
    id: "BudgetDTO",
    description: "Budget data transfer object",
  });

const BudgetStatusSchema = z
  .object({
    budget: BudgetDTOSchema,
    spentCents: z.number().int().meta({ description: "Amount spent in cents" }),
    remainingCents: z.number().int().meta({ description: "Remaining budget in cents" }),
    percentageUsed: z.number().meta({ description: "Percentage of budget used" }),
    isOverBudget: z.boolean().meta({ description: "Whether spending exceeded budget" }),
    shouldAlert: z.boolean().meta({ description: "Whether to show alert" }),
    transactionCount: z.number().int().meta({ description: "Number of transactions" }),
  })
  .meta({
    id: "BudgetStatus",
    description: "Budget status with spending information",
  });

// Category Schemas
const CreateCategoryInputSchema = z
  .object({
    name: z.string().min(1).max(50).meta({ description: "Category name" }),
    description: z.string().max(200).optional().meta({ description: "Category description" }),
    icon: z.string().optional().meta({ description: "Category icon emoji" }),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().meta({ description: "Category color (hex)" }),
    isActive: z.boolean().default(true).meta({ description: "Whether category is active" }),
    sortOrder: z.number().int().min(0).optional().meta({ description: "Display order" }),
  })
  .meta({
    id: "CreateCategoryInput",
    description: "Data for creating a new category",
  });

const CategoryDTOSchema = z
  .object({
    id: z.string().meta({ description: "Category unique identifier" }),
    userId: z.string().meta({ description: "Owner user ID" }),
    name: z.string().meta({ description: "Category name" }),
    description: z.string().nullable().meta({ description: "Category description" }),
    icon: z.string().nullable().meta({ description: "Category icon emoji" }),
    color: z.string().nullable().meta({ description: "Category color (hex)" }),
    isDefault: z.boolean().meta({ description: "Whether this is a default category" }),
    isActive: z.boolean().meta({ description: "Whether category is active" }),
    sortOrder: z.number().int().meta({ description: "Display order" }),
    createdAt: z.string().meta({ description: "Creation timestamp" }),
    updatedAt: z.string().meta({ description: "Last update timestamp" }),
  })
  .meta({
    id: "CategoryDTO",
    description: "Category data transfer object",
  });

// Transaction Schemas
const CreateTransactionInputSchema = z
  .object({
    budgetId: z.string().optional().meta({ description: "Associated budget ID" }),
    categoryId: z.string().optional().meta({ description: "Associated category ID" }),
    amountCents: z.number().int().meta({ description: "Transaction amount in cents" }),
    note: z.string().max(280).optional().meta({ description: "Transaction note" }),
    occurredAt: z.string().meta({ description: "Transaction date (ISO 8601)" }),
  })
  .meta({
    id: "CreateTransactionInput",
    description: "Data for creating a new transaction",
  });

const TransactionDTOSchema = z
  .object({
    id: z.string().meta({ description: "Transaction unique identifier" }),
    userId: z.string().meta({ description: "Owner user ID" }),
    budgetId: z.string().nullable().meta({ description: "Associated budget ID" }),
    categoryId: z.string().nullable().meta({ description: "Associated category ID" }),
    amountCents: z.number().int().meta({ description: "Transaction amount in cents" }),
    note: z.string().nullable().meta({ description: "Transaction note" }),
    occurredAt: z.string().meta({ description: "Transaction date" }),
    createdAt: z.string().meta({ description: "Creation timestamp" }),
    updatedAt: z.string().meta({ description: "Last update timestamp" }),
  })
  .meta({
    id: "TransactionDTO",
    description: "Transaction data transfer object",
  });

const CategorizationResultSchema = z
  .object({
    categoryId: z.string().meta({ description: "Suggested category ID" }),
    reasoning: z.string().meta({ description: "AI reasoning for suggestion" }),
  })
  .meta({
    id: "CategorizationResult",
    description: "AI transaction categorization result",
  });

const ParsedInvoiceSchema = z
  .object({
    merchant: z.string().meta({ description: "Merchant name" }),
    total: z.number().meta({ description: "Invoice total amount" }),
    confidence: z.number().min(0).max(1).meta({ description: "AI confidence score" }),
  })
  .meta({
    id: "ParsedInvoice",
    description: "AI-parsed invoice data",
  });

// User Schema
const UserDTOSchema = z
  .object({
    id: z.string().meta({ description: "User unique identifier" }),
    email: z.string().meta({ description: "User email address" }),
    name: z.string().meta({ description: "User display name" }),
    defaultCurrency: CurrencySchema,
    createdAt: z.string().meta({ description: "Account creation timestamp" }),
    updatedAt: z.string().meta({ description: "Last update timestamp" }),
  })
  .meta({
    id: "UserDTO",
    description: "User data transfer object",
  });

// LLM Call Schemas
const LLMCallTypeSchema = z
  .enum(["auto_categorize", "auto_invoice"])
  .meta({
    id: "LLMCallType",
    description: "Type of LLM API call",
    example: "auto_categorize",
  });

const LLMCallStatusSchema = z
  .enum(["success", "error"])
  .meta({
    id: "LLMCallStatus",
    description: "Status of LLM API call",
    example: "success",
  });

// Common Response Schemas
const SuccessResponseSchema = z
  .object({
    success: z.boolean().meta({ description: "Operation success status" }),
    message: z.string().optional().meta({ description: "Response message" }),
  })
  .meta({
    id: "SuccessResponse",
    description: "Generic success response",
  });

const ErrorResponseSchema = z
  .object({
    success: z.literal(false),
    error: z.string().meta({ description: "Error message" }),
    code: z.string().optional().meta({ description: "Error code" }),
  })
  .meta({
    id: "ErrorResponse",
    description: "Generic error response",
  });

const PaginatedResponseSchema = z
  .object({
    data: z.array(z.unknown()).meta({ description: "Response data array" }),
    total: z.number().int().meta({ description: "Total count of items" }),
    page: z.number().int().meta({ description: "Current page number" }),
    pageSize: z.number().int().meta({ description: "Items per page" }),
    hasMore: z.boolean().meta({ description: "Whether more pages exist" }),
  })
  .meta({
    id: "PaginatedResponse",
    description: "Paginated response wrapper",
  });

// ============================================================================
// Generate OpenAPI Document
// ============================================================================

function generateOpenAPISpec(): void {
  const document = createDocument({
    openapi: "3.1.0",
    info: {
      title: "BudgetWise API",
      version: "1.0.0",
      description:
        "API for the BudgetWise personal finance management application. " +
        "This API provides endpoints for managing budgets, categories, transactions, and user authentication.",
      contact: {
        name: "BudgetWise Team",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "https://api.budgetwise.app",
        description: "Production API",
      },
      {
        url: "http://localhost:8787",
        description: "Local development",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication and session management" },
      { name: "Budgets", description: "Budget CRUD operations" },
      { name: "Categories", description: "Category management" },
      { name: "Transactions", description: "Transaction management" },
      { name: "Users", description: "User profile management" },
      { name: "AI", description: "AI-powered features" },
    ],
    paths: {
      // Auth endpoints
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "User login",
          description: "Authenticate user with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: LoginInputSchema },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": { schema: AuthSessionSchema },
              },
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": { schema: AuthErrorSchema },
              },
            },
          },
        },
      },
      "/auth/signup": {
        post: {
          tags: ["Auth"],
          summary: "User registration",
          description: "Create a new user account",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: SignupInputSchema },
            },
          },
          responses: {
            "201": {
              description: "Account created",
              content: {
                "application/json": { schema: AuthSessionSchema },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: AuthErrorSchema },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          description: "Exchange refresh token for new access token",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: RefreshTokenInputSchema },
            },
          },
          responses: {
            "200": {
              description: "Tokens refreshed",
              content: {
                "application/json": { schema: AuthTokensSchema },
              },
            },
            "401": {
              description: "Invalid refresh token",
              content: {
                "application/json": { schema: AuthErrorSchema },
              },
            },
          },
        },
      },
      // Budget endpoints
      "/budgets": {
        get: {
          tags: ["Budgets"],
          summary: "List budgets",
          description: "Get all budgets for the authenticated user",
          responses: {
            "200": {
              description: "List of budgets",
              content: {
                "application/json": {
                  schema: z.object({
                    budgets: z.array(BudgetDTOSchema),
                  }),
                },
              },
            },
          },
        },
        post: {
          tags: ["Budgets"],
          summary: "Create budget",
          description: "Create a new budget",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateBudgetInputSchema },
            },
          },
          responses: {
            "201": {
              description: "Budget created",
              content: {
                "application/json": { schema: BudgetDTOSchema },
              },
            },
          },
        },
      },
      "/budgets/{id}": {
        get: {
          tags: ["Budgets"],
          summary: "Get budget",
          description: "Get a specific budget by ID",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Budget details",
              content: {
                "application/json": { schema: BudgetDTOSchema },
              },
            },
            "404": {
              description: "Budget not found",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
        put: {
          tags: ["Budgets"],
          summary: "Update budget",
          description: "Update an existing budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID" }),
            }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateBudgetInputSchema.partial() },
            },
          },
          responses: {
            "200": {
              description: "Budget updated",
              content: {
                "application/json": { schema: BudgetDTOSchema },
              },
            },
          },
        },
        delete: {
          tags: ["Budgets"],
          summary: "Delete budget",
          description: "Delete a budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Budget deleted",
              content: {
                "application/json": { schema: SuccessResponseSchema },
              },
            },
          },
        },
      },
      "/budgets/{id}/status": {
        get: {
          tags: ["Budgets"],
          summary: "Get budget status",
          description: "Get spending status for a budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Budget status",
              content: {
                "application/json": { schema: BudgetStatusSchema },
              },
            },
          },
        },
      },
      // Category endpoints
      "/categories": {
        get: {
          tags: ["Categories"],
          summary: "List categories",
          description: "Get all categories for the authenticated user",
          responses: {
            "200": {
              description: "List of categories",
              content: {
                "application/json": {
                  schema: z.object({
                    categories: z.array(CategoryDTOSchema),
                  }),
                },
              },
            },
          },
        },
        post: {
          tags: ["Categories"],
          summary: "Create category",
          description: "Create a new category",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateCategoryInputSchema },
            },
          },
          responses: {
            "201": {
              description: "Category created",
              content: {
                "application/json": { schema: CategoryDTOSchema },
              },
            },
          },
        },
      },
      "/categories/{id}": {
        get: {
          tags: ["Categories"],
          summary: "Get category",
          description: "Get a specific category by ID",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Category ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Category details",
              content: {
                "application/json": { schema: CategoryDTOSchema },
              },
            },
          },
        },
        put: {
          tags: ["Categories"],
          summary: "Update category",
          description: "Update an existing category",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Category ID" }),
            }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateCategoryInputSchema.partial() },
            },
          },
          responses: {
            "200": {
              description: "Category updated",
              content: {
                "application/json": { schema: CategoryDTOSchema },
              },
            },
          },
        },
        delete: {
          tags: ["Categories"],
          summary: "Delete category",
          description: "Delete a category",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Category ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Category deleted",
              content: {
                "application/json": { schema: SuccessResponseSchema },
              },
            },
          },
        },
      },
      // Transaction endpoints
      "/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "List transactions",
          description: "Get transactions for the authenticated user",
          requestParams: {
            query: z.object({
              startDate: z.string().optional().meta({ description: "Filter start date" }),
              endDate: z.string().optional().meta({ description: "Filter end date" }),
              categoryId: z.string().optional().meta({ description: "Filter by category" }),
              limit: z.number().int().optional().meta({ description: "Max results to return" }),
            }),
          },
          responses: {
            "200": {
              description: "List of transactions",
              content: {
                "application/json": {
                  schema: z.object({
                    transactions: z.array(TransactionDTOSchema),
                  }),
                },
              },
            },
          },
        },
        post: {
          tags: ["Transactions"],
          summary: "Create transaction",
          description: "Create a new transaction",
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateTransactionInputSchema },
            },
          },
          responses: {
            "201": {
              description: "Transaction created",
              content: {
                "application/json": { schema: TransactionDTOSchema },
              },
            },
          },
        },
      },
      "/transactions/{id}": {
        get: {
          tags: ["Transactions"],
          summary: "Get transaction",
          description: "Get a specific transaction by ID",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Transaction details",
              content: {
                "application/json": { schema: TransactionDTOSchema },
              },
            },
          },
        },
        put: {
          tags: ["Transactions"],
          summary: "Update transaction",
          description: "Update an existing transaction",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID" }),
            }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: CreateTransactionInputSchema.partial() },
            },
          },
          responses: {
            "200": {
              description: "Transaction updated",
              content: {
                "application/json": { schema: TransactionDTOSchema },
              },
            },
          },
        },
        delete: {
          tags: ["Transactions"],
          summary: "Delete transaction",
          description: "Delete a transaction",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Transaction deleted",
              content: {
                "application/json": { schema: SuccessResponseSchema },
              },
            },
          },
        },
      },
      "/transactions/{id}/categorize": {
        post: {
          tags: ["Transactions", "AI"],
          summary: "Auto-categorize transaction",
          description: "Use AI to suggest a category for a transaction",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID" }),
            }),
          },
          responses: {
            "200": {
              description: "Categorization result",
              content: {
                "application/json": { schema: CategorizationResultSchema },
              },
            },
          },
        },
      },
      "/transactions/parse-invoice": {
        post: {
          tags: ["Transactions", "AI"],
          summary: "Parse invoice image",
          description: "Use AI to extract transaction data from an invoice image",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: z.object({
                  imageBase64: z.string().meta({ description: "Base64 encoded invoice image" }),
                }),
              },
            },
          },
          responses: {
            "200": {
              description: "Parsed invoice data",
              content: {
                "application/json": { schema: ParsedInvoiceSchema },
              },
            },
          },
        },
      },
      // User endpoints
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          description: "Get profile of authenticated user",
          responses: {
            "200": {
              description: "User profile",
              content: {
                "application/json": { schema: UserDTOSchema },
              },
            },
          },
        },
      },
      // Health endpoint
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          description: "Check API health status",
          responses: {
            "200": {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: z.object({
                    status: z.literal("ok"),
                    timestamp: z.string(),
                  }),
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token from /auth/login",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  });

  // Get output directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distDir = path.join(__dirname, "..", "dist");

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Write JSON
  const jsonPath = path.join(distDir, "openapi.json");
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`✅ Generated OpenAPI JSON: ${jsonPath}`);

  // Write YAML (simple conversion)
  const yamlPath = path.join(distDir, "openapi.yaml");
  fs.writeFileSync(yamlPath, jsonToYaml(document));
  console.log(`✅ Generated OpenAPI YAML: ${yamlPath}`);

  // Print stats
  const schemaCount = Object.keys(document.components?.schemas ?? {}).length;
  const pathCount = Object.keys(document.paths ?? {}).length;
  console.log(`\n📊 Generated ${pathCount} paths and ${schemaCount} component schemas`);
}

// Simple JSON to YAML converter
function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = "  ".repeat(indent);

  if (obj === null || obj === undefined) {
    return "null";
  }

  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj === "") {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return obj;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => `${spaces}- ${jsonToYaml(item, indent + 1).trimStart()}`).join("\n");
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, value]) => {
        const valueStr = jsonToYaml(value, indent + 1);
        if (typeof value === "object" && value !== null && !Array.isArray(value) && Object.keys(value).length > 0) {
          return `${spaces}${key}:\n${valueStr}`;
        }
        if (Array.isArray(value) && value.length > 0) {
          return `${spaces}${key}:\n${valueStr}`;
        }
        return `${spaces}${key}: ${valueStr}`;
      })
      .join("\n");
  }

  return String(obj);
}

// Run generator
generateOpenAPISpec();