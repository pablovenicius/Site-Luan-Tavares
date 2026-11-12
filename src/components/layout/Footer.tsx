import Image from "next/image";
import { siteConfig, navLinks } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[.07] bg-ink-deep pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-5 py-12">
        <Image
          src={siteConfig.logo}
          alt={siteConfig.brand}
          width={4311}
          height={2187}
          sizes="200px"
          className="h-auto w-[200px]"
        />
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-8 gap-y-3">
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
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-2 border-t border-white/[.06] px-5 py-6 text-[13px] text-fg-faint">
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
