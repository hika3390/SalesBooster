import { salesEventEmitter } from '@/lib/salesEventEmitter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  let onSalesUpdated: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'));

      onSalesUpdated = () => {
        try {
          const data = JSON.stringify({
            type: 'sales-updated',
            timestamp: Date.now(),
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          if (onSalesUpdated) {
            salesEventEmitter.off('sales-updated', onSalesUpdated);
            onSalesUpdated = null;
          }
        }
      };

      salesEventEmitter.on('sales-updated', onSalesUpdated);
    },
    cancel() {
      if (onSalesUpdated) {
        salesEventEmitter.off('sales-updated', onSalesUpdated);
        onSalesUpdated = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
