---
title: '测试文章 11 - Vue 3 组合式 API 深入理解'
description: '掌握 Vue 3 Composition API 的核心概念和最佳实践'
pubDate: '2024-02-18'
heroImage: '../../assets/blog-placeholder-1.jpg'
tags: ['Vue', '前端', 'JavaScript']
---

Vue 3 的组合式 API 提供了一种更灵活、更强大的组织组件逻辑的方式。

## setup 函数

```vue
<script setup>
import { ref, computed, watch } from 'vue'

// 响应式状态
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
watch(count, (newVal) => {
  console.log('Count changed:', newVal)
})
</script>
```

## 可复用逻辑

### 自定义 Composable

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

## 响应式系统

### ref vs reactive

```javascript
import { ref, reactive } from 'vue'

// ref - 适用于基本类型
const count = ref(0)
console.log(count.value) // 0

// reactive - 适用于对象
const state = reactive({
  name: 'Vue',
  version: 3
})
console.log(state.name) // Vue
```

## 依赖注入

```vue
<!-- 父组件 -->
<script setup>
import { provide } from 'vue'

provide('user', {
  name: 'John',
  age: 30
})
</script>

<!-- 子组件 -->
<script setup>
import { inject } from 'vue'

const user = inject('user')
</script>
```

## 总结

组合式 API 让代码组织更加灵活，特别适合大型应用和逻辑复用。
