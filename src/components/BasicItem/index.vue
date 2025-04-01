<template>
   <div
      class="relative rounded-lg border-[1px] border-gray-400 w-52 flex flex-col bg-white text-black">
      <header
         class="p-4 py-2 border-b-[1px] rounded-t-lg border-gray-400 flex items-center gap-2">
         <slot name="header">
            <Robot />
            <h1 class="font-semibold text-sm">期望</h1>
         </slot>
      </header>
      <main class="pt-2 *:px-4">
         <slot
            name="default"
            v-for="(item, idx) in endpoints"
            :key="idx"
            :data="item"
            :idx="idx"
            :update="() => changeValue(item)">
            <div
               class="text-gray-500 text-xs py-2 relative flex items-center gap-2 w-full">
               <label class="text-nowrap w-10 text-end">{{ item.label }}</label>
               <div class="px-2 py-1 bg-gray-100 rounded-sm w-full">
                  <input
                     type="text"
                     :placeholder="item.label"
                     :disabled="item.type === 'output'"
                     :class="{
                        'hover:cursor-not-allowed': item.type === 'output',
                     }"
                     v-model="item.value"
                     class="outline-none w-full"
                     @input="() => changeValue(item)" />
               </div>
               <EndPoint
                  v-if="item.position !== 'none'"
                  :position="item.position"
                  :theme="item.theme"
                  :type="item.type"
                  :label="item.label"
                  :max-connections="item.maxConnections"
                  :compute-value="item.computeValue"
                  :key="idx"
                  :id="item.id" />
            </div>
         </slot>
      </main>
   </div>
</template>

<script setup lang="ts">
import { Robot } from '@icon-park/vue-next';
import EndPoint from './EndPoint.vue';
import { inject, onUnmounted, provide, ref, watch, watchEffect } from 'vue';
import type {
   RegisterEndpoint,
   Endpoint,
   EndpointProps,
} from '../../types/endpoint.type';
import { REGISTER_ENDPOINT } from '../../events/endpoint.event';
import type { RegisterFlowItem } from '../../types/flow-item.type';
import { REGISTER_FLOW_ITEM } from '../../events/flow-item.event';
import { Point } from '../../utils/point.util';
import { genId } from '../../utils/uuid.utils';
import { useEmitter } from '../../hooks/useEmitter';

// 属性
const props = defineProps<{
   position: Point;
   id: string;
   endpointProps: EndpointProps[];
   type: string;
}>();

// 数据
const endpoints = ref<Endpoint[]>(
   props.endpointProps.map((item) => {
      const id = genId();
      return { ...item, id };
   })
);

// 拦截端点注册事件
const registerEndpoint = inject<RegisterEndpoint>(REGISTER_ENDPOINT);
provide<RegisterEndpoint>(REGISTER_ENDPOINT, (endpoint) => {
   const idx = endpoints.value.findIndex((item) => item.id === endpoint.id);
   if (idx === -1) {
      endpoints.value.push(endpoint);
   } else {
      endpoints.value[idx] = endpoint;
   }
   registerEndpoint?.(endpoint);
});

// 注册流程项
const registerFlowItem = inject<RegisterFlowItem>(REGISTER_FLOW_ITEM);
watchEffect(() => {
   registerFlowItem?.({
      id: props.id,
      position: props.position,
      type: props.type,
      endpoints: Array.from(endpoints.value),
      drag: false,
   });
});

// 注入事件总线
const emitter = useEmitter();

// 更新输出
const updateOuputs = () => {
   const outputs = endpoints.value.filter((item) => item.type === 'output');
   outputs.forEach((item) => {
      if (!item.computeValue) {
         return;
      }

      const newValue = item.computeValue(endpoints.value);
      if (item.value === newValue) {
         return;
      }

      item.value = newValue;
      changeValue(item);
   });
};

// 主动更新值
const changeValue = (
   endpoint: EndpointProps & Partial<Pick<Endpoint, 'id'>>
) => {
   if (endpoint.type === 'input') {
      updateOuputs();
   }
   if (endpoint.id && endpoint.position !== 'none') {
      emitter.emit(`update:${endpoint.id}`, endpoint.value);
   }
};

// 获取差集
function getDiffSet(a: Endpoint[], b: Endpoint[]) {
   return a.filter((item) => !b.includes(item));
}

// 监听端点变化，更新事件监听
const patchMap = new Map<string, Function>();
watch(
   endpoints,
   (newList, oldList) => {
      oldList ??= [];
      // 为新增的端点添加事件监听
      const additions = getDiffSet(newList, oldList);
      additions.forEach((endpoint) => {
         const patchFn = (value: any) => {
            const idx = endpoints.value.findIndex(
               (item) => item.id === endpoint.id
            );
            if (idx === -1 || endpoints.value[idx].value === value) {
               return;
            }
            endpoints.value[idx].value = value;
            changeValue(endpoint);
         };

         emitter.on(`patch:${endpoint.id}`, patchFn);
         patchMap.set(endpoint.id, patchFn);
      });
      // 为移除的端点取消事件监听
      const removals = getDiffSet(oldList, newList);
      removals.forEach((endpoint) => {
         const patchFn = patchMap.get(endpoint.id);
         patchFn && emitter.off(`patch:${endpoint.id}`, patchFn);
      });
   },
   { immediate: true }
);

// 注销事件监听
onUnmounted(() => {
   patchMap.forEach((fn, key) => {
      emitter.off(`patch:${key}`, fn);
   });
});
</script>
