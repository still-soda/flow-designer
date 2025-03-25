# Flow Designer 流程设计引擎

此仓库为 Flow Designer 的 demo 仓库

## 效果预览

使用过程

![预览图2](images/preview-2.gif)

效果

![预览图1](images/preview-1.png)

## 关于 Flow Designer 

### 简介

Flow Designer 是一个使用 Vue (3.5) 和 TailwindCSS (4.0) 开发的，简洁但强大蓝图引擎，基于发布订阅模式构建，具有高可扩展性，注释完备。

### 特点

Flow Designer 具有非常简洁的设计，继续 EventEmitter 实现绝大多数事件的传递，因此可以通过监听和触发事件来干涉程序运行的各个流程。

### 使用

1. 克隆该项目，复制以下文件夹到相同目录
   ```bash
   src
    ├── components/
    ├── events/
    ├── utils/
    └── types/
   ```
2. 导入 FlowDesigner 组件
   ```ts
   import FlowDesigner from './components/FlowDesigner.vue';
   ```
3. 在模板中使用 FlowDesigner 组件
   ```html
   <!-- 可选通过 emitter 属性传入自定义事件触发器 -->
   <FlowDesigner :emitter="customEmitter" />
   ```
4. 可以传入实现 Emitter 接口的自定义事件管理器来监听和修改蓝图设计器中所有的行为和变更。
   ```ts
   customEmitter.on<RegisterEndpoint>(REGISTER_ENDPOINT, (endpoint) => {
    console.log('端点已注册: ', endpoint)
   });
   ```

### 目录结构

```bash
src
├── components/ # 存饭所有组件
├── events/     # 存放所有事件
├── utils/      # 存放大部分工具函数
└── types/      # 存放大部分类型
```

## 开源协议

本项目采用 MIT 开源协议，欢迎提交 PR，如果你觉得对你有帮助，希望能给我一个小小的 Star🌟！