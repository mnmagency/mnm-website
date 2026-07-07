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
const legacyRedirects = [
  // Marketing services index + sub-services
  { source: '/marketing-services',                            destination: '/services', permanent: true },
  { source: '/marketing-services/event-marketing',            destination: '/services', permanent: true },
  { source: '/marketing-services/web-development',            destination: '/services', permanent: true },
  { source: '/marketing-services/bulk-sms',                   destination: '/services', permanent: true },
  { source: '/marketing-services/influencer-marketing',       destination: '/services', permanent: true },

  // Top-level service pages
  { source: '/social-media-services',           destination: '/services', permanent: true },
  { source: '/media-plan-service',              destination: '/services', permanent: true },
  { source: '/search-engine-optimization-service', destination: '/services', permanent: true },
  { source: '/email-marketing-service',         destination: '/services', permanent: true },

  // Misc old pages
  { source: '/mm-marketing-our-work-in-qatar',  destination: '/work',         permanent: true },
  { source: '/contact-mm-marketing',            destination: '/contact',      permanent: true },
  { source: '/landing-page',                    destination: '/get-strategy', permanent: true },
  { source: '/homepage',                        destination: '/',             permanent: true },
  { source: '/our-team',                        destination: '/about',        permanent: true },

  // /work was consolidated into /case-studies in Phase 3-D
  { source: '/work',           destination: '/case-studies',         permanent: true },
  { source: '/work/:slug*',    destination: '/case-studies/:slug*',  permanent: true },

  // Arabic (no Arabic locale yet — point to English equivalents)
  { source: '/ar/services',                                                   destination: '/services', permanent: true },
  { source: '/ar/marketing-services',                                         destination: '/services', permanent: true },
  { source: '/ar/marketing-services/content-generation-and-optimization',     destination: '/services', permanent: true },
  { source: '/ar/marketing-services/email-marketing-in-qatar',                destination: '/services', permanent: true },
  { source: '/ar/marketing-services/seo-agency-in-qatar',                     destination: '/services', permanent: true },
  { source: '/ar/marketing-services/event-marketing',                         destination: '/services', permanent: true },
  { source: '/ar/marketing-agencies-in-qatar',                                destination: '/',         permanent: true },
  { source: '/ar/our-works',                                                  destination: '/work',     permanent: true },
  { source: '/ar/portfolio-item/city-center-doha',                            destination: '/work',     permanent: true },
  { source: '/ar/7-tips-for-crafting-the-perfect-sms-marketing-campaign-in-qatar', destination: '/blog', permanent: true },
  { source: '/ar/12-examples-of-successful-sms-campaigns-in-qatar',           destination: '/blog',     permanent: true },
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

  async redirects() {
    return legacyRedirects
  },
};

export default nextConfig;
