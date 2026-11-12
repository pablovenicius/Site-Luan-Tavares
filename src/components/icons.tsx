import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconWhatsApp = (p: IconProps) => (
  <svg {...base} strokeWidth={1.8} {...p}>
    <path d="M3 21l1.7-5A8.4 8.4 0 1 1 8 19.4L3 21z" />
    <path d="M8.6 9.2c.3 2.6 3.6 5.9 6.2 6.2l1.2-1.4 2 1.1-.4 1.6c-3.1.7-8.4-4.6-9.3-8l1.6-.5 1.1 2-1.2 1" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
);
export const IconClose = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconArrow = (p: IconProps) => (
  <svg {...base} strokeWidth={1.8} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconInstagram = (p: IconProps) => (
  <svg {...base} strokeWidth={1.7} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const IconDumbbell = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12h2M19 12h2M7 8v8M17 8v8" />
    <rect x="7" y="9.5" width="10" height="5" rx="1" />
  </svg>
);
export const IconApp = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
    <path d="M10 9.5l4 2.2-4 2.3z" />
  </svg>
);
export const IconBarChart = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);
