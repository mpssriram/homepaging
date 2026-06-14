/**
 * Shared section header (eyebrow + display title + optional lede).
 * Single source of truth for the four interior pages, which each used to declare
 * a near-identical copy of this.
 */
type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  text?: string;
  centered?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  text,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div className={`max-w-[56rem] min-w-0${centered ? " mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-[clamp(2.8rem,7vw,5.8rem)] font-bold tracking-[-0.055em] leading-[0.92] uppercase mt-[1.1rem]">
        {title}
      </h2>
      {text ? (
        <p
          className={`text-text-dim text-[0.84rem] leading-[1.85] max-w-[42rem] mt-[1.15rem] overflow-wrap-break-word${
            centered ? " mx-auto" : ""
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}
