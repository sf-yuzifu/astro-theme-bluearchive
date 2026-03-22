<template>
  <div style="display: none"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  mottos: string[]
}>()

let retryTimer: number | null = null
let typingTimer: number | null = null
let cleanup: (() => void) | null = null
let typingToken = 0

const clearRuntime = () => {
  if (retryTimer) {
    window.clearTimeout(retryTimer)
    retryTimer = null
  }
  if (typingTimer) {
    window.clearTimeout(typingTimer)
    typingTimer = null
  }
  if (cleanup) {
    cleanup()
    cleanup = null
  }
}

const bindWelcomeBox = () => {
  const welcomeBox = document.getElementById('welcome-box-el') as HTMLElement | null
  const infoBox = document.getElementById('info-box-el') as HTMLElement | null
  const mottoTextEl = document.getElementById('motto-text-el') as HTMLElement | null
  if (!welcomeBox || !infoBox || !mottoTextEl) return false

  if (cleanup) cleanup()
  if (typingTimer) {
    window.clearTimeout(typingTimer)
    typingTimer = null
  }

  const multiple = 30
  const getMouseAngle = (x: number, y: number) => {
    const radians = Math.atan2(y, x)
    let angle = radians * (180 / Math.PI)
    if (angle < 0) angle += 360
    return angle
  }

  const parallax = (e: MouseEvent | PointerEvent) => {
    window.requestAnimationFrame(() => {
      const box = welcomeBox.getBoundingClientRect()
      const calcY = (e.clientX - box.x - box.width / 2) / multiple
      const calcX = -(e.clientY - box.y - box.height / 2) / multiple
      const angle = Math.floor(
        getMouseAngle(e.clientY - box.y - box.height / 2, e.clientX - box.x - box.width / 2),
      )

      welcomeBox.style.transform = `rotateY(${calcY}deg) rotateX(${calcX}deg)`
      infoBox.style.background = `linear-gradient(${angle}deg, var(--infobox-background-initial), var(--infobox-background-final))`
    })
  }

  const reset = () => {
    welcomeBox.style.transform = 'rotateY(0deg) rotateX(0deg)'
    infoBox.style.background =
      'linear-gradient(0deg, var(--infobox-background-initial), var(--infobox-background-final))'
  }

  welcomeBox.style.pointerEvents = 'auto'
  welcomeBox.addEventListener('pointermove', parallax)
  welcomeBox.addEventListener('mousemove', parallax)
  welcomeBox.addEventListener('pointerleave', reset)
  welcomeBox.addEventListener('mouseleave', reset)

  cleanup = () => {
    welcomeBox.removeEventListener('pointermove', parallax)
    welcomeBox.removeEventListener('mousemove', parallax)
    welcomeBox.removeEventListener('pointerleave', reset)
    welcomeBox.removeEventListener('mouseleave', reset)
  }

  typingToken += 1
  const currentToken = typingToken
  const randomMotto = props.mottos[Math.floor(Math.random() * props.mottos.length)] || ''
  let index = 0
  mottoTextEl.textContent = ''

  const typeNext = () => {
    if (currentToken !== typingToken) return
    if (index < randomMotto.length) {
      mottoTextEl.textContent += randomMotto[index]
      index += 1
      typingTimer = window.setTimeout(typeNext, Math.random() * 150 + 50)
    }
  }

  typingTimer = window.setTimeout(typeNext, 220)
  return true
}

const scheduleBind = (retry = 0) => {
  const ready = bindWelcomeBox()
  if (ready || retry >= 24) return
  retryTimer = window.setTimeout(() => scheduleBind(retry + 1), 80)
}

onMounted(() => {
  scheduleBind()
})

onUnmounted(() => {
  clearRuntime()
})
</script>
