<template>
   <!-- 主容器，包含整个画布 -->
   <div
      ref="container"
      @dragstart="(e) => e.preventDefault()"
      class="w-screen h-screen flex bg-gray-50 overflow-hidden grid-bg"
      :style="{
         '--x': `${-cameraCenter.x + worldCenter.x}px`,
         '--y': `${-cameraCenter.y + worldCenter.y}px`,
         '--scale': cameraScale,
      }"
      :class="{ 'hover:cursor-move': onDrag }">
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
               @click="handleMenuOptionClick(option)"
               class="text-sm text-nowrap hover:cursor-pointer hover:bg-gray-200 rounded-sm transition-all px-2 py-0.5 flex gap-2 items-center">
               <Component :is="option.icon" />
               {{ option.title }}
            </div>
         </div>
      </div>

      <div
         class="w-full h-full pointer-events-none [&>*]:pointer-events-auto"
         :style="{
            transform: `translate(${-cameraCenter.x}px, ${-cameraCenter.y}px) scale(${cameraScale})`,
         }">
         <!-- 流程项（FlowItems） -->
         <div
            v-for="item in flowItems.values()"
            :key="item.id"
            :style="{
               transform: `translate(${item.position.x}px, ${item.position.y}px)`,
            }"
            class="w-fit h-fit absolute group z-10 select-none"
            :class="{ '**:data-operation:opacity-100': item.drag }">
            <!-- 操作按钮：移动 -->
            <div
               data-operation
               @mousedown="(e) => handleMoveItem(e, item)"
               class="absolute bg-white left-1/2 -top-4 size-6 border-[1px] border-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 items-center justify-center flex z-10 text-xs hover:bg-gray-200 transition-all hover:cursor-move hover:scale-110 opacity-0 group-hover:opacity-100">
               <MoveIn />
            </div>
            <!-- 操作按钮：删除 -->
            <div
               data-operation
               @click="handleDelete(item)"
               class="absolute bg-white right-1/2 -top-4 mr-2 size-6 border-[1px] text-red-600 border-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 items-center justify-center flex z-10 text-xs hover:bg-gray-200 transition-all hover:cursor-pointer hover:scale-110 opacity-0 group-hover:opacity-100">
               <Delete />
            </div>
            <!-- 流程项组件 -->
            <div class="transition-transform">
               <Component
                  :is="props.flowItems[item.type]"
                  :id="item.id"
                  :position="item.position"
                  ref="flow-item" />
            </div>
         </div>

         <!-- 连接线组件 -->
         <svg class="!pointer-events-none overflow-visible">
            <ConnectionComponent
               v-for="[id, connection] in connections.entries()"
               :key="id"
               :type="connection.type"
               :from="connection.from"
               :to="connection.to"
               :from-position="connection.fromPosition"
               :to-position="connection.toPosition" />
         </svg>
      </div>
   </div>
</template>

<script setup lang="ts">
import { Click } from '@icon-park/vue-next';
import {
   computed,
   nextTick,
   onMounted,
   onUnmounted,
   provide,
   reactive,
   ref,
   useTemplateRef,
   watchEffect,
   type Component,
} from 'vue';
import {
   EndpointEvent,
   REGISTER_ENDPOINT,
   UNREGISTER_ENDPOINT,
} from '../events/endpoint.event';
import {
   REGISTER_FLOW_ITEM,
   UNREGISTER_FLOW_ITEM,
} from '../events/flow-item.event';
import { GLOBAL_EMITTER } from '../events/global.event';
import type { Connection } from '../types/connection.type';
import type { Endpoint } from '../types/endpoint.type';
import type {
   RegisterFlowItem,
   UnregisterFlowItem,
   FlowItem,
} from '../types/flow-item.type';
import { Point } from '../utils/point.util';
import { EventEmitter } from '../utils/event-emitter.util';
import type {
   RegisterEndpoint,
   UnregisterEndpoint,
} from '../types/endpoint.type';
import type { Emitter } from '../types/emitter.type';
import type { EmitEndpointEvent } from '../events/endpoint.event';
import type { Option } from '../types/option.type';
import { Delete, MoveIn } from '@icon-park/vue-next';
import ConnectionComponent from './Connection.vue';
import { genId } from '../utils/uuid.utils';
import { throttle } from '../utils/throttle.util';
import { debounce } from '../utils/debounce.util';

const props = defineProps<{
   flowItems: Record<string, Component>;
   emitter?: Emitter;
   options?: Option[];
   hideTips?: boolean;
}>();
const platform = navigator.userAgent.includes('Mac') ? 'mac' : 'windows';

// 注册事件总线
const emitter = props.emitter ?? new EventEmitter();
provide(GLOBAL_EMITTER, emitter);

// 数据
const flowItems = reactive<Map<string, FlowItem>>(new Map());
const endpoints = reactive<Map<string, Endpoint>>(new Map());
const connections = reactive<Map<string, Connection>>(new Map());

const endpoint2connection = new WeakMap<Endpoint, Set<Connection>>();
const options = props.options ?? [];

const containerSize = reactive({
   width: 0,
   height: 0,
});
const worldCenter = reactive(new Point(0, 0));
const cameraCenter = reactive(new Point(0, 0));
const cameraScale = ref(1);
watchEffect(() => {
   worldCenter.x = containerSize.width / 2;
   worldCenter.y = containerSize.height / 2;
});

const tipStep = ref(0);

// 相机坐标转世界坐标
const cameraToWorld = (position: Point) => {
   return cameraCenter
      .sub(worldCenter)
      .add(position)
      .div(cameraScale.value)
      .add(worldCenter);
};

// 提供注册方法
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

// 右键菜单与容器事件处理
const menuPosition = reactive(new Point(0, 0));
const showMenu = ref(false);
const container = useTemplateRef('container');

onMounted(() => {
   if (!container.value) return;
   // 计算容器大小
   containerSize.width = container.value.clientWidth;
   containerSize.height = container.value.clientHeight;
   // 监听窗口大小变化
   const onResize = debounce(() => {
      containerSize.width = container.value!.clientWidth;
      containerSize.height = container.value!.clientHeight;
   }, 100);
   window.addEventListener('resize', onResize);
   // 监听 meta键按下
   let metaKeyPressed = false;
   document.addEventListener('keydown', (e) => {
      if (e.metaKey) {
         metaKeyPressed = true;
         container.value!.style.cursor = 'move';
      }
   });
   document.addEventListener('keyup', (e) => {
      if (e.key === 'Meta') {
         metaKeyPressed = false;
         container.value!.style.cursor = 'default';
      }
   });
   // 监听滚动事件
   container.value.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (metaKeyPressed) {
         tipStep.value === 1 && tipStep.value++;
         cameraScale.value += e.deltaY * -0.001;
         cameraScale.value = Math.min(Math.max(0.5, cameraScale.value), 2);
      } else {
         cameraCenter.x += e.deltaX;
         cameraCenter.y += e.deltaY;
      }
   });
   // 监听右键菜单
   container.value.addEventListener('contextmenu', (e) => {
      if (e.target !== container.value) return;
      e.preventDefault();
      tipStep.value === 0 && tipStep.value++;
      showMenu.value = true;
      menuPosition.x = e.clientX;
      menuPosition.y = e.clientY;
   });
   container.value.addEventListener('click', (e) => {
      if (e.button === 0) {
         showMenu.value = false;
      }
   });
});

// 处理右键菜单项点击
const handleMenuOptionClick = (option: Option) => {
   option.action({
      flowItems,
      menuPosition: cameraToWorld(menuPosition),
   });
};

// 正在拖拽
const onDrag = computed(() => {
   const values = Array.from(flowItems.values());
   return values.some((item) => item.drag);
});

// 移动流程项
const startOffset = new Point(0, 0);
const handleMoveItem = (e: MouseEvent, item: FlowItem) => {
   if (!container.value) return;
   const { clientX, clientY } = e;
   const clickPos = cameraToWorld(new Point(clientX, clientY));
   startOffset.x = clickPos.x - item.position.x;
   startOffset.y = clickPos.y - item.position.y;
   item.drag = true;

   const handleMove = throttle(async (e: MouseEvent) => {
      // 更新流程项位置
      const mousePos = cameraToWorld(new Point(e.clientX, e.clientY));
      item.position.x = mousePos.x - startOffset.x;
      item.position.y = mousePos.y - startOffset.y;
      await nextTick();
      // 更新连接线位置
      item.endpoints.forEach((point) => {
         if (!point.el) {
            return;
         }
         const center = calcCenterPoint(point.el);
         const connections = endpoint2connection.get(point);
         connections?.forEach((connection) => {
            if (connection.from === point) {
               connection.fromPosition = center;
            } else {
               connection.toPosition = center;
            }
         });
      });
   }, 16);
   const handleUp = () => {
      item.drag = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
   };
   document.addEventListener('mousemove', handleMove);
   document.addEventListener('mouseup', handleUp);
};

// 删除流程项
const handleDelete = (item: FlowItem) => {
   const { endpoints } = item;
   for (const endpoint of endpoints) {
      const connections = endpoint2connection.get(endpoint);
      connections?.forEach((connection) => {
         deleteConnection(connection.id);
      });
   }
   flowItems.delete(item.id);
};

// 删除连接线
const deleteConnection = (id: string) => {
   const connection = connections.get(id);
   if (!connection) return;

   const { from, to } = connection;
   if (from) {
      const fromSet = endpoint2connection.get(from);
      fromSet && fromSet.delete(connection);
   }
   if (to) {
      const toSet = endpoint2connection.get(to);
      toSet && toSet.delete(connection);
   }

   connections.delete(id);
};

// 元素计算中心点
const calcCenterPoint = (el: HTMLDivElement) => {
   const { left, top, width, height } = el.getBoundingClientRect();
   const p = new Point(left + width / 2, top + height / 2);
   return cameraToWorld(p);
};

// 监听连接拖拽事件
function listenConnectEvents() {
   let currentConnection: Connection | null = null;
   let cleanup: Function | null = null;

   const onStartConnect: EmitEndpointEvent = (event) => {
      const center = calcCenterPoint(event.el);
      const connectionId = genId();
      const fromEndpoint = endpoints.get(event.id);
      if (!fromEndpoint) return;

      const offset = 8 * cameraScale.value;
      const connection: Connection = {
         id: connectionId,
         type: 'forward',
         from: fromEndpoint,
         fromPosition: center,
         toPosition: new Point(center.x + offset, center.y),
      };
      connections.set(connectionId, connection);
      currentConnection = connections.get(connectionId)!;

      const onMonuseMove = throttle((e: MouseEvent) => {
         if (!currentConnection) {
            cleanup && cleanup();
            return;
         }
         const p = new Point(e.clientX + offset, e.clientY);
         currentConnection.toPosition = cameraToWorld(p);
      }, 16);
      const onMouseUp = async () => {
         if (!currentConnection) {
            cleanup && cleanup();
            return;
         }
         await nextTick();
         if (!currentConnection.to) {
            deleteConnection(connectionId);
            cleanup && cleanup();
         }
      };

      document.addEventListener('mousemove', onMonuseMove);
      document.addEventListener('mouseup', onMouseUp);

      cleanup = () => {
         document.removeEventListener('mousemove', onMonuseMove);
         document.removeEventListener('mouseup', onMouseUp);
      };
   };
   emitter.on(EndpointEvent.DRAG, onStartConnect);

   const onEndConnect: EmitEndpointEvent = (event) => {
      const endpoint = endpoints.get(event.id);
      if (!endpoint) return;

      const connectCount = endpoint2connection.get(endpoint)?.size ?? 0;
      const maxConnections = event.maxConnections ?? 0;
      if (!currentConnection || connectCount >= maxConnections) return;

      const center = calcCenterPoint(event.el);
      currentConnection.toPosition = center;
      currentConnection.to = endpoint;

      const { to, from } = currentConnection;
      const toSet = endpoint2connection.get(to!) ?? new Set();
      const fromSet = endpoint2connection.get(from) ?? new Set();

      toSet.add(currentConnection);
      fromSet.add(currentConnection);

      endpoint2connection.set(to!, toSet);
      endpoint2connection.set(from, fromSet);

      currentConnection = null;
      cleanup && cleanup();
   };
   emitter.on(EndpointEvent.DROP, onEndConnect);

   return () => {
      emitter.off(EndpointEvent.DRAG, onStartConnect);
      emitter.off(EndpointEvent.DROP, onEndConnect);
   };
}
const cleanup = listenConnectEvents();
onUnmounted(cleanup);
</script>

<style lang="css" scoped>
/* 背景网格样式 */
.grid-bg {
   --rx: calc(1.5px * var(--scale));
   --ry: calc(1.5px * var(--scale));
   --sx: calc(26px * var(--scale));
   --sy: calc(26px * var(--scale));

   background-color: #ffffff;
   background-image: radial-gradient(#e0e0e0 var(--rx), transparent var(--ry)),
      radial-gradient(#e0e0e0 var(--rx), #ffffff var(--ry));
   background-size: var(--sx) var(--sx);
   background-position: var(--x) var(--y);
   background-repeat: repeat;
}
</style>
