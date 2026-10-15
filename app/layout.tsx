import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ChildProps } from "@/types";
import { ThemeProvider } from "@/components/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/LanguageContext";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const DESCRIPTION =
  "Fargʻonadagi Smartmiz oʻquv markazi: ingliz (IELTS, CEFR), rus, koreys (EPS-TOPIK), arab, turk tillari va kompyuter kurslari. Bepul sinov darsiga yoziling.";

// Defaults; every public page sets its own via pageMetadata() in lib/seo.ts
export const metadata: Metadata = {
  // smartmiz.uz redirects to www; absolute URLs (og:image) must use the final host
  metadataBase: new URL(SITE_URL),
  title: { default: "Smartmiz — chet tillari va kompyuter kurslari Fargʻonada", template: "%s | Smartmiz" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Muhammad ibrohimov", url: SITE_URL }],
  // Icons: app/icon.svg, app/favicon.ico and app/apple-icon.tsx; og:image: app/opengraph-image.tsx
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: SITE_NAME,
    countryName: "Uzbekistan",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

const organization = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: "Smartmiz oʻquv markazi",
  alternateName: "Smartmiz",
  url: SITE_URL,
  logo: `${SITE_URL}/SMARTMIZ.jpg`,
  image: `${SITE_URL}/opengraph-image`,
  description: DESCRIPTION,
  telephone: "+998732441333",
  areaServed: { "@type": "City", name: "Fergana" },
  address: [44, 53].map((house) => ({
    "@type": "PostalAddress",
    streetAddress: `Qomus koʻchasi ${house}`,
    addressLocality: "Fergana",
    addressRegion: "Fergana Region",
    addressCountry: "UZ",
  })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "19:00",
    },
  ],
  contactPoint: ["+998732441333", "+998732440099"].map((telephone) => ({
    "@type": "ContactPoint",
    telephone,
    contactType: "customer service",
    availableLanguage: ["uz", "ru"],
  })),
  sameAs: [
    "https://www.instagram.com/smartmiz_fergana",
    "https://t.me/Smartmiz",
    "https://www.youtube.com/@smartmizoquvmarkazi7835",
  ],
};

function RootLayout({ children }: ChildProps) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      </head>
      <body className="overflow-x-hidden">
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            {children}
            <Toaster position="top-center" />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
export default RootLayout;
