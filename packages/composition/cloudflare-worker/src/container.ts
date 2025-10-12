import { makeSystemClock, makeUlid } from "@budget/adapters-system";
import { makeInMemTransactionsRepo } from "@budget/adapters-persistence-inmem";
import { makeAddTransaction } from "@budget/usecases";

export function makeContainer(/* env: Env */) {
  const clock = makeSystemClock();
  const id = makeUlid();
  // Swap to Firebase repo later:
  const txRepo = makeInMemTransactionsRepo();
  return {
    usecases: {
      addTransaction: makeAddTransaction({ clock, id, txRepo })
    }
  };
}
