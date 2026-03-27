---
title: '测试文章 07 - Docker 容器化部署指南'
description: '学习使用 Docker 容器化部署应用程序'
pubDate: '2024-02-05'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['Docker', 'DevOps', '部署']
---

Docker 让应用程序的部署变得简单和一致。本文介绍 Docker 的核心概念和实战技巧。

## 基础概念

### 镜像和容器

- **镜像（Image）**：只读模板，包含运行应用所需的一切
- **容器（Container）**：镜像的运行实例

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

## 常用命令

### 镜像管理

```bash
# 构建镜像
docker build -t myapp:1.0 .

# 查看镜像列表
docker images

# 删除镜像
docker rmi myapp:1.0

# 推送镜像到仓库
docker push username/myapp:1.0
```

### 容器操作

```bash
# 运行容器
docker run -d -p 3000:3000 --name myapp myapp:1.0

# 查看运行中的容器
docker ps

# 查看日志
docker logs -f myapp

# 进入容器
docker exec -it myapp /bin/sh
```

## Docker Compose

多容器应用管理：

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password

volumes:
  postgres_data:
```

## 生产环境最佳实践

- 使用多阶段构建减小镜像体积
- 不以 root 用户运行应用
- 使用健康检查
- 限制容器资源使用

## 总结

Docker 让"一次构建，到处运行"成为可能，是现代应用部署的标准工具。
