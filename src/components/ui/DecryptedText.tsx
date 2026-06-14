import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

type DecryptedTextProps = {
  text: string;
  className?: string;
  /** ms per character scramble */
  speed?: number;
  /** total ms to play through one cycle */
  duration?: number;
  /** character set used to scramble */
  characters?: string;
  /** play once on mount, or on every hover */
  trigger?: "mount" | "hover" | "inView";
};

const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[]<>?/|";

function pickFrom(chars: string) {
  return chars[Math.floor(Math.random() * chars.length)];
}

export function DecryptedText({
  text,
  className,
  speed = 28,
  duration = 900,
  characters = DEFAULT_CHARS,
  trigger = "inView",
}: DecryptedTextProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? text : "");
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const playedRef = useRef(false);

  const play = () => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }

    if (playedRef.current && trigger !== "hover") {
      return;
    }

    playedRef.current = true;
    const startedAt = performance.now();
    const totalTicks = Math.max(1, Math.round(duration / speed));

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / duration);
      const revealCount = Math.floor(progress * text.length);

      let next = "";
      for (let i = 0; i < text.length; i += 1) {
        if (i < revealCount) {
          next += text[i];
        } else if (text[i] === " ") {
          next += " ";
        } else {
          next += pickFrom(characters);
        }
      }

      setDisplay(next);

      if (progress < 1) {
        const jitter = speed * (0.6 + Math.random() * 0.8);
        window.setTimeout(() => {
          tick(performance.now());
        }, jitter);
      } else {
        setDisplay(text);
      }

      // totalTicks is reserved for future per-tick RAF optimization
      void totalTicks;
    };

    tick(startedAt);
  };

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }

    if (trigger === "mount") {
      play();
      return;
    }

    if (trigger === "inView") {
      const node = containerRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              play();
              observer.disconnect();
              break;
            }
          }
        },
        { threshold: 0.2 },
      );

      observer.observe(node);
      return () => observer.disconnect();
    }

    // trigger === "hover" runs on user interaction; nothing to do in effect
  }, [characters, duration, reducedMotion, speed, text, trigger]);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      playedRef.current = false;
      play();
    }
  };

  return (
    <span
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      aria-label={text}
    >
      <span aria-hidden="true">{display || (reducedMotion ? text : text[0] ?? "")}</span>
    </span>
  );
}
