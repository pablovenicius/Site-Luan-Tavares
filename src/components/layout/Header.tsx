"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig, navLinks } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconMenu } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { cn } from "@/lib/cn";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-fg/[.08] bg-ink/[.88] backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-5 py-2.5">
        <a href="#topo" aria-label={`${siteConfig.brand}, início`} className="block flex-none">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.brand}
            width={1400}
            height={768}
            priority
            className="block h-14 w-auto rounded-md"
          />
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold tracking-wide text-fg-muted transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <WhatsAppButton href={whatsappLinks.geral} section="header" size="md">
            Chamar no WhatsApp
          </WhatsAppButton>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-[46px] w-[46px] place-items-center rounded-[10px] border border-fg/[.22] bg-transparent md:hidden"
          >
            <IconMenu className="h-5 w-5 text-fg" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Navegação principal"
          className="grid gap-0.5 border-t border-fg/[.08] bg-ink-alt px-5 pb-[18px] pt-2.5 md:hidden"
        >
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "py-3.5 px-1 font-semibold text-fg",
                index < navLinks.length - 1 && "border-b border-fg/[.06]"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
