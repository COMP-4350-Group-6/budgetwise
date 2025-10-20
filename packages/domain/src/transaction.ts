export interface TransactionProps {
  id: string;
  userId: string;
  // Allow unbudgeted transactions
  budgetId?: string;
  amountCents: number;
  categoryId?: string;
  note?: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
export class Transaction {
  constructor(public readonly props: TransactionProps) {
    if (!Number.isInteger(props.amountCents)) throw new Error("amountCents must be integer");
  }
}
