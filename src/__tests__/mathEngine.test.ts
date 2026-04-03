import { describe, it, expect } from 'vitest';
import { math, formatResult } from '../lib/mathEngine';

describe('mathEngine', () => {
  it('evaluates simple expressions correctly', () => {
    const result = math.evaluate('2 + 3 * 4');
    // Result object is a BigNumber, so we can cast it to string or use format
    expect(result.toString()).toBe('14');
  });

  it('handles standard floating-point issues gracefully (BigNumbers)', () => {
    // Standard JS: 0.1 + 0.2 = 0.30000000000000004
    // BigNumber should resolve to exactly 0.3
    const result = math.evaluate('0.1 + 0.2');
    expect(result.toString()).toBe('0.3');
  });

  it('formats results to a specified precision', () => {
    // 1 / 3 is 0.3333333333333333333333...
    const result = math.evaluate('1 / 3');
    // By default formatResult uses a precision of 14 for display bounds
    expect(formatResult(result)).toBe('0.33333333333333');
  });

  it('can evaluate with variable definitions', () => {
    const scope = { a: 5, b: 10 };
    const result = math.evaluate('a * b', scope);
    expect(result.toString()).toBe('50');
  });
});
