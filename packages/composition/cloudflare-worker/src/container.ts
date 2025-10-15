import { makeSystemClock, makeUlid } from "../../../adapters/system/src";
import {
  makeInMemTransactionsRepo,
  makeInMemCategoriesRepo,
  makeInMemBudgetsRepo
} from "@budget/adapters-persistence-local";
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
} from "@budget/usecases";

export function makeContainer(/* env: Env */) {
  const clock = makeSystemClock();
  const id = makeUlid();
  
  // Repositories - Swap to Firebase repo later:
  const categoriesRepo = makeInMemCategoriesRepo();
  const budgetsRepo = makeInMemBudgetsRepo();
  const txRepo = makeInMemTransactionsRepo();
  
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
    }
  };
}
