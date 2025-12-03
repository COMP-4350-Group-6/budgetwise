import { makeSystemClock, makeUlid, makeUuid } from "../../../adapters/system/src";
import {
  makeInMemTransactionsRepo,
  makeInMemCategoriesRepo,
  makeInMemBudgetsRepo
} from "@budget/adapters-persistence-local";
import {
  makeSupabaseBudgetsRepo,
  makeSupabaseCategoriesRepo,
  makeSupabaseTransactionsRepo,
  makeSupabaseServiceClient,
  SupabaseLLMCallsRepository,
} from "@budget/adapters-persistence-supabase";
import { makeSupabaseTokenVerifier, makeSupabaseAuthProvider } from "@budget/adapters-auth-supabase";
import { OpenRouterCategorization, OpenRouterInvoiceParser } from "@budget/adapters-openrouter";
import { LLMTracker } from "@budget/ports";
import {
  makeCreateCategory,
  makeListCategories,
  makeUpdateCategory,
  makeDeleteCategory,
  makeSeedDefaultCategories,
  makeGetCategory,
  makeCreateBudget,
  makeListBudgets,
  makeUpdateBudget,
  makeDeleteBudget,
  makeGetBudgetStatus,
  makeGetBudgetDashboard,
  makeAddTransaction,
  makeUpdateTransaction,
  makeDeleteTransaction,
  makeCategorizeTransaction,
  makeParseInvoice,
  makeListTransactions,
  makeGetTransaction,
  makeBulkImportTransactions,
} from "@budget/usecases";

interface Env {
  OPENROUTER_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  COOKIE_DOMAIN?: string; // e.g., ".budgetwise.ca"
}

export function makeContainer(env?: Env) {
  const clock = makeSystemClock();
  let id = makeUlid();
  
  let categoriesRepo = makeInMemCategoriesRepo();
  let budgetsRepo = makeInMemBudgetsRepo();
  let txRepo = makeInMemTransactionsRepo();
  let llmCallsRepo: SupabaseLLMCallsRepository | undefined;
  let llmTracker: LLMTracker | undefined;
  let tokenVerifier;
  let authProvider;

  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseServiceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = env?.SUPABASE_ANON_KEY;
  const cookieDomain = env?.COOKIE_DOMAIN;

  if (supabaseUrl && supabaseServiceRoleKey) {
    console.log(`[Container] Using Supabase at ${supabaseUrl}`);
    
    const supabaseClient = makeSupabaseServiceClient({
      supabaseUrl,
      serviceRoleKey: supabaseServiceRoleKey,
    });

    categoriesRepo = makeSupabaseCategoriesRepo({ client: supabaseClient });
    budgetsRepo = makeSupabaseBudgetsRepo({ client: supabaseClient });
    txRepo = makeSupabaseTransactionsRepo({ client: supabaseClient });
    id = makeUuid();
    llmCallsRepo = new SupabaseLLMCallsRepository(supabaseClient);
    llmTracker = new LLMTracker(llmCallsRepo, id);
    
    // Create token verifier adapter (same pattern as other adapters)
    tokenVerifier = makeSupabaseTokenVerifier({ supabaseUrl });
    
    // Create auth provider for login/signup (uses anon key for client-side auth)
    if (supabaseAnonKey) {
      authProvider = makeSupabaseAuthProvider({
        supabaseUrl,
        supabaseAnonKey,
      });
    }
  } else {
    console.log('[Container] Using in-memory repositories (no Supabase configured)');
  }
  
  // Optional AI services (only if API key is provided)
  // Pass the LLM tracker if available for automatic call tracking
  const categorization = env?.OPENROUTER_API_KEY
    ? new OpenRouterCategorization(env.OPENROUTER_API_KEY, { tracker: llmTracker })
    : undefined;
  
  const invoiceParser = env?.OPENROUTER_API_KEY
    ? new OpenRouterInvoiceParser(env.OPENROUTER_API_KEY, { tracker: llmTracker })
    : undefined;
  
  return {
    usecases: {
      // Category use cases
      createCategory: makeCreateCategory({ categoriesRepo, clock, id }),
      listCategories: makeListCategories({ categoriesRepo }),
      updateCategory: makeUpdateCategory({ categoriesRepo, clock }),
      deleteCategory: makeDeleteCategory({ categoriesRepo, budgetsRepo }),
      seedDefaultCategories: makeSeedDefaultCategories({ categoriesRepo, clock, id }),
      getCategory: makeGetCategory({ categoriesRepo }),
      
      // Budget use cases
      createBudget: makeCreateBudget({ budgetsRepo, clock, id }),
      listBudgets: makeListBudgets({ budgetsRepo }),
      updateBudget: makeUpdateBudget({ budgetsRepo, clock }),
      deleteBudget: makeDeleteBudget({ budgetsRepo }),
      getBudgetStatus: makeGetBudgetStatus({ budgetsRepo, transactionsRepo: txRepo, clock }),
      getBudgetDashboard: makeGetBudgetDashboard({
        categoriesRepo,
        budgetsRepo,
        transactionsRepo: txRepo,
        clock
      }),
      
      // Transaction use cases
      addTransaction: makeAddTransaction({ clock, id, txRepo }),
      updateTransaction: makeUpdateTransaction({ clock, txRepo }),
      deleteTransaction: makeDeleteTransaction({ txRepo }),
      listTransactions: makeListTransactions({ txRepo }),
      getTransaction: makeGetTransaction({ txRepo }),
      bulkImportTransactions: makeBulkImportTransactions({ txRepo, clock, id }),
      categorizeTransaction: categorization
        ? makeCategorizeTransaction({
            clock,
            txRepo,
            categoriesRepo,
            categorization
          })
        : undefined,
      parseInvoice: invoiceParser
        ? makeParseInvoice({
            categoriesRepo,
            invoiceParser
          })
        : undefined,
    },
    // Auth infrastructure (for middleware)
    tokenVerifier,
    // Auth provider for login/signup routes
    authProvider,
    // Cookie domain for cross-subdomain sharing
    cookieDomain,
    // Reset helper for tests/development: re-initialize in-memory repos and trackers
    reset: () => {
      // If using supabase we don't attempt to reset remote state here.
      // For in-memory repos, call their `clear()` helpers to reset state so
      // existing references (used by the returned usecases) remain valid.
      if (!supabaseUrl || !supabaseServiceRoleKey) {
        try {
          (categoriesRepo as any)?.clear?.();
        } catch {}
        try {
          (budgetsRepo as any)?.clear?.();
        } catch {}
        try {
          (txRepo as any)?.clear?.();
        } catch {}
        llmCallsRepo = undefined;
        llmTracker = undefined;
        id = makeUlid();
      }
    },
  };
}

/** Container type - use this in apps instead of importing port interfaces */
export type Container = ReturnType<typeof makeContainer>;
