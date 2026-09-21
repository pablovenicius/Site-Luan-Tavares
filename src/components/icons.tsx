import type { SVGProps } from "react";

/**
 * Todos os ícones usam stroke="currentColor" — controle a cor via
 * className (ex.: className="text-lime") no componente que os usa.
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function IconWhatsApp(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} stroke="currentColor" {...props}>
      <path d="M3 21l1.7-5A8.4 8.4 0 1 1 8 19.4L3 21z" />
      <path d="M8.6 9.2c.3 2.6 3.6 5.9 6.2 6.2l1.2-1.4 2 1.1-.4 1.6c-3.1.7-8.4-4.6-9.3-8l1.6-.5 1.1 2-1.2 1" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} stroke="currentColor" {...props}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.8} stroke="currentColor" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

export function IconDumbbell(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M3 12h2M19 12h2M7 8v8M17 8v8" />
      <rect x="7" y="9.5" width="10" height="5" rx="1" />
    </svg>
  );
}

export function IconTrend(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M4 18L10 12l4 4 6-8" />
      <path d="M20 8h-4M20 8v4" />
    </svg>
  );
}

export function IconHeartPulse(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M12 21s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.4-7 10-7 10z" />
      <path d="M2 12h4l1.5-3 2 6 2-4.5 1.5 1.5h9" />
    </svg>
  );
}

export function IconStrength(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M6 4l3 3M18 4l-3 3" />
      <path d="M12 7v13" />
      <path d="M7 20h10" />
    </svg>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function IconHeartCheck(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M17 11l2 2 4-4" />
    </svg>
  );
}

export function IconBarChart(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  );
}

export function IconApp(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
      <path d="M10 9.5l4 2.2-4 2.3z" />
    </svg>
  );
}

export function IconQuote(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M9 7H5v5h4v5H5m14-10h-4v5h4v5h-4" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base} stroke="currentColor" {...props}>
      <path d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconInstagram(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.7} stroke="currentColor" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
