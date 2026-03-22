<template>
  <div style="display: none"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const LEAVE_MS = 260
const ENTER_MS = 560
let isTransitioning = false

const normalizePath = (path: string) => path.replace(/\/$/, '') || '/'
const isTagRoute = (path: string) => {
  const normalized = normalizePath(path)
  return normalized === '/tags' || normalized.startsWith('/tags/')
}

const sameRouteGuard = (event: MouseEvent) => {
  if (event.defaultPrevented) return
  if (event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const anchor = (event.target as HTMLElement | null)?.closest('a[href]') as HTMLAnchorElement | null
  if (!anchor) return
  if (anchor.target && anchor.target !== '_self') return
  if (anchor.hasAttribute('download')) return

  const targetUrl = new URL(anchor.href, window.location.origin)
  if (targetUrl.origin !== window.location.origin) return

  const currentPath = normalizePath(window.location.pathname)
  const targetPath = normalizePath(targetUrl.pathname)
  const samePath = currentPath === targetPath
  const sameSearch = window.location.search === targetUrl.search
  const hasHashJump = targetUrl.hash && targetUrl.hash !== window.location.hash

  if (samePath && sameSearch && !hasHashJump) {
    event.preventDefault()
  }
}

const beforeSwapHandler = (event: Event) => {
  const transitionEvent = event as Event & { swap?: () => void; from?: URL; to?: URL }
  if (!transitionEvent.swap) return

  const fromPath = transitionEvent.from?.pathname || window.location.pathname
  const toPath = transitionEvent.to?.pathname || fromPath
  const skipBannerTransition = isTagRoute(fromPath) && isTagRoute(toPath)
  const originalSwap = transitionEvent.swap
  transitionEvent.swap = () => {
    if (isTransitioning) {
      originalSwap()
      return
    }
    isTransitioning = true
    const leavingRoot = document.documentElement
    leavingRoot.classList.remove('route-entering')
    leavingRoot.classList.toggle('route-skip-banner', skipBannerTransition)
    leavingRoot.classList.add('route-leaving')

    window.setTimeout(() => {
      originalSwap()
      const enteringRoot = document.documentElement
      enteringRoot.classList.toggle('route-skip-banner', skipBannerTransition)
      enteringRoot.classList.add('route-entering')
      window.setTimeout(() => {
        enteringRoot.classList.remove('route-entering')
        enteringRoot.classList.remove('route-skip-banner')
        isTransitioning = false
      }, ENTER_MS)
    }, LEAVE_MS)
  }
}

onMounted(() => {
  document.addEventListener('click', sameRouteGuard, true)
  document.addEventListener('astro:before-swap', beforeSwapHandler)
})

onUnmounted(() => {
  document.removeEventListener('click', sameRouteGuard, true)
  document.removeEventListener('astro:before-swap', beforeSwapHandler)
})
</script>
