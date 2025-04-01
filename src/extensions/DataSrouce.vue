<template>
   <BasicItem type="source" :endpoint-props :id :position>
      <template #header>
         <Data />
         <h1 class="font-semibold text-sm">数据源</h1>
      </template>
   </BasicItem>
</template>

<script setup lang="ts">
import type { EndpointProps } from '../types/endpoint.type';
import BasicItem from '../components/BasicItem/index.vue';
import { Data } from '@icon-park/vue-next';
import type { Point } from '../utils/point.util';

const endpointProps: EndpointProps[] = [
   {
      position: 'none',
      label: '值',
      theme: 'primary',
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
         return endpoints.find((endpoint) => endpoint.label === '值')?.value;
      },
   },
];

defineProps<{ id: string; position: Point }>();
</script>
