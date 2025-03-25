/**
 * 封装节流函数
 * @param fn 原函数
 * @param interval 间隔时间
 * @returns 节流函数
 */
export function throttle<T extends (...args: any[]) => void>(
   fn: T,
   interval: number
) {
   let lastUpdateTime = 0;
   return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastUpdateTime < interval) return;
      fn(...args);
      lastUpdateTime = now;
   };
}
