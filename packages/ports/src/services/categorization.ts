/**
 * Category information for categorization
 */
export interface CategoryInfo {
  id: string;
  name: string;
  icon?: string;
}

/**
 * Categorization result with reasoning
 */
export interface CategorizationResult {
  categoryId: string;
  reasoning: string;
}

/**
 * Port for auto-categorization service
 */
export interface CategorizationPort {
  /**
   * Categorize a transaction based on its description and amount
   * @param note Transaction description
   * @param amountCents Transaction amount in cents
   * @param categories Available categories for the user
   * @returns The categorization result with reasoning, or null if uncertain
   */
  categorizeTransaction(
    note: string | undefined,
    amountCents: number,
    categories: CategoryInfo[]
  ): Promise<CategorizationResult | null>;
}