"use client";

import { siteConfig, footerLinks } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-fg/[.08] bg-ink-deep">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-9 px-5 pb-7 pt-14">
        <div>
          <Logo loading="lazy" className="mb-[18px]" imageClassName="w-[186px]" />
          <p className="max-w-[34ch] text-sm text-fg-subtle">
            Treino personalizado presencial em {siteConfig.city} e consultoria online para todo o
            Brasil.
          </p>
        </div>

        <nav aria-label="Rodapé" className="grid content-start gap-2.5">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-fg">Navegação</p>
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] text-fg-muted transition-colors hover:text-lime"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="grid content-start gap-2.5">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-fg">Contato</p>
          <a
            href={whatsappLinks.geral}
            target="_blank"
            rel="noopener"
            data-wa="footer"
            onClick={() => trackWhatsAppClick("footer")}
            className="text-[15px] font-semibold text-lime"
          >
            WhatsApp: [WHATSAPP]
          </a>
          <a
            href={`https://instagram.com/${siteConfig.instagram}`}
            target="_blank"
            rel="noopener"
            className="text-[15px] text-fg-muted transition-colors hover:text-lime"
          >
            Instagram: @{siteConfig.instagram}
          </a>
          <p className="text-[15px] text-fg-muted">
            Atendimento: {siteConfig.city} e região
          </p>
          <p className="text-[15px] text-fg-muted">CREF: {siteConfig.cref}</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 border-t border-fg/[.07] px-5 pb-10 pt-5">
        <p className="text-[13px] text-fg-faint">
          © {year} {siteConfig.brand}. Todos os direitos reservados.
        </p>
        <a href="#" className="text-[13px] text-fg-subtle transition-colors hover:text-lime">
          Política de privacidade
        </a>
      </div>

      {/* Espaço reservado para a barra fixa do WhatsApp em telas pequenas */}
      <div className="h-[84px] md:hidden" />
    </footer>
  );
}
