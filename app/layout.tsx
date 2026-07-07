import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { client } from "@/lib/sanity";
import { dir, htmlLang } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";

// The root layout reads the request locale from the x-locale header set by
// middleware. Forcing dynamic rendering ensures it re-runs on every nav so
// html dir/lang stay in sync with the URL.
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Cairo — modern, geometric Arabic UI font that reads well at every size
// and works beautifully alongside Latin text. Bundles both scripts so we
// can use the same font family for RTL and LTR fallback.
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ─── Site-wide fallback metadata ────────────────────────────────────
// Individual pages override title/description via their own
// generateMetadata(). Verification tokens are pulled from Sanity's
// siteSettings singleton so the editor can paste new tokens without a
// code deploy.
export async function generateMetadata(): Promise<Metadata> {
  const s = await client.fetch<{
    googleSiteVerification?: string
    bingSiteVerification?: string
    yandexSiteVerification?: string
    facebookDomainVerification?: string
  } | null>(`
    *[_type == "siteSettings"][0]{
      googleSiteVerification,
      bingSiteVerification,
      yandexSiteVerification,
      facebookDomainVerification
    }
  `)

  return {
    metadataBase: new URL('https://mnmagency.com'),
    title: {
      default: 'Marketing Agency in Qatar | SEO, Web Development & Social Media | M&M',
      template: '%s | M&M Marketing Qatar',
    },
    description:
      'M&M Marketing is a leading marketing agency in Qatar. SEO, web development, social media management, branding, and paid ads for brands in Doha and across Qatar. Free consultation.',
    verification: {
      google: s?.googleSiteVerification,
      yandex: s?.yandexSiteVerification,
      other: {
        'msvalidate.01': s?.bingSiteVerification || '',
        'facebook-domain-verification': s?.facebookDomainVerification || '',
      },
    },
    alternates: {
      canonical: 'https://mnmagency.com',
      languages: {
        en: 'https://mnmagency.com',
        ar: 'https://mnmagency.com/ar',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'M&M Marketing',
      locale: 'en_US',
      alternateLocale: 'ar_QA',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={htmlLang(locale)}
      dir={dir(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
