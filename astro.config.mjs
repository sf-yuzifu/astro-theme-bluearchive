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
      srcDir: "src",
      filename: "sw.js",
      strategies: "injectManifest",
      injectManifest: {
        globDirectory: "dist",
        globPatterns: [
          "**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,otf,atlas,skel,ogg,mp3,xml}",
        ],
        additionalManifestEntries: [
          { url: "/offline/index.html", revision: null },
          { url: "/404.html", revision: null },
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
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
