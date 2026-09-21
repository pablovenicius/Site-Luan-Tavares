declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara o evento de clique no WhatsApp para GA4 e Meta Pixel,
 * quando os respectivos scripts estiverem presentes na página.
 */
export function trackWhatsAppClick(secao: string): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "whatsapp_click", { secao });
  window.fbq?.("trackCustom", "WhatsAppClick", { secao });
}
