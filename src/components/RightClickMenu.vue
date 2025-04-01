<template>
   <div
      class="absolute z-50 top-0 left-0"
      :class="{ 'opacity-0 pointer-events-none': !showMenu }"
      :style="{
         transform: `translate(${menuPosition.x}px, ${menuPosition.y}px)`,
      }">
      <div
         class="absolute translate-y-1 p-1 rounded-md border-[1px] border-gray-200 bg-white flex flex-col gap-1 shadow-md">
         <div
            v-for="(option, idx) in options"
            :key="idx"
            data-option
            @click="$emit('menu-option-click', option)"
            class="text-sm text-nowrap hover:cursor-pointer hover:bg-gray-200 rounded-sm transition-all px-2 py-0.5 flex gap-2 items-center">
            <Component :is="option.icon" />
            {{ option.title }}
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { Option } from '../types/option.type';
import type { Point } from '../utils/point.util';

defineProps<{
   options: Option[];
   showMenu: boolean;
   menuPosition: Point;
}>();

defineEmits<{
   'menu-option-click': [Option];
}>();
</script>
