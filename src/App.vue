<template>
   <FlowDesigner :options :flow-components />
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

// 流程图组件，key 为自定义流程项时的 type
const flowComponents = {
   source: DataSrouce,
   add: AddItem,
   minus: MinusItem,
   mult: MultItem,
   div: DivItem,
   result: ResultItem,
};

// 自定义右键菜单选项以及对应操作
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
