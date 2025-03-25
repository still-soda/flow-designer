/**
 * 二维坐标类
 */
export class Point {
   x: number;
   y: number;
   constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
   }

   /**
    * 计算到点 p 的距离
    * @example
    * ```ts
    * const p1 = new Point(-1, 0);
    * const p2 = new Point(1, 0);
    * p1.dist(p2);   // => 2
    * ```
    */
   dist(p: Point) {
      return Math.sqrt((p.x - this.x) ** 2 + (p.y - this.y) ** 2);
   }

   /**
    * 加法运算
    * @example
    * ```ts
    * const p1 = new Point(-1, 0);
    * const p2 = new Point(1, 0);
    * p1.add(p2);   // => Point(0, 0)
    * ```
    */
   add(p: Point) {
      return new Point(this.x + p.x, this.y + p.y);
   }

   /**
    * 减法运算
    * @example
    * ```ts
    * const p1 = new Point(-1, 0);
    * const p2 = new Point(1, 0);
    * p1.sub(p2);   // => Point(-2, 0)
    * ```
    */
   sub(p: Point) {
      return new Point(this.x - p.x, this.y - p.y);
   }

   /**
    * 乘法运算
    * @example
    * ```ts
    * const p1 = new Point(-1, 0);
    * const p2 = new Point(2, 0);
    * p1.mul(p2);   // => Point(-2, 0)
    * ```
    */
   mul(n: number) {
      return new Point(this.x * n, this.y * n);
   }

   /**
    * 除法运算
    * @example
    * ```ts
    * const p1 = new Point(-1, 0);
    * const p2 = new Point(2, 0);
    * p1.sub(p2);   // => Point(-0.5, 0)
    * ```
    */
   div(n: number) {
      return new Point(this.x / n, this.y / n);
   }

   /**
    * 取 xy 值的绝对值
    * @example
    * ```ts
    * const p1 = new Point(-1, 1);
    * p1.abs();   // => Point(1, 1)
    * ```
    */
   abs() {
      return Math.sqrt(this.x ** 2 + this.y ** 2);
   }
}
