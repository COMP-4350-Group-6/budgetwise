export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  decimalPlaces: number;
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', decimalPlaces: 2 },
  EUR: { code: 'EUR', symbol: '€', decimalPlaces: 2 },
  GBP: { code: 'GBP', symbol: '£', decimalPlaces: 2 },
  JPY: { code: 'JPY', symbol: '¥', decimalPlaces: 0 },
  INR: { code: 'INR', symbol: '₹', decimalPlaces: 2 },
};

export class Money {
  constructor(
    public readonly cents: number,
    public readonly currency: Currency = 'USD'
  ) {
    if (!Number.isInteger(cents)) {
      throw new Error("Money expects integer cents");
    }
    if (!CURRENCY_CONFIGS[currency]) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
  }

  private get config(): CurrencyConfig {
    return CURRENCY_CONFIGS[this.currency];
  }

  private get scale(): number {
    return Math.pow(10, this.config.decimalPlaces);
  }

  // like cents or smallest currency unit
  static fromMinorDenomination(cents: number, currency: Currency = 'USD'): Money {
    return new Money(cents, currency);
  }

  static fromAmount(amount: number, currency: Currency = 'USD'): Money {
    const config = CURRENCY_CONFIGS[currency];
    const scale = Math.pow(10, config.decimalPlaces);
    const cents = Math.round(amount * scale);
    return new Money(cents, currency);
  }

  toAmount(): number {
    return this.cents / this.scale;
  }

  format(includeSymbol: boolean = true): string {
    const amount = this.toAmount();
    const formatted = amount.toFixed(this.config.decimalPlaces);
    return includeSymbol ? `${this.config.symbol}${formatted}` : formatted;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.cents + other.cents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.cents - other.cents, this.currency);
  }

 

  isPositive(): boolean {
    return this.cents > 0;
  }

  isNegative(): boolean {
    return this.cents < 0;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents > other.cents;
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.cents < other.cents;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} and ${other.currency}`
      );
    }
  }
}
