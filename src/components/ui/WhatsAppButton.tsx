"use client";

import type { ReactNode } from "react";
import { IconWhatsApp, IconArrow } from "@/components/icons";
import { trackWhatsAppClick } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type Props = {
  href: string;
  /** Seção de origem do clique (analytics). */
  section: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "lg";
  icon?: boolean;
  arrow?: boolean;
  /** Círculo só com o ícone (o texto fica só para leitores de tela). */
  iconOnly?: boolean;
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-bold transition-all duration-300";

const variants = {
  solid:
    "bg-lime text-onlime shadow-[0_1px_0_rgba(255,255,255,.25)_inset,0_8px_20px_-10px_rgba(0,0,0,.7)] hover:bg-lime-soft active:translate-y-px",
  outline: "border border-white/20 text-fg hover:border-lime/70 hover:bg-lime/[.07] hover:text-lime",
};
const sizes = { md: "min-h-[48px] px-6 text-[15px]", lg: "min-h-[56px] px-8 text-base" };

export function WhatsAppButton({
  href,
  section,
  children,
  variant = "solid",
  size = "md",
  icon = true,
  arrow = false,
  iconOnly = false,
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-wa={section}
      onClick={() => trackWhatsAppClick(section)}
      className={cn(base, variants[variant], iconOnly ? "h-12 w-12 flex-none" : sizes[size], className)}
    >
      {iconOnly ? (
        <>
          <IconWhatsApp className="relative block h-6 w-6" />
          <span className="sr-only">{children}</span>
        </>
      ) : (
        <>
          {icon && <IconWhatsApp className="relative h-5 w-5 flex-none" />}
          <span className="relative">{children}</span>
        </>
      )}
      {arrow && (
        <IconArrow className="relative h-4 w-4 flex-none transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </a>
  );
}
