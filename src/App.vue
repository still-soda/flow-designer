<template>
   <FlowDesigner :options :flow-items />
</template>

<script setup lang="ts">
import {
   Data,
   Plus,
   Minus,
   Close,
   Division,
   DataDisplay,
} from '@icon-park/vue-next';
import FlowDesigner from './components/FlowDesigner.vue';
import type { FlowItem } from './types/flow-item.type';
import type { Option, OptionActionPayload } from './types/option.type';
import { genId } from './utils/uuid.utils';
import { Point } from './utils/point.util';
import {
   AddItem,
   DataSrouce,
   MinusItem,
   MultItem,
   DivItem,
   ResultItem,
} from './extensions';

// 右键菜单选项
const createNewFlowItem = (
   payload: OptionActionPayload,
   type: FlowItem['type']
) => {
   const { flowItems, menuPosition } = payload;
   const id = genId();
   flowItems.set(id, {
      id,
      type,
      drag: false,
      endpoints: [],
      position: new Point(menuPosition.x, menuPosition.y),
   });
};

const flowItems = {
   source: DataSrouce,
   add: AddItem,
   minus: MinusItem,
   mult: MultItem,
   div: DivItem,
   result: ResultItem,
};

const options: Option[] = [
   {
      icon: Data,
      title: '添加数据源',
      action: (payload) => createNewFlowItem(payload, 'source'),
   },
   {
      icon: DataDisplay,
      title: '添加结果展示',
      action: (payload) => createNewFlowItem(payload, 'result'),
   },
   {
      icon: Plus,
      title: '添加加法运算',
      action: (payload) => createNewFlowItem(payload, 'add'),
   },
   {
      icon: Minus,
      title: '添加减法运算',
      action: (payload) => createNewFlowItem(payload, 'minus'),
   },
   {
      icon: Close,
      title: '添加乘法运算',
      action: (payload) => createNewFlowItem(payload, 'mult'),
   },
   {
      icon: Division,
      title: '添加除法运算',
      action: (payload) => createNewFlowItem(payload, 'div'),
   },
];
</script>
