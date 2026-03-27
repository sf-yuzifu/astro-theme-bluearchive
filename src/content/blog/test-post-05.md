---
title: '测试文章 05 - Node.js 性能优化指南'
description: '提升 Node.js 应用性能的实用技巧和策略'
pubDate: '2024-01-28'
heroImage: '../../assets/blog-placeholder-5.jpg'
tags: ['Node.js', '性能', '后端']
---

Node.js 应用性能优化是一个重要话题。本文介绍一些实用的优化技巧。

## 异步操作优化

### 使用 Promise.all 并行执行

```javascript
// 不推荐：串行执行
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// 推荐：并行执行
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id)
]);
```

### 使用流处理大文件

```javascript
const fs = require('fs');
const zlib = require('zlib');

// 使用流处理大文件，避免内存溢出
fs.createReadStream('large-file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('large-file.txt.gz'));
```

## 内存管理

### 注意闭包内存泄漏

```javascript
// 可能导致内存泄漏
const cache = {};
function processData(data) {
  cache[data.id] = data;  // 无限制增长
}

// 使用 LRU 缓存
const LRU = require('lru-cache');
const cache = new LRU({ max: 500 });
```

## 数据库优化

### 使用连接池

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'test',
  connectionLimit: 10
});
```

### 添加索引和查询优化

```javascript
// 使用参数化查询防止 SQL 注入
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

## 监控和调试

使用 clinic.js 进行性能分析：

```bash
clinic doctor -- node server.js
clinic flame -- node server.js
```

## 总结

性能优化是一个持续的过程，需要结合监控工具和实际场景进行调整。
