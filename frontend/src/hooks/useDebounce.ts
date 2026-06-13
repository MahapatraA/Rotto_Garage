import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates
 * after `delayMs` milliseconds of silence.
 * Written from scratch — no external libraries.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    // Cancel the timer if value changes before delayMs elapses
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}