"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { siteConfig, navLinks } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconMenu, IconClose, IconInstagram } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // encolhe ao rolar; esconde ao descer e volta ao subir
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > last && y > 420);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-all duration-500",
          scrolled ? "border-b border-white/[.07] bg-ink/75 backdrop-blur-xl" : "bg-transparent",
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 transition-all duration-500",
            scrolled ? "py-2" : "py-3.5 md:py-5"
          )}
        >
          <a href="#topo" aria-label={`${siteConfig.brand}, início`} className="flex items-center gap-3">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.brand}
              width={4311}
              height={2187}
              sizes="140px"
              priority
              className={cn("w-auto transition-all duration-500", scrolled ? "h-[44px] md:h-[54px]" : "h-[56px] md:h-[68px]")}
            />
          </a>

          <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative py-1 text-sm font-semibold text-fg-muted transition-colors hover:text-fg"
              >
                {l.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener"
              aria-label={`Instagram @${siteConfig.instagram}`}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-fg-muted transition-colors hover:border-lime/50 hover:text-lime"
            >
              <IconInstagram className="h-5 w-5" />
            </a>
            <div className="hidden md:block">
              <WhatsAppButton href={whatsappLinks.geral} section="header" size="md">
                Chamar no WhatsApp
              </WhatsAppButton>
            </div>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-fg md:hidden"
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* menu mobile em tela cheia */}
      <div
        className={cn(
          "fixed inset-0 z-[99] flex flex-col justify-center bg-ink/95 px-8 backdrop-blur-2xl transition-all duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav aria-label="Menu" className="grid gap-1">
          {navLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              className={cn(
                "border-b border-white/[.07] py-5 font-serif text-4xl font-bold text-fg transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mt-10 grid gap-4">
          <WhatsAppButton
            href={whatsappLinks.geral}
            section="menu-mobile"
            size="lg"
            className="w-full"
          >
            Chamar no WhatsApp
          </WhatsAppButton>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener"
            aria-label={`Instagram @${siteConfig.instagram}`}
            className="flex items-center justify-center gap-2.5 rounded-full border border-white/15 py-3.5 text-sm font-semibold text-fg-muted"
          >
            <IconInstagram className="h-5 w-5 text-lime" />
          </a>
        </div>
      </div>
    </>
  );
}
