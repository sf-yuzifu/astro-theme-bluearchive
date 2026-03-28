// 从配置文件导入
import {
  getSiteConfig,
  getFriendsConfig,
  getProjectsConfig,
  getCommentsConfig,
  getSponsorConfig,
  getNavConfig,
  getFooterConfig,
  getSEOConfig,
  getFeaturesConfig,
  getHitokotoConfig,
  type Friend,
  type Project,
  type NavItem,
  type SponsorMethod,
  type FooterLink,
  type SocialLink,
  type ICPRecord,
} from "./config";

// 导出类型
export type {
  Friend,
  Project,
  NavItem,
  SponsorMethod,
  FooterLink,
  SocialLink,
  ICPRecord,
};

// 站点信息（从配置文件读取）
const siteConfig = getSiteConfig();
export const SITE_TITLE = siteConfig.title;
export const SITE_DESCRIPTION = siteConfig.description;
export const SITE_AUTHOR = siteConfig.author;
export const SITE_AVATAR = siteConfig.avatar;
export const SITE_FAVICON = siteConfig.favicon;
export const SITE_URL = siteConfig.url;
export const SITE_LANG = siteConfig.lang;
export const SITE_ICP = siteConfig.icp;
export const SITE_SOCIAL: SocialLink[] = siteConfig.social || [];

// 导航菜单
export const NAV_ITEMS: NavItem[] = getNavConfig();

// 友链数据
const friendsConfig = getFriendsConfig();
export const FRIENDS_ENABLE = friendsConfig.enable;
export const FRIENDS_TITLE = friendsConfig.title;
export const FRIENDS_DESCRIPTION = friendsConfig.description;
export const FRIENDS: Friend[] = friendsConfig.list;

// 项目数据
const projectsConfig = getProjectsConfig();
export const PROJECTS_ENABLE = projectsConfig.enable;
export const PROJECTS_TITLE = projectsConfig.title;
export const PROJECTS_DESCRIPTION = projectsConfig.description;
export const PROJECTS: Project[] = projectsConfig.list;

// 评论配置
const commentsConfig = getCommentsConfig();
export const COMMENTS_ENABLE = commentsConfig.enable;
export const COMMENTS_TYPE = commentsConfig.type;
export const COMMENTS_WALINE_SERVER_URL = commentsConfig.waline?.serverURL;

// 捐赠配置
const sponsorConfig = getSponsorConfig();
export const SPONSOR_ENABLE = sponsorConfig.enable;
export const SPONSOR_TITLE = sponsorConfig.title;
export const SPONSOR_DESCRIPTION = sponsorConfig.description;
export const SPONSOR_METHODS: SponsorMethod[] = sponsorConfig.methods;

// 页脚配置
const footerConfig = getFooterConfig();
export const FOOTER_COPYRIGHT = footerConfig.copyright;
export const FOOTER_ICP = footerConfig.icp;
export const FOOTER_LINKS: FooterLink[] = footerConfig.links;

// SEO 配置
const seoConfig = getSEOConfig();
export const SEO_OG_IMAGE = seoConfig.ogImage;
export const SEO_KEYWORDS = seoConfig.keywords;
export const SEO_TWITTER = seoConfig.twitter;

// 功能开关
const featuresConfig = getFeaturesConfig();
export const FEATURE_SEARCH = featuresConfig.search;
export const FEATURE_BACK_TO_TOP = featuresConfig.backToTop;
export const FEATURE_THEME_TOGGLE = featuresConfig.themeToggle;
export const FEATURE_PAGE_TRANSITION = featuresConfig.pageTransition;
export const FEATURE_READING_TIME = featuresConfig.readingTime;

// 一言配置
const hitokotoConfig = getHitokotoConfig();
export const HITOKOTO_ENABLE = hitokotoConfig.enable;
export const HITOKOTO_LIST: string[] = hitokotoConfig.list;

// Spine Live2D 配置
import { getSpineConfig, type SpineCharactersConfig } from "./config";
const spineConfig = getSpineConfig();
export const SPINE_ENABLE = spineConfig.enable;
export const SPINE_VOICE_LANG = spineConfig.voiceLang;
export const SPINE_CHARACTERS: SpineCharactersConfig = spineConfig.characters;
