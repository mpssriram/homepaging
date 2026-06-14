import "./dev-loader.css";

export type DevLoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "cyan" | "blue" | "red";
};

export function DevLoader({
  label = "Loading Dev Cell...",
  size = "md",
  variant = "cyan",
}: DevLoaderProps) {
  return (
    <div
      className={`dev-loader-wrap dev-loader-wrap--${size} dev-loader-wrap--${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="dev-loader" aria-hidden="true" />
      {label ? <p className="dev-loader-label">{label}</p> : null}
    </div>
  );
}
