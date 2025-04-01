import { inject } from 'vue';
import type { Emitter } from '../types/emitter.type';
import { GLOBAL_EMITTER } from '../events/global.event';

export const useEmitter = () => {
   const emitter = inject<Emitter>(GLOBAL_EMITTER);
   if (!emitter) {
      throw new Error('Emitter not found');
   }
   return emitter;
};
