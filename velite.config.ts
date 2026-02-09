import { defineConfig, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypePrism from 'rehype-prism-plus';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  root: 'src/posts',
  collections: {
    blogPosts: {
      name: 'Blog',
      pattern: '**/*.mdx',
      schema: s
        .object({
          slug: s.path(),
          title: s.string(),
          date: s.string(),
          summary: s.string(),
          category: s.string(),
          thumbnail: s.string().optional(),
          body: s.markdown(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug.replace(/^.*[\\\/]/, '').replace(/\.mdx$/, ''),
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
