import { defineConfig, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
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
          body: s.mdx(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug.replace(/^.*[\\\/]/, '').replace(/\.mdx$/, ''),
        })),
    },
  },
  mdx: {
    remarkPlugins: [remarkBreaks],
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      [rehypePrettyCode, { theme: 'github-dark' }],
    ],
  },
});
