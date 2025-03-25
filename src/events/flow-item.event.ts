/**
 * 流程项注册事件，会在 FlowItem 组件初始化时触发
 * @see src/components/flow-items/BasicItems/index.vue
 */
export const REGISTER_FLOW_ITEM = Symbol('register-flow-item');

/**
 * 流程项注销事件，会在 FlowItem 组件初始化时触发
 * @see src/components/flow-items/BasicItems/index.vue
 */
export const UNREGISTER_FLOW_ITEM = Symbol('unregister-flow-item');
