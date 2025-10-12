import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="description" content="Win, Share, Support & Impact with SolarizedNG Charity Giveaway." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

