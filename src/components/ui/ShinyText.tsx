import "./shiny-text.css";

type ShinyTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function ShinyText({
  children,
  className,
}: ShinyTextProps) {
  return (
    <span className={`dev-shiny-text${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}
