"use client";

import type { ReactNode } from "react";
import { IconWhatsApp } from "@/components/icons";
import { trackWhatsAppClick } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type WhatsAppButtonProps = {
  href: string;
  /** Identifica a seção de origem do clique, para analytics (equivalente ao data-wa). */
  section: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "lg";
  icon?: boolean;
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-xl font-extrabold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime";

const variants = {
  solid:
    "bg-gradient-to-br from-lime to-lime-dark text-onlime shadow-[0_10px_34px_rgba(95,227,27,.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_42px_rgba(95,227,27,.4)]",
  outline: "border border-lime/50 text-lime hover:bg-lime/10 hover:text-lime-soft",
};

const sizes = {
  md: "min-h-[48px] px-6 text-[15px]",
  lg: "min-h-[52px] px-7 text-base",
};

export function WhatsAppButton({
  href,
  section,
  children,
  variant = "solid",
  size = "md",
  icon = true,
  className,
}: WhatsAppButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      data-wa={section}
      onClick={() => trackWhatsAppClick(section)}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {icon && <IconWhatsApp className="h-5 w-5 flex-none" />}
      {children}
    </a>
  );
}
