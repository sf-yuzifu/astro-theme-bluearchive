---
title: '测试文章 09 - 设计模式在前端开发中的应用'
description: '学习常见设计模式及其在前端开发中的实践'
pubDate: '2024-02-12'
heroImage: '../../assets/blog-placeholder-4.jpg'
tags: ['设计模式', 'JavaScript', '架构']
---

设计模式是解决常见问题的最佳实践。本文介绍一些在前端开发中常用的设计模式。

## 单例模式

确保一个类只有一个实例：

```javascript
class Singleton {
  static instance = null;
  
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

// 使用
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

## 观察者模式

事件订阅和通知机制：

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
```

## 工厂模式

创建对象的统一接口：

```javascript
class ComponentFactory {
  static create(type, props) {
    switch (type) {
      case 'button':
        return new Button(props);
      case 'input':
        return new Input(props);
      case 'select':
        return new Select(props);
      default:
        throw new Error(`Unknown component type: ${type}`);
    }
  }
}
```

## 策略模式

定义算法族，分别封装起来：

```javascript
const validationStrategies = {
  required: (value) => value !== '' || '此字段必填',
  email: (value) => /\S+@\S+\.\S+/.test(value) || '邮箱格式不正确',
  minLength: (value, length) => value.length >= length || `最少${length}个字符`,
};

function validate(value, rules) {
  for (const rule of rules) {
    const [strategy, ...args] = rule.split(':');
    const result = validationStrategies[strategy](value, ...args);
    if (result !== true) return result;
  }
  return true;
}
```

## 总结

合理使用设计模式能让代码更加模块化、可维护和可扩展。
