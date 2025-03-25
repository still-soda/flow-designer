/**
 * 端点属性
 * @property position 端点位置
 * @property label 端点标签
 * @property theme 端点主题
 * @property type 端点类型
 * @property value 端点值
 * @property maxConnections 最大连接数
 * @property computeValue 计算端点值
 */
export interface EndpointProps {
   /** 端点位置 */
   position: 'left' | 'right' | 'none';
   /** 端点标签 */
   label: string;
   /** 端点主题 */
   theme: 'default' | 'primary' | 'success' | 'warning' | 'danger';
   /** 端点类型 */
   type: 'input' | 'output';
   /** 端点值 */
   value: any;
   /** 最大连接数 */
   maxConnections?: number;
   /** 计算属性，当类型为 output 时使用 */
   computeValue?: (endpoints: Endpoint[]) => any;
}

/**
 * 端点
 * @property id 端点ID
 * @property el 端点DOM元素
 */
export interface Endpoint extends EndpointProps {
   id: string;
   el?: HTMLDivElement;
}

/**
 * 注册端点事件监听器类型
 * @param endpoint 端点
 */
export type RegisterEndpoint = (endpoint: Endpoint) => void;

/**
 * 注销端点事件监听器类型
 * @param id 端点ID
 */
export type UnregisterEndpoint = (id: string) => void;
