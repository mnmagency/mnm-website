import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script"; // 👈 ADD THIS
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M&M Marketing | AI-Driven Growth Partner in Qatar",
  description:
    "M&M Marketing helps brands in Qatar grow through websites, SEO, social media, paid media, branding, and AI-driven marketing systems.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        
        {/* ✅ GA4 Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5BT7X5WTF6"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5BT7X5WTF6');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}