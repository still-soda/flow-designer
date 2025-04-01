<template>
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
      <slot></slot>
      <div
         class="w-full h-full pointer-events-none [&>*]:pointer-events-auto"
         :style="{
            transform: `translate(${-cameraCenter.x}px, ${-cameraCenter.y}px) scale(${cameraScale})`,
         }">
         <!-- 流程项（FlowItems） -->
         <FlowItemWrapper
            v-for="item in flowItems.values()"
            :key="item.id"
            :flow-components="flowComponents"
            :item="item"
            :style="{
               transform: `translate(${item.position.x}px, ${item.position.y}px)`,
            }"
            @move="(e, id) => handleMoveItem(e, id)"
            @delete="(item) => handleDelete(item)" />

         <!-- 连接线组件 -->
         <ConnectionComponent
            v-for="[id, connection] in connections.entries()"
            :key="id"
            :type="connection.type"
            :from="connection.from"
            :to="connection.to"
            :from-position="connection.fromPosition"
            :to-position="connection.toPosition" />
      </div>
   </div>
</template>

<script setup lang="ts">
import {
   computed,
   nextTick,
   onMounted,
   onUnmounted,
   reactive,
   ref,
   useTemplateRef,
   watchEffect,
   type Component,
} from 'vue';
import { EndpointEvent } from '../events/endpoint.event';
import type { Connection } from '../types/connection.type';
import type { Endpoint } from '../types/endpoint.type';
import type { FlowItem } from '../types/flow-item.type';
import { Point } from '../utils/point.util';
import type {} from '../types/endpoint.type';
import type { EmitEndpointEvent } from '../events/endpoint.event';
import ConnectionComponent from './Connection.vue';
import { genId } from '../utils/uuid.utils';
import { throttle } from '../utils/throttle.util';
import { debounce } from '../utils/debounce.util';
import FlowItemWrapper from './FlowItemWrapper.vue';
import { useEmitter } from '../hooks/useEmitter';

defineProps<{
   flowComponents: Record<string, Component>;
}>();

// 注册事件总线
const emitter = useEmitter();

// 数据
const flowItems = defineModel<Map<string, FlowItem>>('flowItems', {
   default: () => new Map(),
});
const endpoints = defineModel<Map<string, Endpoint>>('endpoints', {
   default: () => new Map(),
});
const connections = defineModel<Map<string, Connection>>('connections', {
   default: () => new Map(),
});

const endpoint2connection = new WeakMap<Endpoint, Set<Connection>>();

const container = useTemplateRef('container');
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

// 相机坐标转世界坐标
const cameraToWorld = (position: Point) => {
   return cameraCenter
      .sub(worldCenter)
      .add(position)
      .div(cameraScale.value)
      .add(worldCenter);
};

defineExpose({
   cameraToWorld,
   worldCenter,
   cameraCenter,
   cameraScale,
   ref: container,
});

// 右键菜单与容器事件处理

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
         cameraScale.value += e.deltaY * -0.001;
         cameraScale.value = Math.min(Math.max(0.5, cameraScale.value), 2);
      } else {
         cameraCenter.x += e.deltaX;
         cameraCenter.y += e.deltaY;
      }
   });
});

// 正在拖拽
const onDrag = computed(() => {
   const values = Array.from(flowItems.value.values());
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
   flowItems.value.delete(item.id);
};

// 删除连接线
const deleteConnection = (id: string) => {
   const connection = connections.value.get(id);
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

   connections.value.delete(id);
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

   // 开始连接
   const onStartConnect: EmitEndpointEvent = (event) => {
      const center = calcCenterPoint(event.el);
      const connectionId = genId();
      const fromEndpoint = endpoints.value.get(event.id);
      if (!fromEndpoint) return;

      const offset = 8 * cameraScale.value;
      const connection: Connection = {
         id: connectionId,
         type: 'forward',
         from: fromEndpoint,
         fromPosition: center,
         toPosition: new Point(center.x + offset, center.y),
      };
      connections.value.set(connectionId, connection);
      currentConnection = connections.value.get(connectionId)!;

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

   // 结束连接
   // 连接到目标端点
   const onEndConnect: EmitEndpointEvent = (event) => {
      const endpoint = endpoints.value.get(event.id);
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
