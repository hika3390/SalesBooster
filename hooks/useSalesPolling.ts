'use client';

import { useEffect, useRef } from 'react';

interface UseSalesPollingOptions {
  onUpdate: () => void;
  intervalMs?: number;
}

export function useSalesPolling({ onUpdate, intervalMs = 5000 }: UseSalesPollingOptions) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const id = setInterval(() => {
      onUpdateRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
}
