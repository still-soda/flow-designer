<template>
   <div
      :data-endpoint="id"
      class="size-2 rounded-full absolute top-[calc(50%-0.25rem)] ring-[1px] ring-offset-1 transition-all hover:size-3 hover:cursor-pointer"
      @mousedown="handleDrag"
      @mouseup="handleDrop"
      ref="endpoint"
      :class="{
         // Position
         '-left-1 hover:-translate-y-0.5 hover:-translate-x-0.5':
            position === 'left',
         '-right-1 hover:-translate-y-0.5 hover:translate-x-0.5':
            position === 'right',
         // Theme
         'bg-gray-500 ring-gray-400 hover:bg-black':
            !theme || theme === 'default',
         'bg-blue-500 ring-blue-400 hover:bg-blue-600': theme === 'primary',
         'bg-green-500 ring-green-400 hover:bg-green-600': theme === 'success',
         'bg-orange-500 ring-orange-400 hover:bg-orange-600':
            theme === 'warning',
         'bg-red-500 ring-red-400 hover:bg-red-600': theme === 'danger',
      }"></div>
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, useTemplateRef } from 'vue';
import {
   EndpointEvent,
   REGISTER_ENDPOINT,
   UNREGISTER_ENDPOINT,
   type EmitEndpointEvent,
} from '../../events/endpoint.event';
import type {
   Endpoint,
   RegisterEndpoint,
   UnregisterEndpoint,
} from '../../types/endpoint.type';
import { useEmitter } from '../../hooks/useEmitter';

const props = defineProps<{
   position: 'left' | 'right';
   type: 'output' | 'input';
   id: string;
   maxConnections?: number;
   computeValue?: (endpoints: Endpoint[]) => any;
   label?: string;
   theme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}>();

// 数据
const endpoint = useTemplateRef<HTMLDivElement>('endpoint');

// 注册端点
onMounted(() => {
   if (!endpoint.value) {
      throw new Error('Missing endpoint element');
   }
   const registerEndpoint = inject<RegisterEndpoint>(REGISTER_ENDPOINT);
   registerEndpoint?.({
      type: props.type,
      position: props.position,
      computeValue: props.computeValue,
      maxConnections: props.maxConnections,
      label: props.label ?? '',
      theme: props.theme ?? 'default',
      el: endpoint.value,
      id: props.id,
      value: '',
   });
});

// 注销端点
onUnmounted(() => {
   const unregisterEndpoint = inject<UnregisterEndpoint>(UNREGISTER_ENDPOINT);
   unregisterEndpoint?.(props.id);
});

// 注入事件总线
const emitter = useEmitter();

// 处理开始拖拽事件
function handleDrag() {
   if (!endpoint.value || props.type !== 'output') return;

   emitter.emit<EmitEndpointEvent>(EndpointEvent.DRAG, {
      id: props.id,
      type: props.type,
      el: endpoint.value,
      maxConnections: props.maxConnections,
   });
}

// 处理放置事件
function handleDrop() {
   if (!endpoint.value) return;

   emitter.emit<EmitEndpointEvent>(EndpointEvent.DROP, {
      id: props.id,
      type: props.type,
      el: endpoint.value,
      maxConnections: props.maxConnections,
   });
}
</script>
