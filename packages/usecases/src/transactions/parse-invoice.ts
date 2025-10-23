import type { CategoriesRepo, InvoiceParserPort, ParsedInvoice } from "@budget/ports";

export function makeParseInvoice(deps: {
  categoriesRepo: CategoriesRepo;
  invoiceParser: InvoiceParserPort;
}) {
  return async (input: {
    userId: string;
    imageBase64: string;
  }): Promise<ParsedInvoice | null> => {
    console.log('[ParseInvoice] Starting invoice parsing for user:', input.userId);

    // Get user's active categories for suggestion
    const userCategories = await deps.categoriesRepo.listActiveByUser(input.userId);
    console.log('[ParseInvoice] Found categories:', userCategories.length);
    
    const categoryInfo = userCategories.map(cat => ({
      id: cat.props.id,
      name: cat.props.name,
      icon: cat.props.icon
    }));

    if (categoryInfo.length === 0) {
      console.log('[ParseInvoice] No categories available');
    }

    console.log('[ParseInvoice] Calling invoice parser...');

    // Parse the invoice image
    const result = await deps.invoiceParser.parseInvoice(
      input.imageBase64,
      categoryInfo
    );

    if (!result) {
      console.log('[ParseInvoice] Invoice parsing failed');
      return null;
    }

    console.log('[ParseInvoice] Invoice parsed successfully:', {
      merchant: result.merchant,
      total: result.total,
      confidence: result.confidence
    });

    return result;
  };
}