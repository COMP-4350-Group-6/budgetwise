import { makeSystemClock, makeUlid } from "../../../adapters/system/src";
import { makeInMemTransactionsRepo } from "@budget/adapters-persistence-local";
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
