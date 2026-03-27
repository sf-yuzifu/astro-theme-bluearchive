---
title: '测试文章 04 - React Hooks 最佳实践'
description: '掌握 React Hooks 的使用技巧和常见陷阱'
pubDate: '2024-01-25'
heroImage: '../../assets/blog-placeholder-4.jpg'
tags: ['React', 'Hooks', '前端']
---

React Hooks 彻底改变了我们编写 React 组件的方式。本文分享一些最佳实践和常见陷阱。

## useState 使用技巧

### 函数式更新

当新状态依赖于旧状态时，使用函数式更新：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(prev => prev + 1);  // 推荐
    // setCount(count + 1);  // 可能有问题
  };
}
```

### 惰性初始化

对于复杂初始状态，使用惰性初始化：

```jsx
const [state, setState] = useState(() => {
  return expensiveComputation();
});
```

## useEffect 依赖管理

正确管理依赖数组是避免 bug 的关键：

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);
  }, 1000);
  
  return () => clearInterval(timer);
}, [count]);  // 确保包含所有依赖
```

## 自定义 Hooks

提取可复用逻辑到自定义 Hooks：

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}
```

## 性能优化

使用 `useMemo` 和 `useCallback` 优化性能：

```jsx
const memoizedValue = useMemo(() => {
  return expensiveComputation(a, b);
}, [a, b]);

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

## 总结

遵循这些最佳实践，能让你的 Hooks 代码更加健壮和高效。
