/**
 * 封装防抖函数
 * @param fn 函数
 * @param delay
 * @returns
 */
export function debounce<T extends (...args: any[]) => void>(
   fn: T,
   delay: number
) {
   let timer: number | null = null;

   return (...args: Parameters<T>) => {
      if (timer) {
         clearTimeout(timer);
      }
      timer = setTimeout(() => {
         fn(...args);
         timer = null;
      }, delay);
   };
}
