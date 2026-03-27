---
title: '测试文章 01 - Astro 入门指南'
description: '学习 Astro 框架的基础知识和核心概念'
pubDate: '2024-01-15'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Astro', '教程', '前端']
---

Astro 是一个现代化的静态站点生成器，专注于构建快速、内容驱动的网站。本文将介绍 Astro 的核心概念和使用方法。

## 为什么选择 Astro？

Astro 的主要优势包括：

- **零 JavaScript 默认**：页面加载时不发送任何 JavaScript
- **岛屿架构**：支持交互式组件的按需加载
- **多框架支持**：可以使用 React、Vue、Svelte 等多种框架
- **优秀的性能**：自动优化图片和资源加载

## 快速开始

创建一个新的 Astro 项目非常简单：

```bash
npm create astro@latest
```

按照提示选择模板和配置，即可开始开发。

## 项目结构

Astro 项目采用约定优于配置的设计理念：

```
├── src/
│   ├── components/    # 可复用组件
│   ├── layouts/       # 页面布局
│   ├── pages/         # 路由页面
│   └── content/       # 内容集合
├── public/            # 静态资源
└── astro.config.mjs   # 配置文件
```

## 内容集合

Astro 的内容集合功能让你可以类型安全地管理 Markdown 和 MDX 内容：

```typescript
import { getCollection } from 'astro:content';
const posts = await getCollection('blog');
```

## 结语

Astro 是构建内容驱动网站的绝佳选择，无论是博客、文档站点还是营销页面，都能获得出色的性能表现。
