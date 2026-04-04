<template>
  <div v-if="enabled && hasConfig && spineVisible" class="spine-player-wrapper">
    <div
      ref="playerContainer"
      class="playerContainer"
      :style="playerContainerStyle"
      @click="handlePlayerClick"
      @touchstart="handlePlayerClick"
    ></div>
    <transition name="fade">
      <div v-if="showDialog" class="chatdialog-container">
        <div class="chatdialog-triangle"></div>
        <div class="chatdialog">{{ currentDialog }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, onUnmounted, nextTick } from "vue";
import { Application, Assets } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import {
  SkeletonBinary,
  AtlasAttachmentLoader,
  Physics,
} from "@esotericsoftware/spine-core";

interface VoiceConfig {
  audio: string;
  animation: string;
  text: string;
}

interface SpineAssets {
  skelUrl: string;
  atlasUrl: string;
  idleAnimationName: string;
  eyeCloseAnimationName: string;
  rightEyeBone: string;
  leftEyeBone: string;
  frontHeadBone: string;
  backHeadBone: string;
  eyeRotationAngle: number;
  voiceConfig: VoiceConfig[];
  copyConfig?: {
    audio?: string;
    animation: string;
    text: string;
  };
  offset?: {
    left?: string;
    bottom?: string;
  };
}

interface SpineAssetsMap {
  arona: SpineAssets;
  plana: SpineAssets;
}

import type { SpineCharactersConfig, SpineCopyConfig } from "../config";

const props = defineProps<{
  enabled?: boolean;
  spineVoiceLang?: "zh" | "jp";
  characters?: SpineCharactersConfig;
}>();

// 全局复制事件处理器引用（用于在模块级别添加/移除监听）
let globalCopyHandler: ((e: Event) => void) | null = null;

// 在模块加载时立即添加复制事件监听（不依赖 Vue 生命周期）
if (typeof window !== "undefined") {
  setTimeout(() => {
    // 监听原生复制事件
    const copyHandler = (e: Event) => {
      // 调用组件内的事件处理器（如果已初始化）
      if (globalCopyHandler) {
        globalCopyHandler(e);
      }
    };
    window.addEventListener("copy", copyHandler, true);

    // 监听代码框复制按钮事件
    const codeCopyHandler = (e: CustomEvent) => {
      // 调用组件内的事件处理器（如果已初始化）
      if (globalCopyHandler) {
        // 创建一个模拟的 ClipboardEvent
        globalCopyHandler(e as unknown as Event);
      }
    };
    window.addEventListener("code-copy", codeCopyHandler as EventListener);
  }, 100);
}

// 监听主题变化
const isDarkMode = ref(false);

// 看板娘显示状态
const spineVisible = ref(true);

// 检查看板娘是否显示
const checkSpineVisible = () => {
  const visible = localStorage.getItem("spine-enabled") !== "false";
  spineVisible.value = visible;
  return visible;
};

// 监听 localStorage 变化
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === "spine-enabled") {
    const visible = e.newValue !== "false";
    spineVisible.value = visible;
    if (visible) {
      debouncedInitialize();
    } else {
      cleanup();
    }
  }
};

// 监听自定义事件
const handleSpineToggle = (e: CustomEvent) => {
  const { enabled } = e.detail;
  spineVisible.value = enabled;
  if (enabled) {
    debouncedInitialize();
  } else {
    cleanup();
  }
};

const updateTheme = () => {
  const theme = document.documentElement.getAttribute("theme");
  isDarkMode.value = theme === "dark";
};

onMounted(() => {
  // 初始获取主题
  updateTheme();

  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "theme") {
        updateTheme();
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["theme"],
  });

  // 清理
  onUnmounted(() => {
    observer.disconnect();
  });
});

// 检查是否有配置
const hasConfig = computed(() => !!props.characters);

// 从配置构建 spine 资产 - 使用函数返回以支持动态语言
const getSpineAssets = (lang: string): SpineAssetsMap | null => {
  const chars = props.characters;
  if (!chars) {
    return null;
  }

  // 替换音频路径中的 {lang} 占位符
  const replaceLang = (path: string) => path.replace(/{lang}/g, lang);

  return {
    arona: {
      ...chars.arona,
      voiceConfig: chars.arona.voiceConfig.map((v) => ({
        ...v,
        audio: replaceLang(v.audio),
      })),
      // 处理复制配置的音频路径
      copyConfig: chars.arona.copyConfig
        ? {
            ...chars.arona.copyConfig,
            audio: chars.arona.copyConfig.audio
              ? replaceLang(chars.arona.copyConfig.audio)
              : undefined,
          }
        : undefined,
      // 传递位置偏移配置
      offset: chars.arona.offset,
    },
    plana: {
      ...chars.plana,
      voiceConfig: chars.plana.voiceConfig.map((v) => ({
        ...v,
        audio: replaceLang(v.audio),
      })),
      // 处理复制配置的音频路径
      copyConfig: chars.plana.copyConfig
        ? {
            ...chars.plana.copyConfig,
            audio: chars.plana.copyConfig.audio
              ? replaceLang(chars.plana.copyConfig.audio)
              : undefined,
          }
        : undefined,
      // 传递位置偏移配置
      offset: chars.plana.offset,
    },
  };
};

const playerContainer = ref<HTMLElement | null>(null);
let app: Application | null = null;
let spineInstance: Spine | null = null;
let blinkInterval: ReturnType<typeof setTimeout> | null = null;
let isEyeControlDisabled = ref(false);
let eyeControlTimer: ReturnType<typeof setTimeout> | null = null;
let currentAnimationState: any = null;
let currentCharacter = ref<"arona" | "plana">("arona");

// 添加客户端就绪状态
const clientReady = ref(false);

// 添加音频上下文管理器
const AudioManager = {
  context: null as AudioContext | null,
  buffers: new Map<string, { buffer: AudioBuffer; lastUsed: number }>(),
  currentSource: null as AudioBufferSourceNode | null,
  gainNode: null as GainNode | null,

  initialize() {
    if (!clientReady.value) return;
    if (!this.context) {
      this.context = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      // 创建增益节点，设置音量为50%
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = 0.5;
      this.gainNode.connect(this.context.destination);
    }
  },

  async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(url)) {
      const entry = this.buffers.get(url)!;
      entry.lastUsed = Date.now();
      return entry.buffer;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context!.decodeAudioData(arrayBuffer);
      this.buffers.set(url, { buffer: audioBuffer, lastUsed: Date.now() });
      return audioBuffer;
    } catch (error) {
      console.error("音频加载失败:", error);
      return null;
    }
  },

  async playAudio(buffer: AudioBuffer): Promise<void> {
    if (this.currentSource) {
      this.currentSource.stop();
    }

    return new Promise((resolve) => {
      const source = this.context!.createBufferSource();
      source.buffer = buffer;
      // 连接到增益节点而不是直接连接到目标
      source.connect(this.gainNode!);
      source.onended = () => {
        if (this.currentSource === source) {
          this.currentSource = null;
        }
        resolve();
      };
      this.currentSource = source;
      source.start();
    });
  },

  clear() {
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    this.buffers.clear();
  },

  gc() {
    // 清除超过5分钟未使用的音频缓存
    const now = Date.now();
    for (const [url, entry] of this.buffers.entries()) {
      if (now - entry.lastUsed > 300000) {
        // 5分钟
        this.buffers.delete(url);
      }
    }
  },
};

// 修改预加载音频函数
const preloadAudio = async () => {
  if (!currentAssets.value) return false;

  AudioManager.initialize();
  AudioManager.gc(); // 清理过期缓存

  const loadPromises = currentAssets.value.voiceConfig.map((pair) =>
    AudioManager.loadAudioFile(pair.audio),
  );

  return Promise.all(loadPromises).catch((error) => {
    console.error("音频预加载失败:", error);
    return false;
  });
};

const handleScroll = () => {
  if (!clientReady.value || !playerContainer.value) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;

  // 获取 footer 元素
  const footer = document.querySelector("footer");
  if (!footer) return;

  const footerRect = footer.getBoundingClientRect();
  const playerRect = playerContainer.value.getBoundingClientRect();

  // 看板娘的底部位置（相对于视口）
  const playerBottom = playerRect.bottom;
  // footer 的顶部位置（相对于视口）
  const footerTop = footerRect.top;

  // 原始 bottom 值
  const originalBottom = 25;

  // 如果看板娘底部和 footer 重叠
  if (playerBottom > footerTop) {
    // 计算重叠量
    const overlap = playerBottom - footerTop;
    // 新的 bottom 值 = 原始值 + 重叠量 + 额外间距
    const newBottom = originalBottom + overlap + 20;
    playerContainer.value.style.bottom = `${newBottom}px`;
  } else {
    // 恢复原始位置
    playerContainer.value.style.bottom = `${originalBottom}px`;
  }

  // 移动端额外处理：滚动到底部时隐藏
  if (isMobileDevice()) {
    const distanceToBottom = docHeight - (scrollTop + windowHeight);
    const bottomReached = distanceToBottom <= 1;
    if (bottomReached) {
      playerContainer.value.style.left = "-50%";
    } else {
      playerContainer.value.style.left = "0%";
    }
  }
};

// 更新对话框位置，使其居中于 playerContainer
const updateChatDialogPosition = () => {
  if (!clientReady.value || !playerContainer.value) return;

  const chatDialogContainer = document.querySelector(
    ".chatdialog-container",
  ) as HTMLElement | null;

  if (!chatDialogContainer) return;

  const containerRect = playerContainer.value.getBoundingClientRect();
  const dialogWidth = chatDialogContainer.offsetWidth;
  const dialogHeight = chatDialogContainer.offsetHeight;

  // 计算水平居中位置：容器中心 - 对话框宽度的一半
  const centerPositionX =
    containerRect.left + containerRect.width / 2 - dialogWidth / 2;
  // 计算垂直居中位置：容器中心 - 对话框高度的一半
  const centerPositionY =
    containerRect.top + containerRect.height / 2 - dialogHeight / 2;

  // 确保不会超出屏幕边界
  const minLeft = 10;
  const finalLeft = Math.max(minLeft, centerPositionX);
  const finalTop = Math.max(10, centerPositionY);

  chatDialogContainer.style.left = `${finalLeft}px`;
  chatDialogContainer.style.top = `${finalTop}px`;
  chatDialogContainer.style.bottom = "auto"; // 清除 bottom 定位
};

const isMobileDevice = () => {
  if (!clientReady.value) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

let isPlaying = false; // 添加播放状态标志
let isDialogPlaying = false; // 对话播放状态标志，用于控制眨眼动画

const showDialog = ref(false);
const currentDialog = ref("");

let lastPlayedIndex = -1; // 添加上一次播放的索引记录

// 添加防抖处理
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  } as T;
};

// 在组件作用域添加重置状态引用
const resetBonesState = ref<(() => void) | null>(null);

// 点击处理函数
const handlePlayerClick = debounce(async (event: MouseEvent | TouchEvent) => {
  event.preventDefault();
  event.stopPropagation();

  // 检查是否正在播放
  if (!isPlaying) {
    isPlaying = true;
    isDialogPlaying = true; // 标记对话播放中，暂停眨眼动画
    isEyeControlDisabled.value = true;

    // 点击时重置眼睛位置
    resetBonesState.value?.();

    if (!spineAssets.value) return;
    const currentConfig = spineAssets.value[currentCharacter.value].voiceConfig;
    if (!currentConfig || currentConfig.length === 0) return;

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * currentConfig.length);
    } while (randomIndex === lastPlayedIndex && currentConfig.length > 1);

    lastPlayedIndex = randomIndex;
    const selectedPair = currentConfig[randomIndex];

    try {
      const buffer = await AudioManager.loadAudioFile(selectedPair.audio);
      if (!buffer) throw new Error("音频加载失败");

      currentDialog.value = selectedPair.text;
      showDialog.value = true;

      // 更新对话框位置使其居中
      nextTick(() => {
        updateChatDialogPosition();
      });

      // 播放动画
      if (spineInstance && selectedPair.animation) {
        spineInstance.state.setAnimation(2, selectedPair.animation, false);
      }

      // 播放音频并等待结束
      await AudioManager.playAudio(buffer);

      // 音频播放结束后清理状态
      isPlaying = false;
      isDialogPlaying = false; // 对话播放结束，恢复眨眼动画
      isEyeControlDisabled.value = false;
      if (spineInstance) {
        spineInstance.state.setEmptyAnimation(2, 0);
      }
      showDialog.value = false;
    } catch (error) {
      console.error("音频播放失败:", error);
      isPlaying = false;
      isDialogPlaying = false; // 对话播放结束，恢复眨眼动画
      isEyeControlDisabled.value = false;
      showDialog.value = false;
    }
  }
}, 300);

// 复制事件处理函数（不使用防抖，避免引用问题）
const handleCopyEvent = async (event: Event) => {
  // 检查组件是否已初始化（spineAssets 是否有值）
  if (!spineAssets.value) {
    return;
  }

  const currentConfig = currentAssets.value;

  // 检查是否有复制配置
  if (!currentConfig?.copyConfig) {
    return;
  }

  const copyConfig: SpineCopyConfig = currentConfig.copyConfig;

  // 检查是否正在播放
  if (isPlaying) {
    return;
  }

  isPlaying = true;
  isDialogPlaying = true;
  isEyeControlDisabled.value = true;

  // 重置眼睛位置
  resetBonesState.value?.();

  try {
    // 显示对话框（先显示，再播放音频）
    currentDialog.value = copyConfig.text;
    showDialog.value = true;

    // 更新对话框位置
    nextTick(() => {
      updateChatDialogPosition();
    });

    // 播放动画
    if (spineInstance && copyConfig.animation) {
      spineInstance.state.setAnimation(2, copyConfig.animation, false);
    }

    const startTime = Date.now();

    // 如果有音频配置，加载并播放
    if (copyConfig.audio) {
      const buffer = await AudioManager.loadAudioFile(copyConfig.audio);
      if (buffer) {
        await AudioManager.playAudio(buffer);
      }
    }

    // 等待动画和音频播放完成（至少显示2秒）
    const minDisplayTime = 2000;
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minDisplayTime) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDisplayTime - elapsedTime),
      );
    }

    // 清理状态
    isPlaying = false;
    isDialogPlaying = false;
    isEyeControlDisabled.value = false;
    if (spineInstance) {
      spineInstance.state.setEmptyAnimation(2, 0);
    }
    showDialog.value = false;
  } catch (error) {
    console.error("[SpinePlayer] 复制事件处理失败:", error);
    isPlaying = false;
    isDialogPlaying = false;
    isEyeControlDisabled.value = false;
    showDialog.value = false;
  }
};

// 提升 moveBones 函数到组件作用域以便在其他地方使用
let moveBonesHandler: ((event: MouseEvent) => void) | null = null;

// ResizeObserver 用于监听容器大小变化
let resizeObserver: ResizeObserver | null = null;

// 存储当前骨骼比例，用于resize时重新计算
let currentSkeletonAspectRatio = 1;

const initializeSpinePlayer = async (assets: SpineAssets) => {
  try {
    // 清理旧的实例
    if (blinkInterval) {
      clearTimeout(blinkInterval);
    }

    // 清理容器内容
    if (playerContainer.value) {
      playerContainer.value.innerHTML = "";
    }

    // 销毁旧的 Pixi 应用
    if (app) {
      app.destroy(true, { children: true, texture: true });
      app = null;
    }

    if (!playerContainer.value) return;

    // 创建 Pixi 应用 - 使用高分辨率渲染
    const scaleFactor = 2; // 渲染倍率，可以调整
    app = new Application();
    await app.init({
      width: playerContainer.value.clientWidth * scaleFactor,
      height: playerContainer.value.clientHeight * scaleFactor,
      backgroundAlpha: 0,
      antialias: true,
      resolution: 1, // 使用1，因为我们手动缩放canvas
    });

    playerContainer.value.appendChild(app.canvas);

    // 加载 Spine 资源
    try {
      // 加载 atlas 文件
      const atlas = await Assets.load(assets.atlasUrl);

      // 加载 skel 文件为二进制数据
      const response = await fetch(assets.skelUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch skeleton: ${response.status} ${response.statusText}`,
        );
      }
      const skeletonData = new Uint8Array(await response.arrayBuffer());

      // 使用 SkeletonBinary 解析
      const attachmentLoader = new AtlasAttachmentLoader(atlas);
      const parser = new SkeletonBinary(attachmentLoader);
      const skeletonDataParsed = parser.readSkeletonData(skeletonData);

      // 创建 Spine 实例
      spineInstance = new Spine({
        skeletonData: skeletonDataParsed,
        autoUpdate: true,
      });
    } catch (error) {
      console.error("Failed to load spine assets or create instance:", error);
      throw error;
    }

    // 计算自适应缩放比例
    // 先更新一次骨骼以获取正确的边界
    spineInstance.skeleton.updateWorldTransform(Physics.update);

    // 获取 Spine 动画的原始边界
    const bounds = spineInstance.skeleton.getBoundsRect();
    const skeletonWidth = bounds.width || 500;
    const skeletonHeight = bounds.height || 500;

    // 计算骨骼的宽高比
    const skeletonAspectRatio = skeletonWidth / skeletonHeight;
    // 存储比例供 resize 使用
    currentSkeletonAspectRatio = skeletonAspectRatio;

    // 获取容器高度（CSS 控制）
    const containerHeight = playerContainer.value.clientHeight;
    // 根据骨骼比例计算容器宽度
    const containerWidth = containerHeight * skeletonAspectRatio;

    // 设置容器宽度
    playerContainer.value.style.width = `${containerWidth}px`;

    // 计算缩放比例，使动画填满容器高度
    const scale = containerHeight / skeletonHeight;

    // 设置 ResizeObserver 监听容器高度变化
    if (!resizeObserver && playerContainer.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newHeight = entry.contentRect.height;
          const newWidth = newHeight * currentSkeletonAspectRatio;
          playerContainer.value!.style.width = `${newWidth}px`;

          // 重新调整 Pixi canvas 大小
          if (app && spineInstance) {
            const scaleFactor = 2;
            app.renderer.resize(
              newWidth * scaleFactor,
              newHeight * scaleFactor,
            );

            // 重新计算缩放和位置
            const newScale = newHeight / skeletonHeight;
            spineInstance.scale.set(newScale * scaleFactor);
            spineInstance.position.set(
              -bounds.x * newScale * scaleFactor, // 水平靠左对齐
              (newHeight - (bounds.y + bounds.height) * newScale) * scaleFactor, // 底部对齐
            );
          }

          // 如果对话框正在显示，更新其位置
          if (showDialog.value) {
            updateChatDialogPosition();
          }
        }
      });
      resizeObserver.observe(playerContainer.value);
    }

    // 设置 Spine 实例大小和位置（需要乘以 scaleFactor 因为 canvas 放大了）
    spineInstance.scale.set(scale * scaleFactor);
    // 水平靠左，底部对齐
    spineInstance.position.set(
      -bounds.x * scale * scaleFactor, // 水平靠左对齐
      (containerHeight - (bounds.y + bounds.height) * scale) * scaleFactor, // 底部对齐
    );

    // 启用高质量渲染
    spineInstance.batched = false;

    app.stage.addChild(spineInstance);

    // 播放待机动画
    if (assets.idleAnimationName) {
      spineInstance.state.setAnimation(0, assets.idleAnimationName, true);
    }

    const skeleton = spineInstance.skeleton;
    const animationState = spineInstance.state;
    currentAnimationState = animationState;

    const rightEyeBone = assets.rightEyeBone
      ? skeleton.findBone(assets.rightEyeBone)
      : null;
    const leftEyeBone = assets.leftEyeBone
      ? skeleton.findBone(assets.leftEyeBone)
      : null;
    const frontHeadBone = assets.frontHeadBone
      ? skeleton.findBone(assets.frontHeadBone)
      : null;
    const backHeadBone = assets.backHeadBone
      ? skeleton.findBone(assets.backHeadBone)
      : null;

    const rightEyeCenterX = rightEyeBone ? rightEyeBone.data.x : 0;
    const rightEyeCenterY = rightEyeBone ? rightEyeBone.data.y : 0;
    const leftEyeCenterX = leftEyeBone ? leftEyeBone.data.x : 0;
    const leftEyeCenterY = leftEyeBone ? leftEyeBone.data.y : 0;
    const frontHeadCenterX = frontHeadBone ? frontHeadBone.data.x : 0;
    const frontHeadCenterY = frontHeadBone ? frontHeadBone.data.y : 0;
    const backHeadCenterX = backHeadBone ? backHeadBone.data.x : 0;
    const backHeadCenterY = backHeadBone ? backHeadBone.data.y : 0;

    // 骨骼移动限制
    const maxRadius = 15;
    const frontHeadMaxRadius = 2;
    const backHeadMaxRadius = 1;

    function rotateVector(x: number, y: number, angle: number) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: x * cos - y * sin,
        y: x * sin + y * cos,
      };
    }

    function moveBones(event: MouseEvent) {
      // 如果眼睛控制被禁用，直接返回
      if (isEyeControlDisabled.value) return;
      if (!playerContainer.value) return;

      const containerRect = playerContainer.value.getBoundingClientRect();

      const mouseX =
        event.clientX - (containerRect.right - containerRect.width / 2);
      const mouseY =
        event.clientY - (containerRect.bottom - (containerRect.height * 4) / 5);

      // 将鼠标坐标偏移量进行逆旋转
      const eyeRotation = assets.eyeRotationAngle * (Math.PI / 180); // 眼睛旋转角度
      const rotatedMouse = rotateVector(mouseX, mouseY, -eyeRotation);
      const offsetX = rotatedMouse.x;
      const offsetY = rotatedMouse.y;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

      const angle = Math.atan2(offsetY, offsetX);
      const maxDistance = Math.min(distance, maxRadius);
      const dx = -maxDistance * Math.cos(angle);
      const dy = maxDistance * Math.sin(angle);

      // 眼睛移动
      if (rightEyeBone) {
        rightEyeBone.x = rightEyeCenterX + dx;
        rightEyeBone.y = rightEyeCenterY + dy;
      }

      if (leftEyeBone) {
        leftEyeBone.x = leftEyeCenterX + dx;
        leftEyeBone.y = leftEyeCenterY + dy;
      }

      // 头部轻微移动
      const frontHeadDx =
        Math.min(distance, frontHeadMaxRadius) * Math.cos(angle);
      const frontHeadDy =
        Math.min(distance, frontHeadMaxRadius) * Math.sin(angle);

      const backHeadDx =
        Math.min(distance, backHeadMaxRadius) * Math.cos(angle);
      const backHeadDy =
        Math.min(distance, backHeadMaxRadius) * Math.sin(angle);

      if (frontHeadBone) {
        frontHeadBone.x = frontHeadCenterX - frontHeadDx;
        frontHeadBone.y = frontHeadCenterY + frontHeadDy;
      }

      if (backHeadBone) {
        backHeadBone.x = backHeadCenterX + backHeadDx;
        backHeadBone.y = backHeadCenterY - backHeadDy;
      }

      skeleton.updateWorldTransform(Physics.update);
    }

    function resetBones() {
      if (rightEyeBone) {
        rightEyeBone.x = rightEyeCenterX;
        rightEyeBone.y = rightEyeCenterY;
      }

      if (leftEyeBone) {
        leftEyeBone.x = leftEyeCenterX;
        leftEyeBone.y = leftEyeCenterY;
      }

      if (frontHeadBone) {
        frontHeadBone.x = frontHeadCenterX;
        frontHeadBone.y = frontHeadCenterY;
      }

      if (backHeadBone) {
        backHeadBone.x = backHeadCenterX;
        backHeadBone.y = backHeadCenterY;
      }

      skeleton.updateWorldTransform(Physics.update);
    }

    // 保存重置函数引用
    resetBonesState.value = resetBones;

    function playBlinkAnimation() {
      // 如果正在播放对话动画，跳过本次眨眼，稍后重试
      if (isDialogPlaying) {
        blinkInterval = setTimeout(playBlinkAnimation, 500); // 500ms后重试
        return;
      }

      const randomTime = Math.random() * 3 + 3; // 5-8秒的随机间隔
      const shouldDoubleBlink = Math.random() > 0.5; // 随机决定是否连续播放两次

      if (assets.eyeCloseAnimationName) {
        animationState.setAnimation(1, assets.eyeCloseAnimationName, false); // 在轨道1上播放眨眼动画

        if (shouldDoubleBlink) {
          animationState.addAnimation(
            1,
            assets.eyeCloseAnimationName,
            false,
            0.1,
          ); // 短暂停留后再播放一次
        }
      }

      // 随机时间后再调用眨眼动画
      blinkInterval = setTimeout(playBlinkAnimation, randomTime * 1000);
    }

    // 修改鼠标移动监听器的添加逻辑
    if (!isMobileDevice()) {
      moveBonesHandler = moveBones;
      window.addEventListener("mousemove", moveBonesHandler);
    }
    playBlinkAnimation();

    // autoUpdate 已经设置为 true，不需要手动更新
  } catch (err) {
    console.error("Failed to initialize spine player:", err);
  }
};

// 将需要监听的状态提取为响应式引用
const enabled = computed(() => props.enabled !== false);
const spineVoiceLang = computed(() => props.spineVoiceLang || "zh");
const spineAssets = computed(() => getSpineAssets(spineVoiceLang.value));
const currentAssets = computed(
  () => spineAssets.value?.[currentCharacter.value],
);

// 计算 playerContainer 的样式（支持位置偏移配置）
const playerContainerStyle = computed(() => {
  const offset = currentAssets.value?.offset;
  if (!offset) return {};

  const style: Record<string, string> = {};
  if (offset.left !== undefined) {
    style.left = offset.left;
  }
  if (offset.bottom !== undefined) {
    style.bottom = offset.bottom;
  }
  return style;
});

// 事件委托
const handleEvents = (event: Event) => {
  if (event.type === "scroll") {
    handleScroll();
  } else if (["mousemove", "touchmove"].includes(event.type)) {
    moveBonesHandler?.(event as MouseEvent);
  }
};

// 统一的清理函数
const cleanup = () => {
  if (blinkInterval) clearTimeout(blinkInterval);
  if (eyeControlTimer) clearTimeout(eyeControlTimer);

  // 注意：scroll 事件监听器在 onMounted 中添加，只在 onUnmounted 中移除
  // 不在这里移除，避免 cleanup 调用时移除事件监听器

  if (moveBonesHandler && !isMobileDevice()) {
    window.removeEventListener("mousemove", moveBonesHandler);
    moveBonesHandler = null;
  }
  // 注意：复制事件监听在模块级别只添加一次，不在此处清理
  // 也不清理 globalCopyHandler，因为它在 onMounted 中重新赋值

  // 清理 ResizeObserver
  if (resizeObserver && playerContainer.value) {
    resizeObserver.unobserve(playerContainer.value);
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (playerContainer.value) {
    playerContainer.value.innerHTML = "";
  }

  if (app) {
    app.destroy(true, { children: true, texture: true });
    app = null;
    spineInstance = null;
  }

  AudioManager.clear();
};

// 初始化函数
const initializeCharacter = async () => {
  cleanup();

  if (!enabled.value || !playerContainer.value || !currentAssets.value) return;

  currentCharacter.value = isDarkMode.value ? "plana" : "arona";

  try {
    await Promise.all([
      preloadAudio(),
      initializeSpinePlayer(currentAssets.value),
    ]);
  } catch (err) {
    console.error("初始化失败:", err);
  }
};

const debouncedInitialize = debounce(initializeCharacter, 300);

// 监听主题切换和spine开关
watch(
  [isDarkMode, enabled],
  async ([dark, enabledValue], [prevDark, prevEnabled]) => {
    if (enabledValue !== prevEnabled) {
      if (enabledValue) {
        // 启用时初始化
        debouncedInitialize();
      } else {
        // 禁用时清理资源
        cleanup();
      }
    } else if (enabledValue && dark !== prevDark) {
      // 主题变更且启用状态下重新初始化
      debouncedInitialize();
    }
  },
  { immediate: true },
);

onMounted(() => {
  // 设置客户端就绪状态
  clientReady.value = true;

  // 初始化看板娘显示状态
  checkSpineVisible();

  const options = { passive: true } as AddEventListenerOptions;
  window.addEventListener("scroll", handleEvents, options);
  if (!isMobileDevice()) {
    window.addEventListener("mousemove", handleEvents, options);
  }

  // 监听 localStorage 变化
  window.addEventListener("storage", handleStorageChange);

  // 监听自定义切换事件
  window.addEventListener("spine-toggle", handleSpineToggle as EventListener);

  // 监听页面切换事件，确保在视图过渡后重新赋值全局处理器
  const handlePageSwap = () => {
    globalCopyHandler = handleCopyEvent;
    checkSpineVisible();
  };
  document.addEventListener("astro:after-swap", handlePageSwap);

  // 如果启用了Spine播放器且设置为显示，初始化
  if (enabled.value && spineVisible.value) {
    debouncedInitialize();
  }

  // 延迟赋值 globalCopyHandler，确保在 initializeCharacter/cleanup 执行之后
  setTimeout(() => {
    globalCopyHandler = handleCopyEvent;
  }, 500);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener("scroll", handleEvents);
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener(
    "spine-toggle",
    handleSpineToggle as EventListener,
  );
});
</script>

<style lang="less">
.spine-player-wrapper {
  /* 包裹容器，用于继承 transition:persist 属性 */
}

.playerContainer {
  position: fixed;
  bottom: 25px;
  left: 3%;
  z-index: 100;
  height: 45vh; /* 固定高度 */
  width: auto; /* 宽度自适应 */
  min-height: 300px;
  filter: drop-shadow(0 0 3px rgba(40, 42, 44, 0.42));
  cursor: pointer;
  transition:
    opacity 0.3s ease,
    bottom 0.3s ease;

  &:hover {
    opacity: 1;
  }

  // 让 canvas 填满容器
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
}

.chatdialog-container {
  position: fixed;
  top: 50%; /* 初始位置，会被 JS 动态覆盖 */
  left: 20px; /* 初始位置，会被 JS 动态覆盖 */
  z-index: 101;
  transition: opacity 0.3s ease; /* 只保留透明度过渡 */
  pointer-events: none;
  filter: drop-shadow(0 0 3px rgba(36, 36, 36, 0.6));
}

.chatdialog-triangle {
  position: absolute;
  left: 60px;
  top: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid rgba(255, 255, 255, 0.9);
  z-index: 101;
}

.chatdialog {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 12px 24px;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
  color: #000000;
  font-size: 20px;
  user-select: none;
  pointer-events: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1440px) {
  .playerContainer {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .playerContainer {
    display: none; // 移动端隐藏
  }

  .chatdialog-container {
    display: none; // 移动端隐藏对话框
  }
}
</style>
