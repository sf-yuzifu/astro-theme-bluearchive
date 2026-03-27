import type { AstroIntegration } from "astro";
import path from "path";

/**
 * Astro 集成：监听 config.yml 变化并触发页面刷新
 */
export function configReloadIntegration(): AstroIntegration {
  return {
    name: "config-reload",
    hooks: {
      "astro:config:setup": ({ addWatchFile, command }) => {
        if (command === "dev") {
          // 获取 config.yml 的绝对路径
          const configPath = path.resolve("config.yml");

          // 告诉 Astro 监听这个文件
          addWatchFile(configPath);

          console.log(`[config-reload] Watching ${configPath}`);
        }
      },
    },
  };
}
