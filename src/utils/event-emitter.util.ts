import type { Emitter } from '../types/emitter.type';

/**
 * 简单的事件触发器实现
 */
export class EventEmitter implements Emitter {
   private listeners = new Map<string | symbol, Set<Function>>();

   on<T extends (...args: any[]) => void>(event: string | symbol, listener: T) {
      if (!this.listeners.has(event)) {
         this.listeners.set(event, new Set());
      }
      this.listeners.get(event)!.add(listener);
   }

   off(event: string | symbol, listener: Function) {
      if (this.listeners.has(event)) {
         this.listeners.get(event)!.delete(listener);
      }
   }

   emit<T extends (...args: any[]) => void>(
      event: string | symbol,
      ...args: Parameters<T>
   ) {
      if (this.listeners.has(event)) {
         this.listeners.get(event)!.forEach((listener) => listener(...args));
      }
   }
}
