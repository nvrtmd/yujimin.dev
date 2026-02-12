import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Block AI crawlers for training (use standard User-Agent blocking)
      {
        userAgent: [
          'CCBot', // Common Crawl (used by multiple AI companies)
          'ChatGPT-User', // OpenAI
          'GPTBot', // OpenAI
          'Google-Extended', // Google Bard training
          'anthropic-ai', // Anthropic Claude
          'ClaudeBot', // Anthropic Claude
          'cohere-ai', // Cohere
          'Omgilibot', // Omgili
          'omgili', // Omgili
          'PerplexityBot', // Perplexity AI
          'YouBot', // You.com
          'Bytespider', // ByteDance (TikTok)
          'Diffbot', // Diffbot
        ],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://yujimin.dev/sitemap.xml',
  };
}
