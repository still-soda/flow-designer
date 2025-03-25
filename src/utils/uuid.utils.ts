let counter = 0;

/**
 * 生成全局唯一 ID
 * @returns 唯一 ID
 */
export const genId = () => `id-${counter++}`;
