<template>
   <div
      class="w-fit h-fit absolute group z-10 select-none"
      :class="{ '**:data-operation:opacity-100': item.drag }">
      <!-- 操作按钮：移动 -->
      <div
         data-operation
         @mousedown="(e) => $emit('move', e, item)"
         class="absolute bg-white left-1/2 -top-4 size-6 border-[1px] border-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 items-center justify-center flex z-10 text-xs hover:bg-gray-200 transition-all hover:cursor-move hover:scale-110 opacity-0 group-hover:opacity-100">
         <MoveIn />
      </div>
      <!-- 操作按钮：删除 -->
      <div
         data-operation
         @click="() => $emit('delete', item)"
         class="absolute bg-white right-1/2 -top-4 mr-2 size-6 border-[1px] text-red-600 border-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 items-center justify-center flex z-10 text-xs hover:bg-gray-200 transition-all hover:cursor-pointer hover:scale-110 opacity-0 group-hover:opacity-100">
         <Delete />
      </div>
      <!-- 流程项组件 -->
      <div class="transition-transform">
         <Component
            :is="flowComponents[item.type]"
            :id="item.id"
            :position="item.position"
            ref="flow-item" />
      </div>
   </div>
</template>

<script setup lang="ts">
import { MoveIn, Delete } from '@icon-park/vue-next';
import type { Component } from 'vue';
import type { FlowItem } from '../types/flow-item.type';

defineProps<{
   item: FlowItem;
   flowComponents: Record<string, Component>;
}>();

defineEmits<{
   move: [MouseEvent, FlowItem];
   delete: [FlowItem];
}>();
</script>
