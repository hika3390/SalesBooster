'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseSalesSSEOptions {
  onUpdate: () => void;
}

const INITIAL_RETRY_MS = 3000;
const MAX_RETRY_MS = 30000;

export function useSalesSSE({ onUpdate }: UseSalesSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryMsRef = useRef(INITIAL_RETRY_MS);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource('/api/sales/stream');
    eventSourceRef.current = es;

    es.onopen = () => {
      // 接続成功時にリトライ間隔をリセット
      retryMsRef.current = INITIAL_RETRY_MS;
    };

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sales-updated') {
          onUpdateRef.current();
        }
      } catch {
        // パース失敗は無視
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      const delay = retryMsRef.current;
      retryMsRef.current = Math.min(retryMsRef.current * 2, MAX_RETRY_MS);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);
}
