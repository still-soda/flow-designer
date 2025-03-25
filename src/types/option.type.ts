import type { Component } from 'vue';
import type { FlowItem } from './flow-item.type';
import type { Point } from '../utils/point.util';

/**
 * 选项菜单类型
 */
export interface Option {
   icon: Component;
   title: string;
   action: (payload: OptionActionPayload) => void;
}

export interface OptionActionPayload {
   flowItems: Map<string, FlowItem>;
   menuPosition: Point;
}
