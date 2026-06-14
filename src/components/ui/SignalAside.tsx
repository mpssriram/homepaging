type SignalAsideProps = {
  label: string;
  text: string;
};

export function SignalAside({
  label,
  text,
}: SignalAsideProps) {
  return (
    <aside className="section-shell__aside">
      <span className="section-shell__kicker">{label}</span>
      <p>{text}</p>
    </aside>
  );
}
