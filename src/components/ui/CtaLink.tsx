import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Shared call-to-action link. One source of truth for the CTA's padding, type,
 * border, color, and hover/focus treatment — pages pass `href` + label and pick
 * a `variant`. Spacing is intentionally NOT baked in; callers add `mt-8` (or
 * whatever they need) via `className` so layout stays decoupled from the button.
 */
export type CtaVariant = "primary" | "ghost" | "cyan" | "team" | "teamGhost";

const BASE =
  "inline-flex items-center justify-center px-[1.3rem] py-4 border text-[0.68rem] tracking-[0.16em] uppercase transition-[color,background,border-color,box-shadow] duration-180 ease-out";

const VARIANTS: Record<CtaVariant, string> = {
  // Pink/magenta primary (Community + Projects)
  primary:
    "border-[rgba(255,59,107,0.38)] text-[#c5f8ff] bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]",
  // Red secondary (Community + Projects)
  ghost:
    "border-[rgba(255,59,107,0.35)] text-[#fee2e2] bg-[linear-gradient(180deg,rgba(255,59,107,0.12),rgba(255,59,107,0.04))] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))]",
  // Cyan solid (Events)
  cyan:
    "border-[rgba(34,211,238,0.45)] text-[#c5f8ff] bg-[rgba(8,30,46,0.72)] shadow-[inset_0_0_1.4rem_rgba(34,211,238,0.12)] hover:text-[#020617] hover:bg-[#22d3ee] focus-visible:text-[#020617] focus-visible:bg-[#22d3ee]",
  // Cyan gradient primary (Team)
  team:
    "border-[rgba(139,234,255,0.46)] text-[#d9fbff] bg-[linear-gradient(135deg,rgba(8,52,70,0.86),rgba(8,25,38,0.88))] shadow-[inset_0_0_1.4rem_rgba(139,234,255,0.08)] hover:text-[#f8fafc] hover:border-[rgba(139,234,255,0.7)] focus-visible:text-[#f8fafc] focus-visible:border-[rgba(139,234,255,0.7)]",
  // Soft red secondary (Team)
  teamGhost:
    "border-[rgba(255,59,107,0.28)] text-[#fee2e2] bg-[rgba(69,17,27,0.32)] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] hover:border-[rgba(248,113,113,0.5)] hover:text-[#fff7f7] focus-visible:border-[rgba(248,113,113,0.5)] focus-visible:text-[#fff7f7]",
};

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: CtaVariant;
  children: ReactNode;
};

export function CtaLink({
  variant = "primary",
  className,
  children,
  ...rest
}: CtaLinkProps) {
  return (
    <a
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </a>
  );
}
