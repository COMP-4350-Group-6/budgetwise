import type { TransactionsRepo, CategoriesRepo, CategorizationPort, ClockPort } from "@budget/ports";
import { Transaction } from "@budget/domain/transaction";

export function makeCategorizeTransaction(deps: {
  clock: ClockPort;
  txRepo: TransactionsRepo;
  categoriesRepo: CategoriesRepo;
  categorization: CategorizationPort;
}) {
  return async (input: {
    transactionId: string;
    userId: string;
  }): Promise<{ categoryId: string; reasoning: string } | null> => {
    console.log('[CategorizeTransaction] Starting categorization for:', input.transactionId);
    
    // Get the transaction
    const tx = await deps.txRepo.getById(input.transactionId);
    console.log('[CategorizeTransaction] Transaction found:', !!tx);
    
    if (!tx || tx.props.userId !== input.userId) {
      console.log('[CategorizeTransaction] Transaction not found or wrong user');
      throw new Error("Transaction not found");
    }

    // Skip if already categorized
    if (tx.props.categoryId) {
      console.log('[CategorizeTransaction] Transaction already categorized:', tx.props.categoryId);
      return null;
    }

    // Skip if no note to categorize
    if (!tx.props.note) {
      console.log('[CategorizeTransaction] No note to categorize');
      return null;
    }
    
    console.log('[CategorizeTransaction] Transaction note:', tx.props.note);

    // Get user's active categories
    const userCategories = await deps.categoriesRepo.listActiveByUser(input.userId);
    console.log('[CategorizeTransaction] Found categories:', userCategories.length);
    
    const categoryInfo = userCategories.map(cat => ({
      id: cat.props.id,
      name: cat.props.name,
      icon: cat.props.icon
    }));

    if (categoryInfo.length === 0) {
      console.log('[CategorizeTransaction] No categories available');
      return null;
    }

    console.log('[CategorizeTransaction] Calling OpenRouter with categories:', categoryInfo.map(c => c.name).join(', '));

    // Categorize
    const result = await deps.categorization.categorizeTransaction(
      tx.props.note,
      tx.props.amountCents,
      categoryInfo
    );

    console.log('[CategorizeTransaction] OpenRouter result:', result);

    if (!result) {
      console.log('[CategorizeTransaction] No categorization result');
      return null;
    }

    // Update transaction with category
    const updatedTx = new Transaction({
      ...tx.props,
      categoryId: result.categoryId,
      updatedAt: deps.clock.now()
    });

    await deps.txRepo.update(updatedTx);

    console.log(`Auto-categorized transaction ${input.transactionId}: ${tx.props.note} -> ${result.categoryId} (${result.reasoning})`);

    return result;
  };
}