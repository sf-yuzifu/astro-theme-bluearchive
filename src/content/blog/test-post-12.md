---
title: '测试文章 12 - GraphQL 入门与实践'
description: '学习 GraphQL 查询语言和 API 设计'
pubDate: '2024-02-20'
heroImage: '../../assets/blog-placeholder-2.jpg'
tags: ['GraphQL', 'API', '后端']
---

GraphQL 是一种用于 API 的查询语言，提供了更灵活、更高效的数据获取方式。

## 基础概念

### Schema 定义

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users: [User!]!
  post(id: ID!): Post
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, content: String!, authorId: ID!): Post!
}
```

## 查询示例

### 基础查询

```graphql
# 获取用户信息
query GetUser {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}

# 获取所有文章
query GetPosts {
  posts {
    id
    title
    author {
      name
    }
  }
}
```

### 变量和参数

```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
  }
}

# 变量
{
  "id": "123"
}
```

## Apollo Client

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache()
})

// 执行查询
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`

client.query({
  query: GET_USER,
  variables: { id: '123' }
}).then(result => console.log(result))
```

## 总结

GraphQL 提供了精确的数据获取能力，减少了过度获取和数据获取不足的问题。
