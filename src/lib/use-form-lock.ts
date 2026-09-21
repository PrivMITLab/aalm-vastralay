"use client";
import { useEffect, useRef, useState } from "react";

/** Returns an `onSubmit` guard and a `locked` flag for the submit button. */
export function useFormLock2() {
  const [locked, setLocked] = useState(false);
  const ref = useRef(false);
  useEffect(() => () => setLocked(false), []);
  const onSubmit = (event?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
    if (ref.current) {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      return false;
    }
    ref.current = true;
    setLocked(true);
    // Safety valve – if the action throws or never redirects, allow a retry after 30 s
    setTimeout(() => {
      ref.current = false;
      setLocked(false);
    }, 30_000);
    return true;
  };
  return { locked, onSubmit };
}
