// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Astro Blog";
export const SITE_DESCRIPTION = "Welcome to my website!";

// 友链数据
export interface Friend {
  name: string;
  url: string;
  description: string;
  avatar?: string;
}

export const FRIENDS: Friend[] = [
  {
    name: "Astro",
    url: "https://astro.build",
    description: "The web framework for content-driven websites",
  },
  {
    name: "Example Blog",
    url: "https://example.com",
    description: "An example blog for demonstration",
  },
];
