// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';
import astroExpressiveCode from 'astro-expressive-code';
import { createInlineSvgUrl, definePlugin } from '@expressive-code/core';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import { remarkReadingTime } from './src/utils/remarkReadingTime.mjs';
import icon from 'astro-icon';

const copyIcon = createInlineSvgUrl(
	`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.75'><path d='M3 19a2 2 0 0 1-1-2V2a2 2 0 0 1 1-1h13a2 2 0 0 1 2 1'/><rect x='6' y='5' width='16' height='18' rx='1.5' ry='1.5'/></svg>`
);

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	markdown: {
		remarkPlugins: [remarkReadingTime],
	},
	integrations: [
		astroExpressiveCode({
			themes: ['material-theme-lighter', 'material-theme-darker'],
			useThemedScrollbars: false,
			defaultProps: {
				showLineNumbers: true,
				frame: 'auto',
			},
			plugins: [
				pluginLineNumbers(),
				definePlugin({
					name: 'language-title-fallback',
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
				borderRadius: '12px',
				frames: {
					frameBoxShadowCssValue: '0px 0px 5px #c1c1c1',
					editorActiveTabIndicatorBottomColor: 'var(--font-color-gold)',
					editorActiveTabIndicatorHeight: '3px',
				},
			},
			themeCssSelector: (theme) => {
				if (theme.name === 'material-theme-darker') return `html[theme='dark']`;
				return `html:not([theme='dark'])`;
			}
		}),
		mdx({
			remarkPlugins: [remarkReadingTime],
		}),
		vue(),
		sitemap(),
		icon()
	],
});
