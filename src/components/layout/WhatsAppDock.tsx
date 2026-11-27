"use client";

import { useEffect, useState } from "react";
import { whatsappLinks } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";
import { IconWhatsApp } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { cn } from "@/lib/cn";

/** Botão flutuante (desktop) e barra fixa (mobile) — só aparecem depois da primeira tela. */
export function WhatsAppDock() {
  const [show, setShow] = useState(false);
  const [noContato, setNoContato] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // a barra some quando a seção de contato (que já tem o botão) está na tela
  useEffect(() => {
    const el = document.getElementById("contato");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNoContato(!!e?.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a
        href={whatsappLinks.geral}
        target="_blank"
        rel="noopener"
        aria-label="Chamar no WhatsApp"
        data-wa="flutuante"
        onClick={() => trackWhatsAppClick("flutuante")}
        className={cn(
          "fixed bottom-6 right-6 z-[95] hidden h-[60px] w-[60px] place-items-center rounded-full bg-lime text-onlime shadow-[0_14px_36px_rgba(0,0,0,.5)] transition-all duration-500 hover:scale-110 md:grid",
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        )}
      >
        <IconWhatsApp className="h-7 w-7" />
      </a>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-ink-deep/90 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 md:hidden",
          show && !noContato ? "translate-y-0" : "translate-y-full"
        )}
        aria-hidden={!(show && !noContato)}
      >
        <WhatsAppButton href={whatsappLinks.geral} section="barra-mobile" size="lg" className="w-full">
          Chamar no WhatsApp
        </WhatsAppButton>
      </div>
    </>
  );
}
