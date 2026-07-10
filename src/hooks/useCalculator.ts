import { useState, useCallback } from 'react';
import { math, formatResult } from '../lib/mathEngine';

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  isError: boolean;
}

export function useCalculator() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [variables, setVariables] = useState<Record<string, unknown>>({});

  const evaluate = useCallback((expression: string) => {
    if (!expression.trim()) return;

    try {
      // Evaluate the expression with the current variables scope
      const node = math.parse(expression);
      const code = node.compile();
      
      const newScope = { ...variables };
      const rawResult = code.evaluate(newScope);
      
      const resultString = rawResult !== undefined 
        ? (typeof rawResult === 'function' ? 'function' : formatResult(rawResult))
        : '';
        
      setHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        expression,
        result: resultString,
        isError: false,
      }]);

      // If it was an assignment, the top-level keys in newScope will have updated
      // We update our React state to persist these
      setVariables(newScope);
      
    } catch (error) {
      setHistory(prev => [...prev, {
        id: crypto.randomUUID(),
        expression,
        result: error instanceof Error ? error.message : 'Error',
        isError: true,
      }]);
    }
  }, [variables]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const clearVariables = useCallback(() => {
    setVariables({});
  }, []);

  return {
    history,
    variables,
    evaluate,
    clearHistory,
    clearVariables
  };
}
