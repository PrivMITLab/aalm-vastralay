"use client";

import { useState, useCallback, useRef } from "react";

export interface FormLockResult {
  /** True while an asynchronous operation is in flight. */
  isLocked: boolean;
  /**
   * Executes an async operation with strict re-entry prevention.
   * If invoked while a prior operation is still in flight, execution is silently skipped.
   */
  run: <T>(fn: () => Promise<T>) => Promise<T | undefined>;
}

/**
 * Re-entry guard hook designed to protect client buttons and forms
 * against rapid double-clicks, duplicate API requests, and race conditions.
 */
export function useFormLock(): FormLockResult {
  const [isLocked, setIsLocked] = useState(false);
  const lockRef = useRef(false);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (lockRef.current) {
      return undefined;
    }
    lockRef.current = true;
    setIsLocked(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setIsLocked(false);
    }
  }, []);

  return { isLocked, run };
}
