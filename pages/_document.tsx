// /pages/_document.tsx
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

        {/* ✅ Theme & SEO */}
        <meta name="theme-color" content="#f97316" />
        <meta name="background-color" content="#ffffff" />
        <meta
          name="description"
          content="Win, Share, Support & Impact with SolarizedNG Charity Giveaway."
        />

        {/* ✅ Apple & Mobile App Settings */}
        <meta name="application-name" content="SolarizedNG" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        
        <meta name="apple-mobile-web-app-title" content="SolarizedNG" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* ✅ Enhanced SEO + Social Previews */}
<meta name="keywords" content="SolarizedNG, charity giveaway, Nigeria, solar energy, win solar, social impact" />
<meta property="og:type" content="website" />
<meta property="og:title" content="SolarizedNG Giveaway" />
<meta property="og:description" content="Win, Share, Support & Impact with SolarizedNG Charity Giveaway." />
<meta property="og:image" content="/icons/icon-512x512.png" />
<meta property="og:url" content="https://solarizedng.vercel.app" />
<meta property="og:site_name" content="SolarizedNG" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SolarizedNG Giveaway" />
<meta name="twitter:description" content="Win, Share, Support & Impact with SolarizedNG Charity Giveaway." />
<meta name="twitter:image" content="/icons/icon-512x512.png" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
