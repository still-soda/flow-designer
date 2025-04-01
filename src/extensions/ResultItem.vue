<template>
   <BasicItem type="result" :endpoint-props :id :position>
      <template #header>
         <DataDisplay />
         <h1 class="font-semibold text-sm">结果展示</h1>
      </template>
      <template #default="{ data }">
         <div class="relative">
            <div class="flex flex-col items-center justify-center my-2 gap-1">
               <div class="text-md">计算结果</div>
               <div class="text-sm text-gray-600">是</div>
               <div class="text-2xl text-green-600 font-semibold font-sans">
                  {{ data.value || 0 }}
               </div>
            </div>
            <EndPoint
               :id="data.id"
               :theme="data.theme"
               position="left"
               type="input"
               :max-connections="1" />
         </div>
      </template>
   </BasicItem>
</template>

<script setup lang="ts">
import type { EndpointProps } from '../types/endpoint.type';
import BasicItem from '../components/BasicItem/index.vue';
import { DataDisplay } from '@icon-park/vue-next';
import type { Point } from '../utils/point.util';
import EndPoint from '../components/BasicItem/EndPoint.vue';

const endpointProps: EndpointProps[] = [
   {
      position: 'left',
      label: '输入1',
      theme: 'primary',
      maxConnections: 1,
      type: 'input',
      value: '0',
   },
];

defineProps<{ id: string; position: Point }>();
</script>
