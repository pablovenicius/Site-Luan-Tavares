"use client";

import { whatsappLinks } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";
import { IconWhatsApp } from "@/components/icons";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLinks.geral}
      target="_blank"
      rel="noopener"
      aria-label="Chamar no WhatsApp"
      data-wa="flutuante"
      onClick={() => trackWhatsAppClick("flutuante")}
      className="fixed bottom-[calc(22px+env(safe-area-inset-bottom))] right-[22px] z-[95] hidden h-[60px] w-[60px] animate-wa-pulse place-items-center rounded-full bg-gradient-to-br from-lime to-lime-dark text-onlime shadow-[0_10px_30px_rgba(0,0,0,.45)] transition-transform hover:scale-[1.07] md:grid"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  );
}
