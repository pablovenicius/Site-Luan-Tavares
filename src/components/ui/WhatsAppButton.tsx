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
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-bold transition-all duration-300";

const variants = {
  solid:
    "bg-lime text-onlime shadow-[0_10px_34px_-8px_rgba(168,255,31,.55)] hover:-translate-y-0.5 hover:bg-lime-soft hover:shadow-[0_18px_44px_-10px_rgba(168,255,31,.7)]",
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
  className,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-wa={section}
      onClick={() => trackWhatsAppClick(section)}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {variant === "solid" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/50 opacity-0 blur-md transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
        />
      )}
      {icon && <IconWhatsApp className="relative h-5 w-5 flex-none" />}
      <span className="relative">{children}</span>
      {arrow && (
        <IconArrow className="relative h-4 w-4 flex-none transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </a>
  );
}
