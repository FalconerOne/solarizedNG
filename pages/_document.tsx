import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ✅ PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* ✅ Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <link rel="mask-icon" href="/icons/maskable_icon.png" color="#f97316" />

        {/* ✅ Meta: Theme, Colors, Description */}
        <meta name="theme-color" content="#f97316" />
        <meta name="background-color" content="#ffffff" />
        <meta
          name="description"
          content="Win, Share, Support & Impact with SolarizedNG Charity Giveaway."
        />

        {/* ✅ SEO + PWA polish */}
        <meta name="application-name" content="SolarizedNG" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SolarizedNG" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

