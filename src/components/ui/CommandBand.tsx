import { motion } from "framer-motion";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export type CommandBandItem = {
  label: string;
  value: string;
  text: string;
};

type CommandBandProps = {
  items: CommandBandItem[];
  variant?: string;
};

export function CommandBand({
  items,
  variant,
}: CommandBandProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`page-command-band${variant ? ` page-command-band--${variant}` : ""}`}>
      {items.map((item, index) => (
        <motion.article
          animate={{ opacity: 1, y: 0 }}
          className="page-command-band__item"
          initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 18 }}
          key={item.label}
          transition={{
            duration: reducedMotion ? 0 : 0.36,
            delay: reducedMotion ? 0 : index * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
          whileHover={reducedMotion ? undefined : { y: -4, scale: 1.01 }}
        >
          <span className="page-command-band__label">{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.text}</p>
        </motion.article>
      ))}
    </div>
  );
}
