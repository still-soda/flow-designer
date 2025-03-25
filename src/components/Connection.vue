<template>
   <svg
      class="absolute pointer-events-none w-full h-full"
      :class="{ 'z-10': color === hoverColor }">
      <path
         :d="curvePath"
         stroke="transparent"
         @mouseenter="color = hoverColor"
         @mouseleave="color = defaultColor"
         class="pointer-events-auto hover:cursor-pointer"
         fill="none"
         stroke-width="8"
         stroke-linecap="round" />
      <path
         :d="curvePath"
         :stroke="color"
         fill="none"
         stroke-width="2"
         class="transition-colors"
         stroke-linecap="round" />
      <path
         :d="arrowPath"
         :stroke="color"
         fill="none"
         stroke-width="2"
         class="transition-colors"
         stroke-linejoin="round"
         stroke-linecap="round" />
   </svg>
</template>

<script setup lang="ts">
import { computed, inject, onWatcherCleanup, ref, watchEffect } from 'vue';
import { Point } from '../utils/point.util';
import { EventEmitter } from '../utils/event-emitter.util';
import { GLOBAL_EMITTER } from '../events/global.event';
import type { Endpoint } from '../types/endpoint.type';

const { type, from, to, fromPosition, toPosition, ...props } = defineProps<{
   from: Endpoint;
   to?: Endpoint;
   type: 'forward' | 'backward' | 'both';
   fromPosition: Point;
   toPosition: Point;
   offset?: number;
   defaultColor?: string;
   hoverColor?: string;
}>();

// 数据
const offset = props.offset ?? 8;
const defaultColor = props.defaultColor ?? '#444444';
const hoverColor = props.hoverColor ?? 'skyblue';
const color = ref(defaultColor);

// 计算线条路径
const curvePath = computed(() => {
   const dir = Math.sign(toPosition.x - fromPosition.x);
   const dx = toPosition.x - fromPosition.x - dir * 5;
   const start = `${fromPosition.x + dir * offset} ${fromPosition.y}`;
   const p1 = `${fromPosition.x + dx / 1.6} ${fromPosition.y}`;
   const p2 = `${toPosition.x - dx / 1.6} ${toPosition.y}`;
   const end = `${toPosition.x - dir * (offset + 5)} ${toPosition.y}`;
   return `M ${start} C ${p1}, ${p2}, ${end}`;
});
const arrowPath = computed(() => {
   const dir = Math.sign(toPosition.x - fromPosition.x);
   const p1 = `${toPosition.x - (offset + 5) * dir} ${toPosition.y - 4}`;
   const p2 = `${toPosition.x - (offset + 5) * dir} ${toPosition.y + 4}`;
   const p3 = `${toPosition.x - (offset + 5) * dir} ${toPosition.y}`;
   const pto = `${toPosition.x - offset * dir} ${toPosition.y}`;
   return `M ${p3} L ${pto} M ${p1} L ${pto}  L ${p2}`;
});

// 注入事件总线
const emitter = inject<EventEmitter>(GLOBAL_EMITTER);
if (!emitter) {
   throw new Error('Missing global emitter');
}

// 连接双向绑定
const patch = (endpoint: Endpoint, value: any) =>
   emitter.emit(`patch:${endpoint.id}`, value);
const patchFrom = (value: any) => {
   if (type === 'backward' || type === 'both') {
      patch(from, value);
   }
};
const patchTo = (value: any) => {
   if (to && (type === 'forward' || type === 'both')) {
      patch(to!, value);
   }
};

watchEffect(() => {
   const fromId = from.id;
   const toId = to?.id;

   emitter.on(`update:${fromId}`, patchTo);
   toId && emitter.on(`update:${toId}`, patchFrom);

   (type === 'forward' || type === 'both') && patchTo(from.value);
   (type === 'backward' || type === 'both') && patchFrom(to?.value);

   onWatcherCleanup(() => {
      emitter.off(`update:${fromId}`, patchTo);
      toId && emitter.off(`update:${toId}`, patchFrom);
   });
});
</script>
