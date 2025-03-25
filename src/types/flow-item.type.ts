import type { FlowItems } from '../components/flow-items';
import type { Point } from '../utils/point.util';
import type { Endpoint } from './endpoint.type';

/**
 * 流程项
 * @property id 流程项ID
 * @property position 流程项位置
 * @property endpoints 流程项的端点列表
 * @property drag 流程项是否正在被拖拽
 * @property type 流程项类型
 */
export interface FlowItem {
   /** 流程项ID */
   id: string;
   /** 流程项位置 */
   position: Point;
   /** 流程项的端点列表 */
   endpoints: Endpoint[];
   /** 流程项是否正在被拖拽 */
   drag: boolean;
   /** 流程项类型 */
   type: keyof typeof FlowItems;
}

/**
 * 注册流程项事件监听器类型
 * @param flowItem 流程项
 */
export type RegisterFlowItem = (flowItem: FlowItem) => void;

/**
 * 注销流程项事件监听器类型
 * @param id 流程项ID
 */
export type UnregisterFlowItem = (id: string) => void;
