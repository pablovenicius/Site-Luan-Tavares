declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Dispara o clique no WhatsApp para GA4 e Meta Pixel, se estiverem na página. */
export function trackWhatsAppClick(secao: string): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "whatsapp_click", { secao });
  window.fbq?.("trackCustom", "WhatsAppClick", { secao });
}
