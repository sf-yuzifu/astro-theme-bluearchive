---
title: '测试文章 03 - CSS Grid 布局完全指南'
description: '全面掌握 CSS Grid 布局系统的使用方法'
pubDate: '2024-01-22'
heroImage: '../../assets/blog-placeholder-3.jpg'
tags: ['CSS', '布局', '前端']
---

CSS Grid 是现代网页布局的强大工具，提供了二维布局系统，让复杂的页面设计变得简单。

## 基础概念

Grid 布局涉及两个核心元素：

- **Grid Container**：启用网格布局的父元素
- **Grid Items**：网格中的子元素

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

## 定义网格

使用 `grid-template-columns` 和 `grid-template-rows` 定义网格结构：

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 2fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

## 网格区域

使用命名区域创建直观的布局：

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 200px 1fr 1fr;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

## 响应式网格

结合媒体查询创建响应式布局：

```css
.responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

## 结语

CSS Grid 让复杂的二维布局变得简单直观，是现代网页开发的必备技能。
