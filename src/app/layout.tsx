import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { getStructuredData } from "@/lib/structured-data";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: { icon: siteConfig.logo },
  openGraph: {
    type: "website",
    title: siteConfig.brand,
    description:
      "Treino personalizado presencial e consultoria online. Planejamento, acompanhamento e evolução consistente.",
    images: [siteConfig.logo],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = getStructuredData();

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-ink font-sans text-[17px] leading-[1.65] text-fg-muted antialiased">
        <a
          href="#conteudo"
          className="sr-only z-[200] rounded-lg bg-lime px-5 py-3 font-bold text-onlime focus:not-sr-only focus:fixed focus:left-4 focus:top-2"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
