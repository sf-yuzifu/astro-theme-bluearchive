// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import astroExpressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { remarkReadingTime } from './src/utils/remarkReadingTime.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	markdown: {
		remarkPlugins: [remarkReadingTime],
	},
	integrations: [
		astroExpressiveCode({
			themes: ['github-light', 'github-dark'],
			useThemedScrollbars: false,
			defaultProps: {
				showLineNumbers: true,
				frame: 'auto',
			},
			plugins: [pluginLineNumbers()], 
			styleOverrides: {
				borderRadius: '16px',
				frames: {
					frameBoxShadowCssValue: '0px 0px 5px #c1c1c1',
					editorTabBarBackground: 'rgb(239, 242, 244)',
					editorActiveTabBackground: 'transparent',
					editorActiveTabBorderColor: 'transparent',
					editorActiveTabIndicatorBottomColor: 'var(--font-color-gold)',
					editorActiveTabIndicatorHeight: '5px',
				},
				codeBackground: '#efefef',
			},
			themeCssSelector: (theme) => {
				if (theme.name === 'github-dark') return `html[theme='dark']`;
				return `html:not([theme='dark'])`;
			}
		}),
		mdx({
			remarkPlugins: [remarkReadingTime],
		}), 
		sitemap()
	],
});
