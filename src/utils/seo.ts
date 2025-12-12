import type { Metadata } from "next";
import { siteMetaData } from "./siteMetaData";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function buildMetadata(input: SeoInput): Metadata {
  const url = new URL(input.path, siteMetaData.siteUrl).toString();
  const ogImage = new URL(input.ogImage || siteMetaData.defaultOg, siteMetaData.siteUrl).toString();

  return {
    metadataBase: new URL(siteMetaData.siteUrl),
    title: input.title,
    description: input.description,

    alternates: {
      canonical: url,
    },

    openGraph: {
      type: "website",
      locale: siteMetaData.locale,
      url,
      siteName: siteMetaData.brand,
      title: input.title,
      description: input.description,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: input.title },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },

    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },

    applicationName: siteMetaData.brand,
    authors: [{ name: siteMetaData.brand }],
  };
}