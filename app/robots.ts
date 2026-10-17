import { MetadataRoute } from 'next'

/**
 * Everything public is crawlable — including every AI crawler.
 *
 * The AI bots are listed explicitly so the intent is visible and survives any
 * future blanket rule added under '*'. Covers training crawlers, AI search
 * indexers and on-demand fetchers (when a user asks an assistant about us).
 */
const AI_CRAWLERS = [
  // OpenAI — ChatGPT
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  // Anthropic — Claude
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  // Perplexity
  'PerplexityBot', 'Perplexity-User',
  // Google — Gemini / AI Overviews / Vertex
  'Google-Extended', 'GoogleOther', 'Google-CloudVertexBot',
  // Microsoft — Copilot (Bing index)
  'Bingbot',
  // Apple — Siri / Apple Intelligence
  'Applebot', 'Applebot-Extended',
  // Meta — Meta AI
  'meta-externalagent', 'meta-externalfetcher', 'FacebookBot',
  // Amazon — Alexa / Rufus
  'Amazonbot',
  // Others
  'DuckAssistBot', 'MistralAI-User', 'cohere-ai', 'cohere-training-data-crawler',
  'YouBot', 'CCBot', 'Bytespider', 'AI2Bot', 'Diffbot', 'Timpibot',
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
