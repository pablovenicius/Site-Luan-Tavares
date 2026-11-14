import Image from "next/image";
import { siteConfig, navLinks } from "@/config/site";
import { whatsappLinks } from "@/lib/whatsapp";
import { IconInstagram } from "@/components/icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/[.07] bg-ink-deep pb-24 md:pb-0">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/50 to-transparent"
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
              className="text-sm font-semibold text-fg-muted transition-colors hover:text-lime"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center md:justify-end">
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener"
            aria-label={`Instagram @${siteConfig.instagram}`}
            className="group inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full border border-white/15 w-12 text-sm font-semibold text-fg-muted transition-colors hover:border-lime/50 hover:text-lime"
          >
            <IconInstagram className="h-5 w-5 text-lime transition-transform duration-300 group-hover:scale-110" />
          </a>
          <WhatsAppButton
            href={whatsappLinks.geral}
            section="rodape"
            size="md"
            className="w-12 gap-0 !px-0"
          >
            <span className="sr-only">WhatsApp</span>
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
    </footer>
  );
}
