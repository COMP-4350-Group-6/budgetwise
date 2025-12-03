/**
 * OpenAPI Generator Script
 *
 * This script generates OpenAPI 3.1 documentation from Zod schemas.
 * Uses zod-openapi library which is compatible with Zod v4.
 *
 * Usage: npx tsx src/openapi-generator.ts
 */

import { z } from "zod/v4";
import { createDocument } from "zod-openapi";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

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
    email: z.email().meta({ description: "User email address", example: "user@example.com" }),
    password: z.string().min(8).meta({ description: "User password (min 8 characters)", example: "securePass123" }),
  })
  .meta({
    id: "LoginInput",
    description: "Credentials for user login",
  });

const SignupInputSchema = z
  .object({
    email: z.email().meta({ description: "User email address", example: "user@example.com" }),
    password: z.string().min(8).meta({ description: "User password (min 8 characters)", example: "securePass123" }),
    name: z.string().min(1).meta({ description: "User display name", example: "John Doe" }),
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
    categoryId: z.string().min(1).meta({ description: "Category ID", example: "01HXYZ123ABC" }),
    name: z.string().min(1).max(100).meta({ description: "Budget name", example: "Groceries" }),
    amountCents: z.number().int().min(0).max(100000000).meta({ description: "Budget amount in cents (e.g. 50000 = $500)", example: 50000 }),
    currency: CurrencySchema,
    period: BudgetPeriodSchema,
    startDate: z.string().meta({ description: "Budget start date (ISO 8601)", example: "2024-01-01" }),
    endDate: z.string().optional().meta({ description: "Budget end date (ISO 8601)", example: "2024-12-31" }),
    alertThreshold: z.number().int().min(0).max(100).optional().meta({ description: "Alert threshold percentage", example: 80 }),
    isActive: z.boolean().default(true).optional().meta({ description: "Whether budget is active" }),
  })
  .meta({
    id: "CreateBudgetInput",
    description: "Data for creating a new budget",
  });

const BudgetDTOSchema = z
  .object({
    id: z.string().meta({ description: "Budget unique identifier", example: "01HXYZ123ABC" }),
    userId: z.string().meta({ description: "Owner user ID", example: "01HXYZ456DEF" }),
    categoryId: z.string().meta({ description: "Associated category ID", example: "01HXYZ789GHI" }),
    name: z.string().meta({ description: "Budget name", example: "Groceries" }),
    amountCents: z.number().int().meta({ description: "Budget amount in cents", example: 50000 }),
    currency: CurrencySchema,
    period: BudgetPeriodSchema,
    startDate: z.string().meta({ description: "Budget start date", example: "2024-01-01T00:00:00Z" }),
    endDate: z.string().nullable().meta({ description: "Budget end date", example: "2024-12-31T00:00:00Z" }),
    isActive: z.boolean().meta({ description: "Whether budget is active", example: true }),
    alertThreshold: z.number().nullable().meta({ description: "Alert threshold percentage", example: 80 }),
    createdAt: z.string().meta({ description: "Creation timestamp", example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.string().meta({ description: "Last update timestamp", example: "2024-01-01T00:00:00Z" }),
  })
  .meta({
    id: "BudgetDTO",
    description: "Budget data transfer object",
  });

const BudgetStatusSchema = z
  .object({
    budget: BudgetDTOSchema,
    spentCents: z.number().int().meta({ description: "Amount spent in cents", example: 25000 }),
    remainingCents: z.number().int().meta({ description: "Remaining budget in cents", example: 25000 }),
    percentageUsed: z.number().meta({ description: "Percentage of budget used", example: 50.0 }),
    isOverBudget: z.boolean().meta({ description: "Whether spending exceeded budget", example: false }),
    shouldAlert: z.boolean().meta({ description: "Whether to show alert", example: false }),
    transactionCount: z.number().int().meta({ description: "Number of transactions", example: 15 }),
  })
  .meta({
    id: "BudgetStatus",
    description: "Budget status with spending information",
  });

// Category Schemas
const CreateCategoryInputSchema = z
  .object({
    name: z.string().min(1).max(50).meta({ description: "Category name", example: "Groceries" }),
    description: z.string().max(200).optional().meta({ description: "Category description", example: "Food and household items" }),
    icon: z.string().optional().meta({ description: "Category icon emoji", example: "🛒" }),
    color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().meta({ description: "Category color (hex)", example: "#4CAF50" }),
    isActive: z.boolean().default(true).meta({ description: "Whether category is active" }),
    sortOrder: z.number().int().min(0).max(1000).optional().meta({ description: "Display order", example: 1 }),
  })
  .meta({
    id: "CreateCategoryInput",
    description: "Data for creating a new category",
  });

const CategoryDTOSchema = z
  .object({
    id: z.string().meta({ description: "Category unique identifier", example: "01HXYZ123ABC" }),
    userId: z.string().meta({ description: "Owner user ID", example: "01HXYZ456DEF" }),
    name: z.string().meta({ description: "Category name", example: "Groceries" }),
    description: z.string().nullable().meta({ description: "Category description", example: "Food and household items" }),
    icon: z.string().nullable().meta({ description: "Category icon emoji", example: "🛒" }),
    color: z.string().nullable().meta({ description: "Category color (hex)", example: "#4CAF50" }),
    isDefault: z.boolean().meta({ description: "Whether this is a default category", example: false }),
    isActive: z.boolean().meta({ description: "Whether category is active", example: true }),
    sortOrder: z.number().int().meta({ description: "Display order", example: 1 }),
    createdAt: z.string().meta({ description: "Creation timestamp", example: "2024-01-01T00:00:00Z" }),
    updatedAt: z.string().meta({ description: "Last update timestamp", example: "2024-01-01T00:00:00Z" }),
  })
  .meta({
    id: "CategoryDTO",
    description: "Category data transfer object",
  });

// Transaction Schemas
const CreateTransactionInputSchema = z
  .object({
    budgetId: z.string().optional().meta({ description: "Associated budget ID", example: "01HXYZ789GHI" }),
    categoryId: z.string().optional().meta({ description: "Associated category ID", example: "01HXYZ123ABC" }),
    amountCents: z.number().int().min(-100000000).max(100000000).meta({ description: "Transaction amount in cents (e.g. 2500 = $25)", example: 2500 }),
    note: z.string().max(280).optional().meta({ description: "Transaction note", example: "Weekly groceries" }),
    occurredAt: z.string().meta({ description: "Transaction date (ISO 8601)", example: "2024-01-15T12:00:00Z" }),
  })
  .meta({
    id: "CreateTransactionInput",
    description: "Data for creating a new transaction",
  });

const TransactionDTOSchema = z
  .object({
    id: z.string().meta({ description: "Transaction unique identifier", example: "01HXYZ123ABC" }),
    userId: z.string().meta({ description: "Owner user ID", example: "01HXYZ456DEF" }),
    budgetId: z.string().nullable().meta({ description: "Associated budget ID", example: "01HXYZ789GHI" }),
    categoryId: z.string().nullable().meta({ description: "Associated category ID", example: "01HXYZABC123" }),
    amountCents: z.number().int().meta({ description: "Transaction amount in cents", example: 2500 }),
    note: z.string().nullable().meta({ description: "Transaction note", example: "Weekly groceries" }),
    occurredAt: z.string().meta({ description: "Transaction date", example: "2024-01-15T12:00:00Z" }),
    createdAt: z.string().meta({ description: "Creation timestamp", example: "2024-01-15T12:00:00Z" }),
    updatedAt: z.string().meta({ description: "Last update timestamp", example: "2024-01-15T12:00:00Z" }),
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
        url: "http://localhost:8787",
        description: "Local development (start with: pnpm --filter @budget/api run dev)",
      },
      {
        url: "https://api.budgetwise.app",
        description: "Production API",
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
      // ========================================================================
      // Auth endpoints (public)
      // ========================================================================
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "User login",
          description: "Authenticate user with email and password. Sets a session cookie on success.",
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
                "application/json": {
                  schema: z.object({
                    user: AuthUserSchema,
                  }),
                },
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
                "application/json": {
                  schema: z.object({
                    user: AuthUserSchema,
                  }),
                },
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
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "User logout",
          description: "End the current session and clear cookies",
          responses: {
            "200": {
              description: "Logged out successfully",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string().meta({ example: "Logged out successfully" }),
                  }),
                },
              },
            },
          },
        },
      },
      "/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh session",
          description: "Refresh the current session using cookie credentials",
          responses: {
            "200": {
              description: "Session refreshed",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string().meta({ example: "Session refreshed" }),
                  }),
                },
              },
            },
            "401": {
              description: "No session or expired",
              content: {
                "application/json": { schema: AuthErrorSchema },
              },
            },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          description: "Verify session and return current user info",
          responses: {
            "200": {
              description: "Current user",
              content: {
                "application/json": {
                  schema: z.object({
                    user: z.object({
                      id: z.string(),
                      email: z.string(),
                    }),
                  }),
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset",
          description: "Send a password reset email (always returns success for security)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: z.object({
                  email: z.email().meta({ description: "User email address", example: "user@example.com" }),
                }),
              },
            },
          },
          responses: {
            "200": {
              description: "Request processed",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string(),
                  }),
                },
              },
            },
          },
        },
      },
      "/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password",
          description: "Reset password using token from email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: z.object({
                  token: z.string().meta({ description: "Reset token from email" }),
                  newPassword: z.string().min(8).meta({ description: "New password" }),
                }),
              },
            },
          },
          responses: {
            "200": {
              description: "Password reset successfully",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string(),
                  }),
                },
              },
            },
            "400": {
              description: "Invalid or expired token",
              content: {
                "application/json": { schema: AuthErrorSchema },
              },
            },
          },
        },
      },
      // ========================================================================
      // Budget endpoints (protected - /v1/budgets)
      // ========================================================================
      "/v1/budgets": {
        get: {
          tags: ["Budgets"],
          summary: "List budgets",
          description: "Get all budgets for the authenticated user",
          requestParams: {
            query: z.object({
              active: z.string().optional().meta({ description: "Filter active only (true/false)" }),
            }),
          },
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
          description: "Create a new budget for the authenticated user",
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
                "application/json": {
                  schema: z.object({
                    budget: BudgetDTOSchema,
                  }),
                },
              },
            },
            "400": {
              description: "Validation error or invalid category",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/v1/budgets/dashboard": {
        get: {
          tags: ["Budgets"],
          summary: "Get budget dashboard",
          description: "Get comprehensive budget dashboard with spending summaries",
          responses: {
            "200": {
              description: "Budget dashboard data",
              content: {
                "application/json": {
                  schema: z.object({
                    dashboard: BudgetStatusSchema,
                  }),
                },
              },
            },
          },
        },
      },
      "/v1/budgets/{id}": {
        put: {
          tags: ["Budgets"],
          summary: "Update budget",
          description: "Update an existing budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID", example: "01HXYZ123ABC" }),
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
                "application/json": {
                  schema: z.object({
                    budget: BudgetDTOSchema,
                  }),
                },
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
        delete: {
          tags: ["Budgets"],
          summary: "Delete budget",
          description: "Delete a budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID", example: "01HXYZ123ABC" }),
            }),
          },
          responses: {
            "200": {
              description: "Budget deleted",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string().meta({ example: "Budget deleted" }),
                  }),
                },
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
      },
      "/v1/budgets/{id}/status": {
        get: {
          tags: ["Budgets"],
          summary: "Get budget status",
          description: "Get spending status for a specific budget",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Budget ID", example: "01HXYZ123ABC" }),
            }),
          },
          responses: {
            "200": {
              description: "Budget status",
              content: {
                "application/json": {
                  schema: z.object({
                    status: BudgetStatusSchema,
                  }),
                },
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
      },
      // ========================================================================
      // Category endpoints (protected - /v1/categories)
      // ========================================================================
      "/v1/categories": {
        get: {
          tags: ["Categories"],
          summary: "List categories",
          description: "Get all categories for the authenticated user",
          requestParams: {
            query: z.object({
              active: z.string().optional().meta({ description: "Filter active only (true/false)" }),
            }),
          },
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
                "application/json": {
                  schema: z.object({
                    category: CategoryDTOSchema,
                  }),
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/v1/categories/seed": {
        post: {
          tags: ["Categories"],
          summary: "Seed default categories",
          description: "Create default categories for a new user",
          responses: {
            "201": {
              description: "Default categories created",
              content: {
                "application/json": {
                  schema: z.object({
                    categories: z.array(CategoryDTOSchema),
                    created: z.number().int().meta({ description: "Number of categories created" }),
                    message: z.string(),
                  }),
                },
              },
            },
          },
        },
      },
      "/v1/categories/{id}": {
        put: {
          tags: ["Categories"],
          summary: "Update category",
          description: "Update an existing category",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Category ID", example: "01HXYZ123ABC" }),
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
                "application/json": {
                  schema: z.object({
                    category: CategoryDTOSchema,
                  }),
                },
              },
            },
            "404": {
              description: "Category not found",
              content: {
                "application/json": { schema: ErrorResponseSchema },
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
              id: z.string().meta({ description: "Category ID", example: "01HXYZ123ABC" }),
            }),
          },
          responses: {
            "200": {
              description: "Category deleted",
              content: {
                "application/json": {
                  schema: z.object({
                    message: z.string().meta({ example: "Category deleted" }),
                  }),
                },
              },
            },
            "400": {
              description: "Cannot delete category",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      // ========================================================================
      // Transaction endpoints (protected - /v1/transactions)
      // ========================================================================
      "/v1/transactions": {
        get: {
          tags: ["Transactions"],
          summary: "List transactions",
          description: "Get transactions for the authenticated user",
          requestParams: {
            query: z.object({
              start: z.string().optional().meta({ description: "Start date (ISO 8601)", example: "2024-01-01" }),
              end: z.string().optional().meta({ description: "End date (ISO 8601)", example: "2024-12-31" }),
              days: z.string().optional().meta({ description: "Number of days to look back", example: "30" }),
              limit: z.string().optional().meta({ description: "Max results to return", example: "50" }),
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
                "application/json": {
                  schema: z.object({
                    transaction: TransactionDTOSchema,
                  }),
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/v1/transactions/bulk-import": {
        post: {
          tags: ["Transactions"],
          summary: "Bulk import transactions",
          description: "Import multiple transactions at once",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: z.object({
                  transactions: z.array(CreateTransactionInputSchema),
                }),
              },
            },
          },
          responses: {
            "201": {
              description: "All transactions imported",
              content: {
                "application/json": {
                  schema: z.object({
                    imported: z.number().int().meta({ description: "Number imported", example: 10 }),
                    failed: z.number().int().meta({ description: "Number failed", example: 0 }),
                    total: z.number().int().meta({ description: "Total processed", example: 10 }),
                    success: z.array(TransactionDTOSchema),
                    errors: z.array(z.object({
                      index: z.number().int(),
                      error: z.string(),
                      data: z.unknown(),
                    })),
                  }),
                },
              },
            },
            "207": {
              description: "Partial success (some failed)",
              content: {
                "application/json": {
                  schema: z.object({
                    imported: z.number().int(),
                    failed: z.number().int(),
                    total: z.number().int(),
                    success: z.array(TransactionDTOSchema),
                    errors: z.array(z.object({
                      index: z.number().int(),
                      error: z.string(),
                      data: z.unknown(),
                    })),
                  }),
                },
              },
            },
          },
        },
      },
      "/v1/transactions/{id}": {
        patch: {
          tags: ["Transactions"],
          summary: "Update transaction",
          description: "Update an existing transaction (at least one field required)",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID", example: "01HXYZ123ABC" }),
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
                "application/json": {
                  schema: z.object({
                    transaction: TransactionDTOSchema,
                  }),
                },
              },
            },
            "404": {
              description: "Transaction not found",
              content: {
                "application/json": { schema: ErrorResponseSchema },
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
              id: z.string().meta({ description: "Transaction ID", example: "01HXYZ123ABC" }),
            }),
          },
          responses: {
            "204": {
              description: "Transaction deleted (no content)",
            },
            "404": {
              description: "Transaction not found",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/v1/transactions/{id}/categorize": {
        post: {
          tags: ["Transactions", "AI"],
          summary: "Auto-categorize transaction",
          description: "Use AI to suggest a category for a transaction",
          requestParams: {
            path: z.object({
              id: z.string().meta({ description: "Transaction ID", example: "01HXYZ123ABC" }),
            }),
          },
          responses: {
            "200": {
              description: "Categorization result",
              content: {
                "application/json": { schema: CategorizationResultSchema },
              },
            },
            "503": {
              description: "Auto-categorization not available",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      "/v1/transactions/parse-invoice": {
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
                "application/json": {
                  schema: z.object({
                    invoice: ParsedInvoiceSchema,
                  }),
                },
              },
            },
            "400": {
              description: "Could not parse invoice or missing image",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
            "503": {
              description: "Invoice parsing not available",
              content: {
                "application/json": { schema: ErrorResponseSchema },
              },
            },
          },
        },
      },
      // ========================================================================
      // Health endpoint (public)
      // ========================================================================
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
                    ok: z.literal(true),
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

  // Write YAML using proper library
  const yamlPath = path.join(distDir, "openapi.yaml");
  fs.writeFileSync(yamlPath, YAML.stringify(document, { indent: 2, lineWidth: 0 }));
  console.log(`✅ Generated OpenAPI YAML: ${yamlPath}`);

  // Write TypeScript export for runtime use
  const tsPath = path.join(__dirname, "openapi-spec.ts");
  const tsContent = `// AUTO-GENERATED - DO NOT EDIT
// Run \`pnpm run openapi:generate\` to regenerate

export const openApiSpec = ${JSON.stringify(document, null, 2)} as const;

export type OpenApiSpec = typeof openApiSpec;
`;
  fs.writeFileSync(tsPath, tsContent);
  console.log(`✅ Generated OpenAPI TypeScript: ${tsPath}`);

  // Print stats
  const schemaCount = Object.keys(document.components?.schemas ?? {}).length;
  const pathCount = Object.keys(document.paths ?? {}).length;
  console.log(`\n📊 Generated ${pathCount} paths and ${schemaCount} component schemas`);
}

// Run generator
generateOpenAPISpec();