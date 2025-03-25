/**
 * 发布订阅模式类接口
 */
export interface Emitter {
   /**
    * 监听事件
    * @param event 事件名称
    * @param listener 事件监听器
    */
   on<T extends (...args: any[]) => void>(
      event: string | symbol,
      listener: T
   ): void;

   /**
    * 取消监听事件
    * @param event 事件名称
    * @param listener 事件监听器
    */
   off(event: string | symbol, listener: Function): void;

   /**
    * 触发事件
    * @param event 事件名称
    * @param args 事件参数
    */
   emit<T extends (...args: any[]) => void>(
      event: string | symbol,
      ...args: Parameters<T>
   ): void;
}
