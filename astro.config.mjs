// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";
import astroExpressiveCode from "astro-expressive-code";
import { definePlugin } from "@expressive-code/core";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { remarkReadingTime } from "./src/utils/remarkReadingTime.mjs";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import icon from "astro-icon";
import Font from "vite-plugin-font";
import { configReloadIntegration } from "./src/integrations/configReload.ts";
import { loadConfig } from "./src/config/index.ts";
import bangumi from "astro-bangumi";

// 加载配置文件
const config = loadConfig();

// https://astro.build/config
export default defineConfig({
  site: config.site.url,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  build: {
    inlineStylesheets: "always",
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    astroExpressiveCode({
      themes: ["material-theme-lighter", "material-theme-darker"],
      useThemedScrollbars: false,
      defaultProps: {
        showLineNumbers: true,
        frame: "code",
      },
      plugins: [
        pluginLineNumbers(),
        definePlugin({
          name: "language-title-fallback",
          hooks: {
            preprocessMetadata: ({ codeBlock }) => {
              if (!codeBlock.props.title?.trim() && codeBlock.language) {
                codeBlock.props.title = codeBlock.language;
              }
            },
          },
        }),
      ],
      styleOverrides: {
        borderRadius: "12px",
        frames: {
          frameBoxShadowCssValue: "0px 0px 5px #c1c1c1",
          editorActiveTabIndicatorBottomColor: "var(--font-color-gold)",
          editorActiveTabIndicatorHeight: "5px",
        },
      },
      themeCssSelector: (theme) => {
        if (theme.name === "material-theme-darker") return `html[theme='dark']`;
        return `html:not([theme='dark'])`;
      },
    }),
    mdx({
      remarkPlugins: [remarkReadingTime],
    }),
    vue(),
    sitemap(),
    icon(),
    configReloadIntegration(),
    bangumi({
      vmid: config.bangumi.integration.vmid,
      title: config.bangumi.integration.title,
      lazyload: config.bangumi.integration.lazyload,
      coverMirror: config.bangumi.integration.coverMirror,
      category: config.bangumi.integration.category,
    }),
    AstroPWA({
      registerType: "autoUpdate",
      manifest: {
        name: config.site.title,
        short_name: config.site.title,
        description: config.site.description,
        theme_color: "#328cfa",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globDirectory: "dist",
        globPatterns: [
          "**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,otf,atlas,skel,ogg,mp3}",
        ],
        additionalManifestEntries: [
          { url: "/offline/index.html", revision: null },
          // 注意：favicon.svg 和 favicon.ico 已由 globPatterns 自动匹配，无需手动添加
        ],
        navigateFallback: "/offline/index.html",
        navigateFallbackDenylist: [
          /^\/.well-known\/host\.txt$/,
          /^\/.well-known\//,
          /^\/api\//,
          /^\/admin\//,
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        directoryIndex: "index.html",
        runtimeCaching: [
          // 页面路由缓存 - 使用 StaleWhileRevalidate 策略
          // 先返回缓存，同时在后台更新缓存
          {
            urlPattern: /\/$|\.html$/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "pages-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 博客文章页面缓存
          {
            urlPattern: /\/blog\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "blog-posts-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 其他页面缓存（标签、关于等）
          {
            urlPattern: /\/(tags|about|friends|donate|project)\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "other-pages-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Astro 生成的 JS/CSS 资源缓存
          {
            urlPattern: /\/_astro\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "astro-assets-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 图片资源缓存
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Favicon 缓存
          {
            urlPattern: /\/favicon\.(?:ico|svg|png)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "favicon-cache",
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Spine 资源缓存 (atlas, skel)
          {
            urlPattern: /\/spine_assets\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "spine-assets-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 音频资源缓存
          {
            urlPattern: /\.(?:ogg|mp3|wav|m4a)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // jsDelivr CDN
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "jsdelivr-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // 离线回退 - 捕获所有导航请求
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkOnly",
            options: {
              precacheFallback: {
                fallbackURL: "/offline/index.html",
              },
            },
          },
        ],
      },
    }),
  ],
  vite: {
    optimizeDeps: {
      include: [
        "@waline/client",
        "photoswipe/lightbox",
        "photoswipe",
        "astro-bangumi",
        "howler",
        "nprogress",
        "vue",
      ],
    },
    plugins: [
      Font.vite({
        // @ts-ignore
        css: {
          fontFamily: "Resource Han Rounded CN",
        },
      }),
    ],
  },
});
