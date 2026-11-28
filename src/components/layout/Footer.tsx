import Image from "next/image";
import { siteConfig, navLinks } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconInstagram } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { DevCredit } from "@/components/devcredit/DevCredit";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[.07] bg-ink-deep pb-24 md:pb-0">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-white/[.08]"
      />
      <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-12 md:grid-cols-[1fr_auto_1fr]">
        <Image
          src={siteConfig.logo}
          alt={siteConfig.brand}
          width={4311}
          height={2187}
          sizes="200px"
          className="h-auto w-[160px] md:w-[200px]"
        />

        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-8 gap-y-3 md:justify-center">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex min-h-[44px] items-center text-sm font-semibold text-fg-muted transition-colors hover:text-lime"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener"
            aria-label={`Instagram @${siteConfig.instagram}`}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-white/15 w-12 text-sm font-semibold text-fg-muted transition-colors hover:border-lime/50 hover:text-lime"
          >
            <IconInstagram className="h-5 w-5 text-lime transition-colors duration-200" />
          </a>
          <WhatsAppButton href={whatsappLinks.geral} section="rodape" iconOnly>
            Chamar no WhatsApp
          </WhatsAppButton>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-2 border-t border-white/[.06] px-5 py-6 font-mono text-[12px] tracking-wide text-fg-faint">
        <p>
          © {year} {siteConfig.brand}
        </p>
        <p>
          CREF {siteConfig.cref} · {siteConfig.city}
        </p>
      </div>

      <div className="border-t border-white/[.06] px-5 py-8">
        <DevCredit projeto="o site do Luan Tavares" />
      </div>
    </footer>
  );
}
