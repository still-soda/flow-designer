/**
 * 鼠标拖放事件
 * @property DRAG 拖拽事件，用于开始连接
 * @property DROP 放置事件，用于结束连接
 */
export const EndpointEvent = {
   DRAG: Symbol('drag'),
   DROP: Symbol('drop'),
};

/**
 * 端点注册相关事件的负载
 */
export interface EndpointEvent {
   type: 'input' | 'output';
   el: HTMLDivElement;
   id: string;
   maxConnections?: number;
}

/**
 * 端点注册事件，会在 Endpoint 组件初始化时触发
 * @see src/components/flow-items/BasicItems/Endpoint.vue
 */
export const REGISTER_ENDPOINT = Symbol('register-endpoint');

/**
 * 端点注销事件，会在 Endpoint 组件销毁时触发
 * @see src/components/flow-items/BasicItems/Endpoint.vue
 */
export const UNREGISTER_ENDPOINT = Symbol('unregister-endpoint');

/**
 * 发射端点注册相关事件
 * @param event 端点注册相关事件的负载
 */
export type EmitEndpointEvent = (event: EndpointEvent) => void;
