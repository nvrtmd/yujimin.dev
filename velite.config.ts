import { defineConfig, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  root: 'src/posts',
  collections: {
    enBlogPosts: {
      name: 'EnBlog',
      pattern: 'en/**/*.mdx',
      schema: s
        .object({
          slug: s.path(),
          title: s.string(),
          date: s.string(),
          summary: s.string(),
          category: s.string(),
          thumbnail: s.string().optional(),
          ogImage: s.string().optional(),
          body: s.markdown(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug
            .replace(/^.*[\\\/]/, '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '')
            .replace(/\.mdx$/, ''),
        })),
    },
    koBlogPosts: {
      name: 'KoBlog',
      pattern: 'ko/**/*.mdx',
      schema: s
        .object({
          slug: s.path(),
          title: s.string(),
          date: s.string(),
          summary: s.string(),
          category: s.string(),
          thumbnail: s.string().optional(),
          ogImage: s.string().optional(),
          body: s.markdown(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug
            .replace(/^.*[\\\/]/, '')
            .replace(/^\d{4}-\d{2}-\d{2}-/, '')
            .replace(/\.mdx$/, ''),
        })),
    },
  },
  markdown: {
    remarkPlugins: [remarkBreaks],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      // @ts-expect-error - Unified type version mismatch between velite and rehype plugins
      [rehypePrism, { showLineNumbers: true }],
    ],
  },
});
