import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { useCalculator } from '../hooks/useCalculator';

// Polyfill for crypto.randomUUID in jsdom
beforeAll(() => {
  if (typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = () => Math.random().toString() as any;
  }
});

describe('useCalculator hook', () => {
  it('initializes with empty history and variables', () => {
    const { result } = renderHook(() => useCalculator());
    expect(result.current.history).toEqual([]);
    expect(result.current.variables).toEqual({});
  });

  it('evaluates basic expressions and updates history', () => {
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      result.current.evaluate('10 + 20');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].expression).toBe('10 + 20');
    expect(result.current.history[0].result).toBe('30');
    expect(result.current.history[0].isError).toBe(false);
  });

  it('handles variable assignment', () => {
    const { result } = renderHook(() => useCalculator());
    
    // Assign a variable
    act(() => {
      result.current.evaluate('a = 5');
    });

    // History check
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].result).toBe('5');
    
    // Variable state check
    expect(result.current.variables).toHaveProperty('a');

    // Use the variable
    act(() => {
      result.current.evaluate('a * 2');
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[1].result).toBe('10');
  });

  it('handles evaluation errors gracefully', () => {
    const { result } = renderHook(() => useCalculator());
    
    act(() => {
      // Invalid math expression
      result.current.evaluate('4 + * 5');
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].isError).toBe(true);
  });
});
