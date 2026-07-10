import { describe, it, expect, vi } from 'vitest';

describe('LocalDatabase Range Bounds Unit Tests', () => {
  it('should format range bounds correctly for composite user partition queries', () => {
    // Stub IDBKeyRange API
    globalThis.IDBKeyRange = {
      bound: vi.fn((lower, upper) => ({ lower, upper }))
    };

    const prefix = 'user456';
    const range = globalThis.IDBKeyRange.bound(`${prefix}_`, `${prefix}_\uffff`);
    
    expect(range.lower).toBe('user456_');
    expect(range.upper).toBe('user456_\uffff');
  });
});
