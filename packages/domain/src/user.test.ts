import { describe, it, expect } from 'vitest';
import { User, type UserProps } from './user';

function makeUser(overrides: Partial<UserProps> = {}): User {
  const base: UserProps = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    defaultCurrency: 'USD',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };
  return new User({ ...base, ...overrides });
}

describe('User', () => {
  describe('constructor validation', () => {
    describe('email validation', () => {
      it('should create user with valid email', () => {
        const user = makeUser({ email: 'john.doe@example.com' });
        expect(user.email).toBe('john.doe@example.com');
      });

      it('should accept email with subdomain', () => {
        const user = makeUser({ email: 'user@mail.example.com' });
        expect(user.email).toBe('user@mail.example.com');
      });

      it('should accept email with plus sign', () => {
        const user = makeUser({ email: 'user+tag@example.com' });
        expect(user.email).toBe('user+tag@example.com');
      });

      it('should accept email with dots in local part', () => {
        const user = makeUser({ email: 'first.last@example.com' });
        expect(user.email).toBe('first.last@example.com');
      });

      it('should accept email with numbers', () => {
        const user = makeUser({ email: 'user123@example456.com' });
        expect(user.email).toBe('user123@example456.com');
      });

      it('should accept email with hyphens in domain', () => {
        const user = makeUser({ email: 'user@my-domain.com' });
        expect(user.email).toBe('user@my-domain.com');
      });

      it('should accept email with multiple subdomains', () => {
        const user = makeUser({ email: 'user@mail.corp.example.com' });
        expect(user.email).toBe('user@mail.corp.example.com');
      });

      it('should accept various TLDs', () => {
        const tlds = ['com', 'org', 'net', 'edu', 'gov', 'io', 'co'];
        
        tlds.forEach(tld => {
          const email = `user@example.${tld}`;
          const user = makeUser({ email });
          expect(user.email).toBe(email);
        });
      });

      it('should accept single letter local part', () => {
        const user = makeUser({ email: 'a@example.com' });
        expect(user.email).toBe('a@example.com');
      });

      it('should accept underscores in email', () => {
        const user = makeUser({ email: 'user_name@example.com' });
        expect(user.email).toBe('user_name@example.com');
      });

      it('should reject email without @ symbol', () => {
        expect(() => makeUser({ email: 'userexample.com' }))
          .toThrow('Invalid email format');
      });

      it('should reject email without domain', () => {
        expect(() => makeUser({ email: 'user@' }))
          .toThrow('Invalid email format');
      });

      it('should reject email without local part', () => {
        expect(() => makeUser({ email: '@example.com' }))
          .toThrow('Invalid email format');
      });

      it('should reject email without TLD', () => {
        expect(() => makeUser({ email: 'user@example' }))
          .toThrow('Invalid email format');
      });

      it('should reject email with spaces', () => {
        expect(() => makeUser({ email: 'user name@example.com' }))
          .toThrow('Invalid email format');
        
        expect(() => makeUser({ email: 'user@exam ple.com' }))
          .toThrow('Invalid email format');
      });

      it('should reject email with multiple @ symbols', () => {
        expect(() => makeUser({ email: 'user@@example.com' }))
          .toThrow('Invalid email format');
        
        expect(() => makeUser({ email: 'user@domain@example.com' }))
          .toThrow('Invalid email format');
      });

      it('should reject empty email', () => {
        expect(() => makeUser({ email: '' }))
          .toThrow('Invalid email format');
      });

      it('should reject email with only @ symbol', () => {
        expect(() => makeUser({ email: '@' }))
          .toThrow('Invalid email format');
      });

      it('should accept email starting with dot (simple regex allows it)', () => {
        // The simple regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/ doesn't catch all edge cases
        const user = makeUser({ email: '.user@example.com' });
        expect(user.email).toBe('.user@example.com');
      });

      it('should accept email ending with dot before @ (simple regex allows it)', () => {
        const user = makeUser({ email: 'user.@example.com' });
        expect(user.email).toBe('user.@example.com');
      });

      it('should accept email with consecutive dots (simple regex allows it)', () => {
        const user = makeUser({ email: 'user..name@example.com' });
        expect(user.email).toBe('user..name@example.com');
      });

      it('should accept email with special characters in domain (simple regex allows it)', () => {
        const user = makeUser({ email: 'user@exam!ple.com' });
        expect(user.email).toBe('user@exam!ple.com');
      });
    });

    describe('name validation', () => {
      it('should create user with valid name', () => {
        const user = makeUser({ name: 'John Doe' });
        expect(user.name).toBe('John Doe');
      });

      it('should accept single character name', () => {
        const user = makeUser({ name: 'A' });
        expect(user.name).toBe('A');
      });

      it('should accept very long name', () => {
        const longName = 'A'.repeat(200);
        const user = makeUser({ name: longName });
        expect(user.name).toBe(longName);
      });

      it('should accept name with multiple words', () => {
        const user = makeUser({ name: 'John Michael Doe Smith' });
        expect(user.name).toBe('John Michael Doe Smith');
      });

      it('should accept name with special characters', () => {
        const user = makeUser({ name: "O'Brien" });
        expect(user.name).toBe("O'Brien");
      });

      it('should accept name with hyphens', () => {
        const user = makeUser({ name: 'Mary-Jane' });
        expect(user.name).toBe('Mary-Jane');
      });

      it('should accept name with numbers', () => {
        const user = makeUser({ name: 'User123' });
        expect(user.name).toBe('User123');
      });

      it('should accept name with Unicode characters', () => {
        const user = makeUser({ name: 'José García' });
        expect(user.name).toBe('José García');
      });

      it('should accept name with emoji', () => {
        const user = makeUser({ name: 'Happy User 😊' });
        expect(user.name).toBe('Happy User 😊');
      });

      it('should accept name with Chinese characters', () => {
        const user = makeUser({ name: '李明' });
        expect(user.name).toBe('李明');
      });

      it('should accept name with Japanese characters', () => {
        const user = makeUser({ name: '田中太郎' });
        expect(user.name).toBe('田中太郎');
      });

      it('should accept name with Arabic characters', () => {
        const user = makeUser({ name: 'محمد' });
        expect(user.name).toBe('محمد');
      });

      it('should reject empty name', () => {
        expect(() => makeUser({ name: '' }))
          .toThrow('Name cannot be empty');
      });

      it('should reject name with only spaces', () => {
        expect(() => makeUser({ name: '   ' }))
          .toThrow('Name cannot be empty');
      });

      it('should reject name with only tabs', () => {
        expect(() => makeUser({ name: '\t\t' }))
          .toThrow('Name cannot be empty');
      });

      it('should reject name with only newlines', () => {
        expect(() => makeUser({ name: '\n\n' }))
          .toThrow('Name cannot be empty');
      });

      it('should reject name with mixed whitespace only', () => {
        expect(() => makeUser({ name: ' \t\n ' }))
          .toThrow('Name cannot be empty');
      });

      it('should accept name with leading/trailing spaces (they exist)', () => {
        // The validation only checks if trimmed name is empty
        // Names with leading/trailing spaces pass if they have content
        const user = makeUser({ name: '  John  ' });
        expect(user.name).toBe('  John  ');
      });
    });

    describe('currency validation', () => {
      it('should accept valid currency codes', () => {
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD'];
        
        currencies.forEach(currency => {
          const user = makeUser({ defaultCurrency: currency });
          expect(user.defaultCurrency).toBe(currency);
        });
      });

      it('should accept any string as currency (no validation)', () => {
        // The User class doesn't validate currency, just stores it
        const user = makeUser({ defaultCurrency: 'XYZ' });
        expect(user.defaultCurrency).toBe('XYZ');
      });

      it('should accept empty currency string', () => {
        const user = makeUser({ defaultCurrency: '' });
        expect(user.defaultCurrency).toBe('');
      });
    });
  });

  describe('getters', () => {
    it('should return id', () => {
      const user = makeUser({ id: 'test-user-123' });
      expect(user.id).toBe('test-user-123');
    });

    it('should return email', () => {
      const user = makeUser({ email: 'test@example.com' });
      expect(user.email).toBe('test@example.com');
    });

    it('should return name', () => {
      const user = makeUser({ name: 'Jane Doe' });
      expect(user.name).toBe('Jane Doe');
    });

    it('should return defaultCurrency', () => {
      const user = makeUser({ defaultCurrency: 'EUR' });
      expect(user.defaultCurrency).toBe('EUR');
    });

    it('should return all properties correctly', () => {
      const user = makeUser({
        id: 'user-abc',
        email: 'john@example.com',
        name: 'John Smith',
        defaultCurrency: 'GBP',
      });

      expect(user.id).toBe('user-abc');
      expect(user.email).toBe('john@example.com');
      expect(user.name).toBe('John Smith');
      expect(user.defaultCurrency).toBe('GBP');
    });
  });

  describe('immutability', () => {
    it('should have readonly props', () => {
      const user = makeUser({ name: 'Original Name' });
      expect(user.props.name).toBe('Original Name');
      // TypeScript enforces readonly at compile time
      // Verify all expected properties exist
      expect(user.props.id).toBeDefined();
      expect(user.props.email).toBeDefined();
      expect(user.props.name).toBeDefined();
      expect(user.props.defaultCurrency).toBeDefined();
      expect(user.props.createdAt).toBeDefined();
      expect(user.props.updatedAt).toBeDefined();
    });
  });

  describe('timestamps', () => {
    it('should preserve createdAt timestamp', () => {
      const createdAt = new Date('2024-01-15T10:00:00Z');
      const user = makeUser({ createdAt });
      expect(user.props.createdAt).toEqual(createdAt);
    });

    it('should preserve updatedAt timestamp', () => {
      const updatedAt = new Date('2024-06-20T15:30:00Z');
      const user = makeUser({ updatedAt });
      expect(user.props.updatedAt).toEqual(updatedAt);
    });

    it('should handle same timestamp for created and updated', () => {
      const timestamp = new Date('2025-01-01T00:00:00Z');
      const user = makeUser({
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      expect(user.props.createdAt).toEqual(timestamp);
      expect(user.props.updatedAt).toEqual(timestamp);
    });

    it('should handle different timestamps', () => {
      const created = new Date('2024-01-01');
      const updated = new Date('2025-01-01');
      const user = makeUser({
        createdAt: created,
        updatedAt: updated,
      });

      expect(user.props.createdAt).toEqual(created);
      expect(user.props.updatedAt).toEqual(updated);
      expect(user.props.updatedAt.getTime()).toBeGreaterThan(
        user.props.createdAt.getTime()
      );
    });
  });

  describe('edge cases', () => {
    it('should handle various id formats', () => {
      const idFormats = [
        'user-123',
        'USER_456',
        'ulid-01ARZ3NDEKTSV4RRFFQ69G5FAV',
        'uuid-550e8400-e29b-41d4-a716-446655440000',
        '12345',
      ];

      idFormats.forEach(id => {
        const user = makeUser({ id });
        expect(user.id).toBe(id);
      });
    });

    it('should handle email case sensitivity', () => {
      // Email validation is case-insensitive per RFC, but we store as-is
      const user = makeUser({ email: 'User@Example.COM' });
      expect(user.email).toBe('User@Example.COM');
    });

    it('should handle minimum valid user data', () => {
      const user = makeUser({
        id: 'u',
        email: 'a@b.c',
        name: 'A',
        defaultCurrency: 'USD',
      });

      expect(user.id).toBe('u');
      expect(user.email).toBe('a@b.c');
      expect(user.name).toBe('A');
      expect(user.defaultCurrency).toBe('USD');
    });
  });

  describe('real-world scenarios', () => {
    it('should create user with common data', () => {
      const user = makeUser({
        id: 'user-abc123',
        email: 'john.doe@example.com',
        name: 'John Doe',
        defaultCurrency: 'USD',
      });

      expect(user.email).toBe('john.doe@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.defaultCurrency).toBe('USD');
    });

    it('should create international user', () => {
      const user = makeUser({
        email: 'yuki.tanaka@example.jp',
        name: '田中雪',
        defaultCurrency: 'JPY',
      });

      expect(user.email).toBe('yuki.tanaka@example.jp');
      expect(user.name).toBe('田中雪');
      expect(user.defaultCurrency).toBe('JPY');
    });

    it('should create user with corporate email', () => {
      const user = makeUser({
        email: 'john.doe@corp.example.com',
        name: 'John Doe',
        defaultCurrency: 'EUR',
      });

      expect(user.email).toBe('john.doe@corp.example.com');
    });

    it('should create user with email alias', () => {
      const user = makeUser({
        email: 'user+budgetwise@example.com',
        name: 'Test User',
        defaultCurrency: 'CAD',
      });

      expect(user.email).toBe('user+budgetwise@example.com');
    });
  });
});