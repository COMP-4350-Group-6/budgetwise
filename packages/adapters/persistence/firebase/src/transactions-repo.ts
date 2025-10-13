import { Transaction } from "@budget/domain/transaction";
import type { TransactionsRepo } from "@budget/ports";

// TODO: wire Firestore SDK here; stubbed for scaffold
export function makeFirebaseTransactionsRepo(): TransactionsRepo {
  throw new Error("Implement Firestore repo (use emulator in dev)");
}
