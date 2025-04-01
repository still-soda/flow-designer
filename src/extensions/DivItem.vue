<template>
   <BasicItem type="div" :endpoint-props :id :position>
      <template #header>
         <Division />
         <h1 class="font-semibold text-sm">除法运算</h1>
      </template>
   </BasicItem>
</template>

<script setup lang="ts">
import type { EndpointProps } from '../types/endpoint.type';
import type { Point } from '../utils/point.util';
import BasicItem from '../components/BasicItem/index.vue';
import { Division } from '@icon-park/vue-next';

const endpointProps: EndpointProps[] = [
   {
      position: 'left',
      label: '输入1',
      theme: 'primary',
      maxConnections: 1,
      type: 'input',
      value: '',
   },
   {
      position: 'left',
      label: '输入2',
      theme: 'primary',
      maxConnections: 1,
      type: 'input',
      value: '',
   },
   {
      position: 'right',
      label: '输出',
      theme: 'success',
      type: 'output',
      value: '',
      computeValue: (endpoints) => {
         const input1 = endpoints.find(
            (endpoint) => endpoint.label === '输入1'
         )?.value;
         const input2 = endpoints.find(
            (endpoint) => endpoint.label === '输入2'
         )?.value;
         return Number(input2) === 0 ? 0 : Number(input1) / Number(input2);
      },
   },
];

defineProps<{ id: string; position: Point }>();
</script>
