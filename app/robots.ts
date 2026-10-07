import { MetadataRoute } from 'next'

// Everything public is crawlable. The AI crawlers are listed explicitly so the
// intent is visible and survives any future blanket rule added under '*'.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_CRAWLERS, allow: '/' },
    ],
    sitemap: 'https://mnmagency.com/sitemap.xml',
  }
}
