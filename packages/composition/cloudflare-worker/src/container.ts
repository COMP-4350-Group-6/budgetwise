import { makeSystemClock, makeUlid } from "@budget/adapters-system";
import {
  makeInMemTransactionsRepo,
  makeInMemCategoriesRepo,
  makeInMemBudgetsRepo
} from "@budget/adapters-persistence-local";
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
}

export function makeContainer(env?: Env) {
  const clock = makeSystemClock();
  const id = makeUlid();
  
  // Repositories - Swap to Firebase repo later:
  const categoriesRepo = makeInMemCategoriesRepo();
  const budgetsRepo = makeInMemBudgetsRepo();
  const txRepo = makeInMemTransactionsRepo();
  
  // Reset function for testing
  const reset = () => {
    categoriesRepo.clear?.();
    budgetsRepo.clear?.();
    txRepo.clear?.();
  };
  
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
    },
    reset,
  };
}
