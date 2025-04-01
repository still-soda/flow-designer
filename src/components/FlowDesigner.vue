<template>
   <div class="relative w-full h-full overflow-hidden">
      <Canvas
         ref="canvas"
         :emitter
         :flow-components
         v-model:flow-items="flowItems"
         v-model:connections="connections"
         v-model:endpoints="endpoints">
         <!-- 顶部提示 -->
         <div
            v-if="!props.hideTips && tipStep < 2"
            class="absolute top-2 left-1/2 -translate-x-1/2 w-fit px-4 py-2.5 rounded-xl bg-white border-[1px] border-gray-200 text-sm text-gray-500 text-nowrap">
            <div v-if="tipStep === 0" class="flex gap-2 items-center">
               <Click />
               右键点击空白处，添加流程项
            </div>
            <div v-else-if="tipStep === 1" class="flex gap-2 items-center">
               按住
               <span v-if="platform === 'mac'">⌘</span>
               <span v-else>Ctrl</span>
               键上下滚动以缩放画布
            </div>
         </div>

         <!-- 右键菜单 -->
         <RightClickMenu
            :menu-position="menuPosition"
            :options="options"
            :show-menu="showMenu"
            @menu-option-click="handleMenuOptionClick" />
      </Canvas>
   </div>
</template>

<script setup lang="ts">
import { Click } from '@icon-park/vue-next';
import RightClickMenu from './RightClickMenu.vue';
import {
   onMounted,
   provide,
   reactive,
   ref,
   useTemplateRef,
   type Component,
} from 'vue';
import type { Emitter } from '../types/emitter.type';
import Canvas from './Canvas.vue';
import type {
   FlowItem,
   RegisterFlowItem,
   UnregisterFlowItem,
} from '../types/flow-item.type';
import type { Connection } from '../types/connection.type';
import type {
   Endpoint,
   RegisterEndpoint,
   UnregisterEndpoint,
} from '../types/endpoint.type';
import type { Option } from '../types/option.type';
import { Point } from '../utils/point.util';
import {
   REGISTER_ENDPOINT,
   UNREGISTER_ENDPOINT,
} from '../events/endpoint.event';
import {
   REGISTER_FLOW_ITEM,
   UNREGISTER_FLOW_ITEM,
} from '../events/flow-item.event';
import { EventEmitter } from '../utils/event-emitter.util';
import { GLOBAL_EMITTER } from '../events/global.event';

const platform = navigator.userAgent.includes('Mac') ? 'mac' : 'windows';

const props = defineProps<{
   flowComponents: Record<string, Component>;
   emitter?: Emitter;
   hideTips?: boolean;
   options: Option[];
}>();

// 数据
const flowItems = reactive(new Map<string, FlowItem>());
const connections = reactive(new Map<string, Connection>());
const endpoints = reactive(new Map<string, Endpoint>());
const tipStep = ref(0);

const canvas = useTemplateRef<InstanceType<typeof Canvas> & HTMLDivElement>(
   'canvas'
);

const emitter = props.emitter ?? new EventEmitter();
provide(GLOBAL_EMITTER, emitter);

// 提供组件注册方法
provideRegisterMethods();
function provideRegisterMethods() {
   //  注册流程项
   const registerFlowItem: RegisterFlowItem = (item: FlowItem) => {
      flowItems.set(item.id, item);
      emitter.emit<RegisterFlowItem>(REGISTER_FLOW_ITEM, item);
   };
   provide(REGISTER_FLOW_ITEM, registerFlowItem);
   //  注销流程项
   const unregisterFlowItem: UnregisterFlowItem = (id: string) => {
      flowItems.delete(id);
      emitter.emit<UnregisterFlowItem>(UNREGISTER_FLOW_ITEM, id);
   };
   provide(UNREGISTER_FLOW_ITEM, unregisterFlowItem);
   //  注册端点
   const registerEndpoint: RegisterEndpoint = (endpoint: Endpoint) => {
      endpoints.set(endpoint.id, endpoint);
      emitter.emit<RegisterEndpoint>(REGISTER_ENDPOINT, endpoint);
   };
   provide(REGISTER_ENDPOINT, registerEndpoint);
   //  注销端点
   const unregisterEndpoint: UnregisterEndpoint = (id: string) => {
      endpoints.delete(id);
      emitter.emit<UnregisterEndpoint>(UNREGISTER_ENDPOINT, id);
   };
   provide(UNREGISTER_ENDPOINT, unregisterEndpoint);
}

// 处理右键菜单项点击
const showMenu = ref(false);
const menuPosition = reactive(new Point(0, 0));

const handleMenuOptionClick = (option: Option) => {
   option.action({
      flowItems,
      menuPosition: canvas.value!.cameraToWorld(menuPosition),
   });
};

// 处理右键菜单显示
onMounted(() => {
   const canvasRef = canvas.value?.ref;
   if (!canvasRef) {
      throw new Error('Canvas not found');
   }
   // 监听右键菜单
   canvasRef.addEventListener('contextmenu', (e) => {
      if (e.target !== canvasRef) return;
      e.preventDefault();
      tipStep.value === 0 && tipStep.value++;
      showMenu.value = true;
      menuPosition.x = e.clientX;
      menuPosition.y = e.clientY;
   });
   canvasRef.addEventListener('click', (e) => {
      if (e.button === 0) {
         showMenu.value = false;
      }
   });
});

window.addEventListener('keydown', (e) => {
   if (e.metaKey) {
      tipStep.value === 1 && tipStep.value++;
   }
});
</script>
