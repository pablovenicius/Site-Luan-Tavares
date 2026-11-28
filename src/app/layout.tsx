import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { JetBrains_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
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

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: siteConfig.brand,
    description:
      "Consultoria online com aplicativo personalizado e treino presencial em Aracaju. Planejamento, acompanhamento e evolução consistente.",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.brand }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.brand,
    images: [siteConfig.ogImage],
  },
};

export const viewport: Viewport = { themeColor: "#0E1013" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = getStructuredData();
  // Medição: só carrega se o ID estiver definido na hospedagem (NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_META_PIXEL_ID)
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jakarta.variable} ${mono.variable}`}>
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
          className="sr-only z-[200] rounded-full bg-lime px-5 py-3 font-semibold text-onlime focus:not-sr-only focus:fixed focus:left-4 focus:top-2"
        >
          Pular para o conteúdo
        </a>
        {children}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        {pixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
