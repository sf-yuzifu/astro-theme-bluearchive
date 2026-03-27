---
title: '测试文章 13 - 微前端架构实践'
description: '探索微前端架构的设计理念和实现方案'
pubDate: '2024-02-22'
heroImage: '../../assets/blog-placeholder-3.jpg'
tags: ['微前端', '架构', '前端']
---

微前端是一种将前端应用拆分为更小、更独立单元的架构风格。

## 核心概念

### 为什么需要微前端？

- 团队独立开发和部署
- 技术栈无关
- 渐进式升级
- 代码隔离

## 实现方案

### qiankun

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:3000',
    container: '#container',
    activeRule: '/react',
  },
  {
    name: 'vueApp',
    entry: '//localhost:8080',
    container: '#container',
    activeRule: '/vue',
  },
])

start()
```

### Module Federation

```javascript
// webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js',
        app2: 'app2@http://localhost:3002/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
}
```

## 通信机制

### 自定义事件

```javascript
// 发布
window.dispatchEvent(new CustomEvent('micro-app-event', {
  detail: { type: 'login', data: userInfo }
}))

// 订阅
window.addEventListener('micro-app-event', (e) => {
  console.log(e.detail)
})
```

## 最佳实践

- 统一的设计系统和组件库
- 共享依赖减少加载
- 路由协调
- 样式隔离

## 总结

微前端适合大型团队和复杂应用，但也带来了额外的复杂性，需要权衡利弊。
