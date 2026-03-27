---
title: '测试文章 10 - Web 安全最佳实践'
description: '保护 Web 应用免受常见安全威胁的实用指南'
pubDate: '2024-02-15'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['安全', 'Web', '最佳实践']
---

Web 安全是每个开发者都应该重视的话题。本文介绍常见的安全威胁和防护措施。

## XSS 防护

### 输入过滤和输出编码

```javascript
// 使用 DOMPurify 清理 HTML
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirtyHtml);

// React 自动转义
function Component({ userInput }) {
  return <div>{userInput}</div>; // 自动转义
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;">
```

## CSRF 防护

### 使用 CSRF Token

```javascript
// 服务端生成 token
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken();
  next();
});

// 前端请求携带 token
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

## 安全头部

```javascript
// 使用 Helmet 设置安全头部
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true,
}));
```

## 依赖安全

### 定期扫描漏洞

```bash
# npm audit
npm audit

# 自动修复
npm audit fix

# 使用 Snyk
npx snyk test
```

## 总结

安全是一个持续的过程，需要定期审查和更新安全策略。
