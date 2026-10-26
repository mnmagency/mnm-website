import type { NextConfig } from "next";

/**
 * Redirects for legacy WordPress URLs that Search Console is still 404'ing.
 *
 * Source list: GSC Coverage Drilldown 2026-05-13 (35 URLs).
 *
 * Strategy:
 *  - Real old pages with a clear new equivalent → 301 to that page
 *  - Old WordPress `/wp-admin`, `/wp-content`, `/wp-*.php` paths → let them
 *    return 404 naturally (they have no value, redirecting them to the home
 *    page would look spammy to Google)
 *  - Old `/ar/*` Arabic versions → redirect to the closest English equivalent
 *    for now (replace once an Arabic locale is added)
 */
/**
 * Old WordPress URLs → their closest page on the new site.
 *
 * Built from Search Console's "Not found (404)" export (26 Oct 2026). Each
 * entry is emitted twice: once for English and once under /ar/ pointing at
 * the Arabic page, so old Arabic links land in Arabic. Pages with backlinks
 * keep their value only if they 301 to a relevant page, so service pages go
 * to the matching service, not the generic /services list.
 *
 * WordPress internals (wp-admin, wp-includes, pixpopup-item popups) are left
 * as 404 on purpose: they have no value and Google drops them on its own.
 * Trailing slashes are stripped by Next first, so '/x/' matches '/x'.
 */
const oldToNew: Array<[string, string]> = [
  // Services
  ['/marketing-services',                                  '/services'],
  ['/marketing-services/web-development',                  '/services/web-development'],
  ['/marketing-services/seo-agency-in-qatar',              '/services/seo'],
  ['/marketing-services/content-generation-and-optimization', '/services/seo'],
  ['/marketing-services/social-media-marketing',           '/services/social-media'],
  ['/marketing-services/influencer-marketing',             '/services/social-media'],
  ['/marketing-services/bulk-sms',                         '/services/bulk-sms'],
  ['/marketing-services/google-ads',                       '/services/paid-ads'],
  ['/marketing-services/media-planning',                   '/services/paid-ads'],
  ['/marketing-services/photography/:path*',               '/services/videography'],
  ['/marketing-services/photography',                      '/services/videography'],
  ['/marketing-services/email-marketing-in-qatar',         '/services'],
  ['/marketing-services/event-marketing',                  '/services'],
  ['/services/social-media-marketing',                     '/services/social-media'],
  ['/services/influencer-management',                      '/services/social-media'],
  ['/lp/influencer-qatar',                                 '/services/social-media'],
  ['/social-media-services',                               '/services/social-media'],
  ['/qatar-social-media-agency',                           '/services/social-media'],
  ['/search-engine-optimization-service',                  '/services/seo'],
  ['/media-plan-service',                                  '/services/paid-ads'],
  ['/email-marketing-service',                             '/services'],
  ['/branding-services',                                   '/services/branding'],

  // Old blog posts → the new post on the same topic, else the matching service
  ['/how-mm-marketing-agency-builds-social-media-strategies-that-truly-convert', '/blog/how-m-and-m-marketing-agency-builds-social-media-strategies-that-truly-convert'],
  ['/web-design-qatar-benefits',                           '/services/web-development'],
  ['/top-10-website-features-that-drive-engagement-in-qatar', '/blog/why-most-websites-in-qatar-don-t-convert'],
  ['/transforming-your-digital-strategy-with-effective-web-development-in-qatar', '/services/web-development'],
  ['/seo-qatar-business-growth',                           '/services/seo'],
  ['/how-an-seo-agency-in-qatar-can-elevate-your-business', '/blog/how-to-choose-an-seo-company-in-qatar'],
  ['/content-marketing-techniques',                        '/blog'],
  ['/7-common-mistakes-to-avoid-in-your-online-marketing-strategy-in-qatar', '/blog/best-marketing-agency-in-qatar-how-to-choose'],
  ['/marketing-agencies-in-qatar',                         '/blog/best-marketing-agency-in-qatar-how-to-choose'],
  ['/marketing-agencies-in-qatar-2',                       '/blog/best-marketing-agency-in-qatar-how-to-choose'],
  ['/7-tips-for-crafting-the-perfect-sms-marketing-campaign-in-qatar', '/services/bulk-sms'],
  ['/12-examples-of-successful-sms-campaigns-in-qatar',    '/services/bulk-sms'],
  ['/15-creative-ideas-for-your-next-sms-campaign-in-qatar-to-increase-customer-loyalty', '/services/bulk-sms'],
  ['/8-game-changing-features-in-email-marketing-tools-that-can-skyrocket-your-engagement-rates', '/blog'],
  ['/12-steps-to-an-effective-email-marketing-strategy-in-qatar', '/blog'],

  // Archives, authors, categories, pagination
  ['/blog/page/:n',                                        '/blog'],
  ['/category/:path*',                                     '/blog'],
  ['/author/:path*',                                       '/blog'],
  ['/page/:n',                                             '/'],
  ['/testimonials/:path*',                                 '/about'],

  // Portfolio and other pages
  ['/portfolio-item/:path*',                               '/portfolio'],
  ['/portfolio-item',                                      '/portfolio'],
  ['/works',                                               '/portfolio'],
  ['/our-works',                                           '/portfolio'],
  ['/mm-marketing-our-work-in-qatar',                      '/portfolio'],
  ['/contact-mm-marketing',                                '/contact'],
  ['/landing-page',                                        '/get-strategy'],
  ['/homepage',                                            '/'],
  ['/our-team',                                            '/about'],
]

const toAr = (path: string) => (path === '/' ? '/ar' : `/ar${path}`)

const legacyRedirects = [
  ...oldToNew.map(([source, destination]) => ({ source, destination, permanent: true })),
  ...oldToNew.map(([source, destination]) => ({ source: toAr(source), destination: toAr(destination), permanent: true })),

  // /work was consolidated into /case-studies in Phase 3-D
  { source: '/work',           destination: '/case-studies',         permanent: true },
  { source: '/work/:slug*',    destination: '/case-studies/:slug*',  permanent: true },
]

const nextConfig: NextConfig = {
  // Tell Turbopack the project root is this directory (not the home folder).
  // Silences the "multiple lockfiles" warning when there's a stray
  // package-lock.json in ~ from an old npm install.
  turbopack: {
    root: process.cwd(),
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  async redirects() {
    return legacyRedirects
  },
};

export default nextConfig;
