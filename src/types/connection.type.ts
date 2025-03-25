import type { Point } from '../utils/point.util';
import type { Endpoint } from './endpoint.type';

/**
 * 连接线
 * @property id 连接线ID
 * @property from 起始端点
 * @property to 终止端点
 * @property fromPosition 起始端点位置
 * @property toPosition 终止端点位置
 * @property type 连接线传播类型
 */
export interface Connection {
   /** 连接线ID */
   id: string;
   /** 起始端点 */
   from: Endpoint;
   /** 终止端点 */
   to?: Endpoint;
   /** 起始端点位置 */
   fromPosition: Point;
   /** 终止端点位置 */
   toPosition: Point;
   /** 连接线传播类型 */
   type: 'forward' | 'backward' | 'both';
}
