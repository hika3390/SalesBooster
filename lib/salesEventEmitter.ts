import { EventEmitter } from 'events';

const globalForEmitter = globalThis as unknown as {
  salesEventEmitter: EventEmitter | undefined;
};

export const salesEventEmitter =
  globalForEmitter.salesEventEmitter ?? new EventEmitter();

globalForEmitter.salesEventEmitter = salesEventEmitter;

salesEventEmitter.setMaxListeners(100);
