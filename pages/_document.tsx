// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to Google fonts for faster font load */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Basic SEO / Open Graph defaults - override in per-page if needed */}
          <meta name="description" content="SolarizedNG Charity Giveaway — Win, Share & Support Heart Heroes Foundation" />
          <meta property="og:site_name" content="SolarizedNG" />
          <meta property="og:title" content="SolarizedNG Charity Giveaway" />
          <meta property="og:description" content="Win with friends, Family & Others — join the SolarizedNG Charity Giveaway!" />
          <meta property="og:url" content="https://solarizedng.vercel.app" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          {/* fallback image */}
          <meta property="og:image" content="https://solarizedng.vercel.app/images/HHSF-2.png" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
