import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { BangumiSource } from "astro-bangumi";

// 配置文件路径（项目根目录）
const CONFIG_PATH = path.resolve("config.yml");

// 配置类型定义
export interface SocialLink {
  icon: string;
  url: string;
}

export interface ICPRecord {
  text: string;
  url?: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  avatar: string;
  favicon: string;
  faviconDark?: string;
  url: string;
  lang: string;
  icp?: string | ICPRecord[];
  social?: SocialLink[];
}

export interface NavItem {
  name: string;
  url: string;
}

export interface Friend {
  name: string;
  url: string;
  description: string;
  avatar?: string;
}

export interface FriendsConfig {
  enable: boolean;
  title: string;
  description: string;
  list: Friend[];
}

export interface Project {
  name: string;
  url: string;
  description: string;
  tags?: string[];
  image?: string;
  icon?: string;
}

export interface ProjectsConfig {
  enable: boolean;
  title: string;
  description: string;
  list: Project[];
}

export interface WalineConfig {
  serverURL: string;
  placeholder?: string;
  dark?: string;
  lang?: string;
  requiredMeta?: string[];
  pageview?: boolean;
  comment?: boolean;
}

export interface CommentsConfig {
  enable: boolean;
  type: "waline" | "giscus" | "twikoo";
  waline?: WalineConfig;
}

export interface SponsorMethod {
  name: string;
  image?: string;
  url?: string;
  icon: string;
  color: string;
}

export interface SponsorConfig {
  enable: boolean;
  title: string;
  description: string;
  methods: SponsorMethod[];
}

export interface FooterLink {
  name: string;
  url: string;
}

export interface FooterConfig {
  copyright: string;
  icp?: string;
  links: FooterLink[];
}

export interface SEOConfig {
  ogImage: string;
  keywords: string[];
  twitter?: string;
}

export interface FeaturesConfig {
  search: boolean;
  backToTop: boolean;
  themeToggle: boolean;
  pageTransition: boolean;
  readingTime: boolean;
  music: boolean;
}

export interface HitokotoConfig {
  enable: boolean;
  list: string[];
}

export interface SpineVoiceConfig {
  audio: string;
  animation: string;
  text: string;
}

export interface SpineCopyConfig {
  audio?: string;
  animation: string;
  text: string;
}

export interface SpineCharacterConfig {
  skelUrl: string;
  atlasUrl: string;
  idleAnimationName: string;
  eyeCloseAnimationName: string;
  rightEyeBone: string;
  leftEyeBone: string;
  frontHeadBone: string;
  backHeadBone: string;
  eyeRotationAngle: number;
  voiceConfig: SpineVoiceConfig[];
  copyConfig?: SpineCopyConfig;
  // 位置偏移配置（百分比，可选）
  offset?: {
    left?: string; // 例如: "5%", "10%", "-5%"
    bottom?: string; // 例如: "20px", "5vh"
  };
}

export interface SpineCharactersConfig {
  arona: SpineCharacterConfig;
  plana: SpineCharacterConfig;
}

export interface SpineConfig {
  enable: boolean;
  voiceLang: "zh" | "jp";
  characters: SpineCharactersConfig;
}

export interface MusicConfig {
  enable: boolean;
  api: string;
  songIds: number[];
  volume?: number;
  urlField?: string;
}

export interface BangumiPageConfig {
  title: string;
  description: string;
}

export interface BangumiIntegrationConfig {
  source: BangumiSource;
  vmid: string;
  title: string;
  quote: string;
  coverMirror: string;
  category: (1 | 2)[];
  lazyload: boolean;
  devMode: boolean;
  refreshEndpoint: string | false;
  showMyComment: boolean;
  localDataPath: string | undefined;
  extraOrder: number;
}

export interface BangumiComponentConfig {
  categoryFilter: "all" | "1" | "2";
  show: 0 | 1 | 2;
  title: string;
  quote: string;
  darkSelector: string;
}

export interface BangumiConfig {
  enable: boolean;
  page: BangumiPageConfig;
  integration: BangumiIntegrationConfig;
  component: BangumiComponentConfig;
}

export interface Config {
  site: SiteConfig;
  nav: NavItem[];
  friends: FriendsConfig;
  projects: ProjectsConfig;
  comments: CommentsConfig;
  sponsor: SponsorConfig;
  footer: FooterConfig;
  seo: SEOConfig;
  features: FeaturesConfig;
  hitokoto: HitokotoConfig;
  spine: SpineConfig;
  music: MusicConfig;
  bangumi: BangumiConfig;
}

/**
 * 加载配置文件（开发环境下每次都重新读取）
 */
export function loadConfig(): Config {
  try {
    const fileContent = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config = yaml.load(fileContent) as Config;
    return config;
  } catch (error) {
    console.error("Failed to load config file:", error);
    throw new Error("Failed to load config file");
  }
}

/**
 * 获取站点配置
 */
export function getSiteConfig(): SiteConfig {
  return loadConfig().site;
}

/**
 * 获取导航配置
 */
export function getNavConfig(): NavItem[] {
  return loadConfig().nav;
}

/**
 * 获取友链配置
 */
export function getFriendsConfig(): FriendsConfig {
  return loadConfig().friends;
}

/**
 * 获取项目配置
 */
export function getProjectsConfig(): ProjectsConfig {
  return loadConfig().projects;
}

/**
 * 获取评论配置
 */
export function getCommentsConfig(): CommentsConfig {
  return loadConfig().comments;
}

/**
 * 获取赞助配置
 */
export function getSponsorConfig(): SponsorConfig {
  return loadConfig().sponsor;
}

/**
 * 获取页脚配置
 */
export function getFooterConfig(): FooterConfig {
  return loadConfig().footer;
}

/**
 * 获取 SEO 配置
 */
export function getSEOConfig(): SEOConfig {
  return loadConfig().seo;
}

/**
 * 获取功能开关配置
 */
export function getFeaturesConfig(): FeaturesConfig {
  return loadConfig().features;
}

/**
 * 获取一言配置
 */
export function getHitokotoConfig(): HitokotoConfig {
  return loadConfig().hitokoto;
}

/**
 * 获取 Spine Live2D 配置
 */
export function getSpineConfig(): SpineConfig {
  const config = loadConfig();
  return config.spine || { enable: false, voiceLang: "zh" };
}

export function getMusicConfig(): MusicConfig {
  const config = loadConfig();
  return config.music || { enable: false, api: "", songIds: [] };
}

export function getBangumiConfig(): BangumiConfig {
  const config = loadConfig();
  return (
    config.bangumi || {
      enable: false,
      page: { title: "我的追番", description: "" },
      integration: {
        source: "bili" as BangumiSource,
        vmid: "",
        title: "追番列表",
        quote: "生命不息，追番不止！",
        coverMirror: "",
        category: [1, 2],
        lazyload: true,
        devMode: true,
        refreshEndpoint: "/api/bangumi/refresh",
        showMyComment: false,
        localDataPath: undefined,
        extraOrder: 0,
      },
      component: {
        categoryFilter: "all",
        show: 1,
        title: "",
        quote: "",
        darkSelector: "",
      },
    }
  );
}

// 默认导出完整配置
export default loadConfig;
