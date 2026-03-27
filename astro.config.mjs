// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import astroExpressiveCode from "astro-expressive-code";
import { definePlugin } from "@expressive-code/core";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { remarkReadingTime } from "./src/utils/remarkReadingTime.mjs";
import icon from "astro-icon";
import { configReloadIntegration } from "./src/integrations/configReload.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [
    astroExpressiveCode({
      themes: ["material-theme-lighter", "material-theme-darker"],
      useThemedScrollbars: false,
      defaultProps: {
        showLineNumbers: true,
        frame: "auto",
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
          editorActiveTabIndicatorHeight: "3px",
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
  ],
  vite: {
    optimizeDeps: {
      include: ["@waline/client", "photoswipe/lightbox", "photoswipe"],
    },
  },
});
