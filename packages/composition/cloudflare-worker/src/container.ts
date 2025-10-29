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
} from "@budget/adapters-persistence-supabase";
import { OpenRouterCategorization, OpenRouterInvoiceParser } from "@budget/adapters-openrouter";
import {
  makeCreateCategory,
  makeListCategories,
  makeUpdateCategory,
  makeDeleteCategory,
  makeSeedDefaultCategories,
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
} from "@budget/usecases";

interface Env {
  OPENROUTER_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export function makeContainer(env?: Env) {
  const clock = makeSystemClock();
  let id = makeUlid();
  
  let categoriesRepo = makeInMemCategoriesRepo();
  let budgetsRepo = makeInMemBudgetsRepo();
  let txRepo = makeInMemTransactionsRepo();

  const supabaseUrl = env?.SUPABASE_URL;
  const supabaseServiceRoleKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseServiceRoleKey) {
    const supabaseClient = makeSupabaseServiceClient({
      supabaseUrl,
      serviceRoleKey: supabaseServiceRoleKey,
    });

    categoriesRepo = makeSupabaseCategoriesRepo({ client: supabaseClient });
    budgetsRepo = makeSupabaseBudgetsRepo({ client: supabaseClient });
    txRepo = makeSupabaseTransactionsRepo({ client: supabaseClient });
    id = makeUuid();
  }
  
  // Optional AI services (only if API key is provided)
  const categorization = env?.OPENROUTER_API_KEY
    ? new OpenRouterCategorization(env.OPENROUTER_API_KEY)
    : undefined;
  
  const invoiceParser = env?.OPENROUTER_API_KEY
    ? new OpenRouterInvoiceParser(env.OPENROUTER_API_KEY)
    : undefined;
  
  return {
    repos: {
      categoriesRepo,
      budgetsRepo,
      txRepo,
    },
    usecases: {
      // Category use cases
      createCategory: makeCreateCategory({ categoriesRepo, clock, id }),
      listCategories: makeListCategories({ categoriesRepo }),
      updateCategory: makeUpdateCategory({ categoriesRepo, clock }),
      deleteCategory: makeDeleteCategory({ categoriesRepo, budgetsRepo }),
      seedDefaultCategories: makeSeedDefaultCategories({ categoriesRepo, clock, id }),
      
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
    }
  };
}
