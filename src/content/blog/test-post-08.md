---
title: '测试文章 08 - 前端性能优化实战'
description: '提升网页加载速度和运行性能的实用技巧'
pubDate: '2024-02-08'
heroImage: '../../assets/blog-placeholder-3.jpg'
tags: ['性能', '前端', '优化']
---

性能是用户体验的关键因素。本文介绍一些实用的前端性能优化技巧。

## 加载优化

### 图片优化

```html
<!-- 使用现代格式 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="描述" loading="lazy">
</picture>
```

### 代码分割

```javascript
// React 懒加载
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Vue 异步组件
const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
```

## 渲染优化

### 虚拟列表

处理大量数据时使用虚拟滚动：

```jsx
import { VirtualList } from 'react-window';

<VirtualList
  height={500}
  itemCount={10000}
  itemSize={50}
  width="100%"
>
  {Row}
</VirtualList>
```

### 防抖和节流

```javascript
// 防抖 - 搜索输入
const debouncedSearch = debounce((query) => {
  searchAPI(query);
}, 300);

// 节流 - 滚动事件
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

## 缓存策略

### Service Worker

```javascript
// 缓存静态资源
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
      }),
    ],
  })
);
```

## 性能指标

- **FCP** (First Contentful Paint)：首次内容绘制
- **LCP** (Largest Contentful Paint)：最大内容绘制
- **FID** (First Input Delay)：首次输入延迟
- **CLS** (Cumulative Layout Shift)：累积布局偏移

## 总结

性能优化是一个持续的过程，需要结合监控工具和实际用户数据进行针对性优化。
