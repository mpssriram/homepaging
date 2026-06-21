import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useState } from "react";
import { useMobileViewport } from "../../hooks/useMobileViewport";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { sessionStatus } from "../../pages/homeData";
import { DecryptedText } from "../ui/DecryptedText";

export function Navbar() {
  const normalizedPath =
    window.location.pathname.replace(/\/+$/, "") || "/";
  const isInternalPage = normalizedPath !== "/";
  const reducedMotion = useReducedMotion();
  const isMobileViewport = useMobileViewport();
  // Drop the always-running glow/pulse loops on mobile and when the user
  // prefers reduced motion; keep brand, menu, and the Join CTA.
  const calmMotion = reducedMotion || isMobileViewport;
  const { scrollY } = useScroll();
  const [isPinned, setIsPinned] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/community", label: "Community" },
    { href: "/team", label: "Team" },
    { href: "/events", label: "Events" },
    { href: "/projects", label: "Projects" },
  ];

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const delta = current - previous;

    setHasScrolled(current > 24);

    if (reducedMotion) {
      setIsPinned(true);
      return;
    }

    if (current < 48) {
      setIsPinned(true);
      return;
    }

    if (delta > 0.5) {
      setIsPinned(false);
    } else if (delta < -0.5) {
      setIsPinned(true);
    }
  });

  return (
    <motion.header
      animate={{
        opacity: isPinned ? 1 : 0.94,
        y: isPinned ? 0 : -24,
      }}
      className="fixed inset-x-0 top-0 z-[40] pointer-events-auto"
      initial={false}
      transition={{
        duration: reducedMotion ? 0 : 0.35,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div className="mx-auto mt-2 flex w-[min(calc(100%-2.5rem),82rem)] items-center justify-center gap-2 truncate px-2 text-center text-[0.58rem] tracking-[0.16em] text-[rgba(226,243,250,0.62)]">
        <span className="h-[0.3rem] w-[0.3rem] shrink-0 rounded-full bg-accent-red" />
        <span className="truncate">
          {sessionStatus.buildNight.label} / {sessionStatus.buildNight.schedule}{" "}
          / {sessionStatus.buildNight.location}
        </span>
      </div>
      <motion.nav
        animate={{
          backgroundColor: hasScrolled
            ? "rgba(2, 6, 23, 0.74)"
            : "rgba(2, 6, 23, 0.16)",
          borderColor: hasScrolled
            ? "rgba(255, 59, 107, 0.2)"
            : "rgba(255, 59, 107, 0.08)",
          boxShadow: hasScrolled
            ? "0 1.2rem 3rem rgba(2, 6, 23, 0.28), inset 0 0 0 1px rgba(224, 242, 254, 0.04)"
            : "0 0 0 rgba(0, 0, 0, 0)",
          width: hasScrolled
            ? "min(calc(100% - 1.5rem), 78rem)"
            : "min(calc(100% - 2.5rem), 82rem)",
          marginTop: hasScrolled ? "0.75rem" : "0rem",
        }}
        aria-label="Main navigation"
        className="mx-auto flex h-[4.25rem] items-center justify-between rounded-[1.35rem] border px-[0.8rem] text-[0.68rem] uppercase tracking-[0.18em] backdrop-blur-[16px] md:h-[5.25rem] md:rounded-[1.6rem] md:px-[1rem]"
        initial={false}
        transition={{
          duration: reducedMotion ? 0 : 0.35,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <motion.a
          aria-label="Dev Cell Club home"
          className="flex items-center gap-[0.7rem] font-bold text-white"
          href="/"
          whileHover={reducedMotion ? undefined : { x: 2 }}
        >
          <motion.span
            animate={
              calmMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 0 0.8rem rgba(139, 234, 255, 0.55)",
                      "0 0 1.3rem rgba(139, 234, 255, 0.95)",
                      "0 0 0.8rem rgba(139, 234, 255, 0.55)",
                    ],
                    scale: [1, 1.16, 1],
                  }
            }
            className="h-[0.48rem] w-[0.48rem] rounded-full bg-accent-cyan"
            transition={{
              duration: 2.4,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
          <span className="inline-block min-w-[5ch] font-variant-numeric-tabular-nums tracking-[0.04em]">
            <DecryptedText text="Dev Cell" trigger="hover" duration={700} />
          </span>
        </motion.a>

        <div className="cockpit-nav-links hidden items-center gap-[0.3rem] rounded-[999px] border border-[rgba(255,59,107,0.22)] bg-[rgba(3,7,18,0.56)] p-[0.32rem] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.04),0_0_2rem_rgba(2,6,23,0.2)] md:flex">
          {links.map((link) => {
            const isActive = normalizedPath === link.href;

            return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={`relative inline-flex h-[2.2rem] items-center rounded-[999px] px-[0.95rem] text-[rgba(224,242,254,0.72)] transition-[color,background,border-color,box-shadow,transform] duration-180 ease-out ${
                  isActive
                    ? "text-white"
                    : "hover:bg-[rgba(8,18,32,0.82)] hover:text-white focus-visible:bg-[rgba(8,18,32,0.82)] focus-visible:text-white"
                }`}
                href={link.href}
                key={link.href}
              >
                {isActive ? (
                  <motion.span
                    className="absolute inset-0 rounded-[999px] bg-[linear-gradient(180deg,rgba(255,59,107,0.24),rgba(255,99,124,0.12))] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.06),0_0_1.4rem_rgba(255,59,107,0.18)]"
                    layoutId="navbar-active-pill"
                    transition={{
                      duration: reducedMotion ? 0 : 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                ) : null}
                <span className="relative z-[1]">{link.label}</span>
              </a>
            );
          })}
          <motion.a
            className="relative inline-flex h-[2.2rem] items-center rounded-[999px] bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,59,107,0.08))] px-[0.95rem] text-[#fee2e2] transition-[color,background,border-color,box-shadow,transform] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.24),rgba(255,59,107,0.12))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.24),rgba(255,59,107,0.12))]"
            href={isInternalPage ? "/community#community-join" : "#join"}
            whileHover={reducedMotion ? undefined : { y: -1, scale: 1.03 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            <span className="relative z-[1]">Join</span>
            <motion.span
              animate={
                reducedMotion ? undefined : { opacity: [0.2, 0.55, 0.2] }
              }
              className="absolute inset-0 rounded-[999px] border border-[rgba(255,235,238,0.12)]"
              transition={{
                duration: 2.1,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </motion.a>
        </div>
        <motion.a
          className="relative inline-flex h-[2.2rem] items-center rounded-[999px] bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,59,107,0.08))] px-[0.95rem] text-[#fee2e2] transition-[color,background,border-color,box-shadow,transform] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.24),rgba(255,59,107,0.12))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.24),rgba(255,59,107,0.12))] md:hidden"
          href={isInternalPage ? "/community#community-join" : "#join"}
          whileHover={reducedMotion ? undefined : { y: -1, scale: 1.03 }}
          whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        >
          <span className="relative z-[1]">Join</span>
          <motion.span
            animate={
              calmMotion ? undefined : { opacity: [0.2, 0.55, 0.2] }
            }
            className="absolute inset-0 rounded-[999px] border border-[rgba(255,235,238,0.12)]"
            transition={{
              duration: 2.1,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.a>
        <div className="relative md:hidden">
          <button
            aria-expanded={isMenuOpen}
            aria-label="Open navigation menu"
            className="cockpit-mobile-menu-button"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
          {isMenuOpen ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="cockpit-mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              transition={{
                duration: reducedMotion ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {links.map((link) => {
                const isActive = normalizedPath === link.href;

                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
            </motion.div>
          ) : null}
        </div>
      </motion.nav>
    </motion.header>
  );
}
