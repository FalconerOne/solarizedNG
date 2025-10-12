const siteUrl = "https://solarizedng.vercel.app";

export const SEO = {
  title: "SolarizedNG — Empowering Lives Through Clean Energy",
  description:
    "SolarizedNG connects families, communities, and organizations to clean solar solutions while spreading compassion and sustainability.",
  canonical: siteUrl,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    site_name: "SolarizedNG",
    title: "SolarizedNG — Empowering Lives Through Clean Energy",
    description:
      "Join us in making clean energy accessible for everyone. Together, we build a brighter future.",
    images: [
      {
        url: `${siteUrl}/images/og-banner.jpg`,
        width: 1200,
        height: 630,
        alt: "SolarizedNG - Empowering Lives",
      },
    ],
  },
  twitter: {
    handle: "@solarizedng",
    site: "@solarizedng",
    cardType: "summary_large_image",
  },
};
