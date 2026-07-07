/**
 * TrackingScripts — reads the `siteSettings` singleton from Sanity and
 * injects every third-party tracking script we support. Each block is
 * conditional on the corresponding ID being present, so it's safe to
 * ship this with empty fields — no scripts fire until you paste the ID
 * into Sanity Studio.
 *
 * Supported:
 *   • Google Analytics 4 (GA4)
 *   • Google Tag Manager (GTM)
 *   • Google Ads (conversion pixel)
 *   • Meta Pixel (Facebook + Instagram)
 *   • TikTok Pixel
 *   • Snapchat Pixel
 *   • LinkedIn Insight Tag
 *   • X (Twitter) Pixel
 *
 * All IDs live in Sanity → Site Settings — Analytics & Pixels. No env
 * vars, no code deploy needed to change them.
 */

import Script from 'next/script'
import { client } from '@/lib/sanity'

type SiteSettings = {
  gaMeasurementId?: string
  gtmContainerId?: string
  googleAdsConversionId?: string
  metaPixelId?: string
  tiktokPixelId?: string
  snapchatPixelId?: string
  linkedinPartnerId?: string
  xPixelId?: string
} | null

export default async function TrackingScripts() {
  const s: SiteSettings = await client.fetch(`
    *[_type == "siteSettings"][0]{
      gaMeasurementId,
      gtmContainerId,
      googleAdsConversionId,
      metaPixelId,
      tiktokPixelId,
      snapchatPixelId,
      linkedinPartnerId,
      xPixelId
    }
  `)

  if (!s) return null

  return (
    <>
      {/* ─── Google Tag Manager (loads GTM which can then load GA4, Ads etc) ─── */}
      {s.gtmContainerId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${s.gtmContainerId}');`}
          </Script>
        </>
      )}

      {/* ─── Google Analytics 4 (only if GTM isn't handling it) ─── */}
      {s.gaMeasurementId && !s.gtmContainerId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${s.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${s.gaMeasurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {/* ─── Google Ads conversion pixel (piggybacks on gtag from GA4 above) ─── */}
      {s.googleAdsConversionId && !s.gtmContainerId && (
        <>
          {!s.gaMeasurementId && (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${s.googleAdsConversionId}`}
              strategy="afterInteractive"
            />
          )}
          <Script id="google-ads" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${s.googleAdsConversionId}');`}
          </Script>
        </>
      )}

      {/* ─── Meta Pixel (Facebook + Instagram) ─── */}
      {s.metaPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${s.metaPixelId}');fbq('track','PageView');`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${s.metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ─── TikTok Pixel ─── */}
      {s.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once",
            "ready","alias","group","enableCookie","disableCookie","holdConsent",
            "revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){
            t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)
            ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){
            var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
            ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},
            ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");
            n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
            e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('${s.tiktokPixelId}');ttq.page();
            }(window, document, 'ttq');`}
        </Script>
      )}

      {/* ─── Snapchat Pixel ─── */}
      {s.snapchatPixelId && (
        <Script id="snapchat-pixel" strategy="afterInteractive">
          {`(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){
            a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
            a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
            r.src=n;var u=t.getElementsByTagName(s)[0];
            u.parentNode.insertBefore(r,u);})(window,document,
            'https://sc-static.net/scevent.min.js');
            snaptr('init', '${s.snapchatPixelId}');
            snaptr('track', 'PAGE_VIEW');`}
        </Script>
      )}

      {/* ─── LinkedIn Insight Tag ─── */}
      {s.linkedinPartnerId && (
        <>
          <Script id="linkedin-config" strategy="afterInteractive">
            {`_linkedin_partner_id = "${s.linkedinPartnerId}";
              window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
              window._linkedin_data_partner_ids.push(_linkedin_partner_id);`}
          </Script>
          <Script id="linkedin-insight" strategy="afterInteractive">
            {`(function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);})(window.lintrk);`}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://px.ads.linkedin.com/collect/?pid=${s.linkedinPartnerId}&fmt=gif`}
            />
          </noscript>
        </>
      )}

      {/* ─── X (Twitter) Pixel ─── */}
      {s.xPixelId && (
        <Script id="x-pixel" strategy="afterInteractive">
          {`!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
            },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
            a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
            twq('config','${s.xPixelId}');`}
        </Script>
      )}
    </>
  )
}
