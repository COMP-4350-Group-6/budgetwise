/**
 * Parsed invoice data from image
 */
export interface ParsedInvoice {
  merchant: string;
  date: string; // ISO date string
  total: number; // in cents
  tax?: number; // in cents
  subtotal?: number; // in cents
  invoiceNumber?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    price?: number; // in cents
  }>;
  paymentMethod?: string;
  suggestedCategory?: string;
  confidence: number; // 0-1, how confident the parser is
}

/**
 * Port for invoice parsing service
 */
export interface InvoiceParserPort {
  /**
   * Parse an invoice image and extract transaction data
   * @param imageBase64 Base64 encoded image data (with or without data URI prefix)
   * @param userCategories User's available categories for suggestion
   * @returns Parsed invoice data or null if parsing failed
   */
  parseInvoice(
    imageBase64: string,
    userCategories: Array<{ id: string; name: string; icon?: string }>
  ): Promise<ParsedInvoice | null>;
}