---
title: '测试文章 15 - 现代 CSS 特性概览'
description: '探索 CSS 的新特性，提升开发效率和用户体验'
pubDate: '2024-02-28'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['CSS', '前端', '样式']
---

CSS 不断发展，带来了许多强大的新特性。本文介绍一些值得关注的新功能。

## 容器查询

容器查询允许根据容器大小而非视口大小应用样式：

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 200px 1fr;
  }
}
```

## 级联层

使用 `@layer` 控制样式优先级：

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer components {
  .button { padding: 10px 20px; }
}

@layer utilities {
  .p-0 { padding: 0; } /* 优先级更高 */
}
```

## :has() 选择器

父元素选择器， finally！

```css
/* 选择包含图片的卡片 */
.card:has(img) {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* 选择被勾选的复选框后的标签 */
input:checked + label:has(+ .content) {
  font-weight: bold;
}
```

## 颜色函数

```css
/* OKLCH 颜色空间 */
.accent {
  color: oklch(70% 0.2 250);
}

/* color-mix 混合颜色 */
.mixed {
  color: color-mix(in srgb, red 50%, blue 50%);
}

/* 相对颜色 */
.darker {
  color: hsl(from var(--color) h s calc(l - 20%));
}
```

## 视图过渡

```css
/* 简单的页面过渡 */
::view-transition-old(root) {
  animation: fade-out 0.5s ease;
}

::view-transition-new(root) {
  animation: fade-in 0.5s ease;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

## 总结

现代 CSS 让样式编写更加强大和灵活，值得持续学习和关注。
