import { describe, it, expect, vi } from 'vitest';
import { makeUlid, makeUuid } from './id';

describe('makeUlid', () => {
  it('should generate a valid ULID string', () => {
    const idGenerator = makeUlid();
    const id = idGenerator.ulid();

    // ULIDs are 26 characters long
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBe(26);
    // ULIDs contain only base32 characters (0-9, A-Z excluding I, L, O, U)
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });

  it('should generate unique IDs', () => {
    const idGenerator = makeUlid();
    const ids = new Set<string>();
    
    // Generate multiple IDs
    for (let i = 0; i < 100; i++) {
      ids.add(idGenerator.ulid());
    }

    // All IDs should be unique
    expect(ids.size).toBe(100);
  });

  it('should generate monotonically increasing IDs when called in sequence', () => {
    const idGenerator = makeUlid();
    const id1 = idGenerator.ulid();
    const id2 = idGenerator.ulid();
    const id3 = idGenerator.ulid();

    // ULIDs are lexicographically sortable by timestamp
    expect(id2 > id1).toBe(true);
    expect(id3 > id2).toBe(true);
  });

  it('should conform to IdPort interface', () => {
    const idGenerator = makeUlid();
    
    expect(idGenerator).toHaveProperty('ulid');
    expect(typeof idGenerator.ulid).toBe('function');
  });
});

describe('makeUuid', () => {
  it('should generate a valid UUID v4 string', () => {
    const idGenerator = makeUuid();
    const id = idGenerator.ulid(); // Note: interface uses 'ulid' method name

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate unique UUIDs', () => {
    const idGenerator = makeUuid();
    const ids = new Set<string>();
    
    // Generate multiple UUIDs
    for (let i = 0; i < 100; i++) {
      ids.add(idGenerator.ulid());
    }

    // All UUIDs should be unique
    expect(ids.size).toBe(100);
  });

  it('should generate UUIDs with correct version (v4)', () => {
    const idGenerator = makeUuid();
    const id = idGenerator.ulid();

    // Check version bits (should be 4)
    const versionChar = id.charAt(14);
    expect(versionChar).toBe('4');
  });

  it('should generate UUIDs with correct variant bits', () => {
    const idGenerator = makeUuid();
    const id = idGenerator.ulid();

    // Check variant bits (should be 8, 9, a, or b)
    const variantChar = id.charAt(19);
    expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
  });

  it('should conform to IdPort interface', () => {
    const idGenerator = makeUuid();
    
    expect(idGenerator).toHaveProperty('ulid');
    expect(typeof idGenerator.ulid).toBe('function');
  });

  it('should use crypto.randomUUID when available', () => {
    // Mock crypto.randomUUID
    const mockUUID = '550e8400-e29b-41d4-a716-446655440000';
    const originalRandomUUID = crypto.randomUUID;
    
    // @ts-ignore - mocking for test
    crypto.randomUUID = vi.fn(() => mockUUID);

    const idGenerator = makeUuid();
    const id = idGenerator.ulid();

    expect(id).toBe(mockUUID);
    expect(crypto.randomUUID).toHaveBeenCalled();

    // Restore original
    // @ts-ignore
    crypto.randomUUID = originalRandomUUID;
  });
});
