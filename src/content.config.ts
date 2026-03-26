import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
	// Transform using astro:content
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.optional(image()),
		minutesRead: z.string().optional(),
		wordCount: z.number().optional(),
		tags: z.array(z.string()).optional(),
		// Enable/disable donation section and post navigation
		enableDonation: z.boolean().optional().default(true),
		enableNavigation: z.boolean().optional().default(true),
	}),
});

export const collections = { blog };
