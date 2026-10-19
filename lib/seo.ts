import { Metadata } from "next";

// Shared page metadata. A page that sets `openGraph` replaces the layout's
// whole openGraph object, so every page builds the full set here — otherwise
// inner pages would share the home page's og:title when linked in Telegram.
// (The og:image is app/opengraph-image.tsx, linked below.)

export const SITE_NAME = "Smartmiz";
export const SITE_URL = "https://www.smartmiz.uz";

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  image,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  // Own share picture (e.g. a course photo) instead of the site-wide one
  image?: { url: string; alt: string };
}): Metadata {
  const ogImage = image ?? OG_IMAGE;
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "uz_UZ",
      type: "website",
      images: [ogImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}

// A page-level openGraph drops the root app/opengraph-image.tsx, so link it explicitly
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Smartmiz — chet tillari va kompyuter kurslari, Fargʻona",
};
