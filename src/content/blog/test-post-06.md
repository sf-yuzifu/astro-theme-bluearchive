---
title: '测试文章 06 - Git 工作流最佳实践'
description: '掌握 Git 分支管理和团队协作的工作流程'
pubDate: '2024-02-01'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Git', '版本控制', '协作']
---

Git 是现代软件开发中不可或缺的工具。本文介绍一些实用的工作流最佳实践。

## 分支策略

### Git Flow

经典的分支模型，适合发布周期明确的项目：

```bash
# 主要分支
master    # 生产环境代码
develop   # 开发分支

# 辅助分支
feature/*  # 功能分支
release/*  # 发布分支
hotfix/*   # 热修复分支
```

### GitHub Flow

简化的工作流，适合持续部署：

1. 从 main 创建功能分支
2. 提交更改
3. 创建 Pull Request
4. 代码审查
5. 合并到 main

## 提交规范

使用约定式提交（Conventional Commits）：

```
feat: 添加用户登录功能
fix: 修复登录验证 bug
docs: 更新 API 文档
style: 格式化代码
refactor: 重构用户模块
test: 添加单元测试
chore: 更新依赖包
```

## 常用命令

### 交互式变基

```bash
# 整理提交历史
git rebase -i HEAD~5

# 合并多个提交
git rebase -i main
# 选择 squash 或 fixup
```

### 储藏更改

```bash
# 临时保存更改
git stash push -m "描述信息"

# 查看储藏列表
git stash list

# 恢复指定储藏
git stash pop stash@{0}
```

## 团队协作

### 代码审查清单

- [ ] 代码是否符合项目规范
- [ ] 是否有适当的测试
- [ ] 文档是否更新
- [ ] 性能是否有影响
- [ ] 安全性考虑

## 总结

良好的 Git 工作流能提升团队协作效率，减少代码冲突。
