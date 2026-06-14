import { motion } from "framer-motion";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CockpitHero } from "../components/cinematic-hero/CockpitHero";
import { Magnet } from "../components/ui/Magnet";
import { ShinyText } from "../components/ui/ShinyText";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { homePrograms, homeSpecs, waysIn, workPreview } from "./homeData";

const HomeDroneHero = lazy(
  () => import("../components/cinematic-hero/HomeDroneHero"),
);

function DeferredHomeDroneHero() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount || shouldLoad) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(mount);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={mountRef}>
      {shouldLoad ? (
        <Suspense fallback={<div aria-hidden="true" className="min-h-screen" />}>
          <HomeDroneHero />
        </Suspense>
      ) : (
        <div aria-hidden="true" className="min-h-screen" />
      )}
    </div>
  );
}

function RevealBlock({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, amount: 0.18 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  id?: string;
}) {
  return (
    <RevealBlock>
      <p className="eyebrow text-accent-pink">{eyebrow}</p>
      <div className="section-heading">
        <h2 className="type-display" id={id}>
          {title}
        </h2>
        {text ? <p className="type-body max-w-[31rem]">{text}</p> : null}
      </div>
    </RevealBlock>
  );
}

function AboutSection() {
  return (
    <section className="content-section" id="about">
      <div className="intro-grid">
        <RevealBlock>
          <p className="eyebrow text-accent-pink">What we are</p>
          <h2 className="type-display mt-5">
            A small room of students who{" "}
            <span className="text-accent-cyan">build.</span>
          </h2>
        </RevealBlock>
        <RevealBlock className="pt-2 md:pt-8" delay={0.08}>
          <p className="type-lead">
            Dev Cell is not a lecture series. It is a working club: build
            nights, code reviews, shared repos, and the kind of feedback that
            makes the next thing better than the last.
          </p>
          <p className="type-body mt-5">
            We pair beginners with builders, run practical sessions, review
            ideas, and help students understand how the whole stack feels in
            their hands.
          </p>
          <div className="mt-8 border-t border-[rgba(139,234,255,0.16)]">
            {homeSpecs.map((spec) => (
              <div
                className="grid gap-2 border-b border-[rgba(139,234,255,0.12)] py-3 sm:grid-cols-[1fr_auto] sm:items-baseline"
                key={spec.label}
              >
                <span className="type-label text-text-muted">{spec.label}</span>
                <span className="font-display text-[1.12rem] font-semibold uppercase tracking-[0.02em] text-text-primary">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}

function ProgramsSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="programs-heading"
      className="content-section pt-0"
    >
      <SectionIntro
        eyebrow="What we run"
        id="programs-heading"
        text="Three simple ways to get involved: learn by doing, contribute to real code, and try out your own ideas."
        title={
          <>
            Three programs, one{" "}
            <span className="text-accent-cyan">loop.</span>
          </>
        }
      />

      <div className="mt-[3rem] grid gap-4 md:grid-cols-3">
        {homePrograms.map((program, index) => (
          <RevealBlock delay={index * 0.08} key={program.number}>
            <motion.article
              className="card-standard h-full min-h-[18rem] p-6"
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      y: -3,
                    }
              }
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="type-label text-accent-cyan-soft">
                  {program.number}
                </span>
                <span className="text-[0.68rem] uppercase tracking-[0.18em] text-text-muted">
                  {program.meta}
                </span>
              </div>
              <h3 className="mt-5 font-display text-[clamp(2rem,4vw,2.45rem)] font-semibold uppercase leading-[0.96] tracking-[-0.025em]">
                {program.title}
              </h3>
              <p className="type-body mt-4">{program.description}</p>
              <a
                className="text-link mt-8"
                href={program.number === "03" ? "#join" : "/events"}
              >
                <span aria-hidden="true" className="cta-arrow">
                  {">"}
                </span>
                <span>How it runs</span>
              </a>
            </motion.article>
          </RevealBlock>
        ))}
      </div>
    </section>
  );
}

function WorkPreview() {
  return (
    <section aria-labelledby="work-heading" className="content-section pt-0">
      <RevealBlock>
        <div className="flex flex-col gap-5 border-b border-[rgba(139,234,255,0.16)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow text-accent-pink">Projects</p>
            <h2
              className="mt-4 font-display text-[clamp(2.1rem,5.8vw,4.4rem)] font-bold uppercase leading-[0.94] tracking-[-0.045em]"
              id="work-heading"
            >
              {workPreview.title}
            </h2>
          </div>
          <a className="text-link" href="/projects">
            See projects <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </RevealBlock>

      <RevealBlock>
        <p className="type-body mt-6 max-w-[42rem]">{workPreview.description}</p>
      </RevealBlock>
    </section>
  );
}

function WaysInSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="ways-heading" className="content-section pt-0">
      <SectionIntro eyebrow="Ways in" id="ways-heading" title="Pick a door." />

      <div className="mt-8 border-t border-[rgba(139,234,255,0.16)]">
        {waysIn.map((way, index) => (
          <RevealBlock delay={index * 0.045} key={way.number}>
            <motion.a
              className="group grid gap-4 border-b border-[rgba(139,234,255,0.12)] py-6 transition-colors duration-200 hover:bg-[rgba(139,234,255,0.035)] sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:px-2"
              href={way.href}
              whileHover={
                reducedMotion
                  ? undefined
                  : {
                      x: 8,
                    }
              }
            >
              <span className="type-label text-accent-pink">{way.number}</span>
              <span className="grid gap-2 lg:grid-cols-[minmax(12rem,18rem)_1fr] lg:items-baseline lg:gap-8">
                <span className="font-display text-[clamp(2rem,4vw,2.6rem)] font-semibold uppercase leading-none tracking-[-0.03em] text-text-primary">
                  {way.title}
                </span>
                <span className="text-[0.92rem] leading-[1.65] text-text-dim">
                  {way.description}
                </span>
              </span>
              <span className="text-link text-accent-cyan group-hover:text-white">
                {way.cta} <span aria-hidden="true">-&gt;</span>
              </span>
            </motion.a>
          </RevealBlock>
        ))}
      </div>
    </section>
  );
}

function JoinSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      className="content-section relative overflow-hidden pb-[10rem] pt-[5rem] text-center"
      id="join"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-[1] bg-[radial-gradient(ellipse_50rem_24rem_at_50%_58%,rgba(255,59,107,0.13),transparent_65%)]"
      />
      <RevealBlock className="visual-center-offset mx-auto flex max-w-[48rem] flex-col items-center">
        <motion.span
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.78, 1, 0.78],
                }
          }
          className="status-pill"
          transition={{
            duration: 2.4,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <span className="status-pill-dot" />
          Builder channel open
        </motion.span>
        <h2 className="mt-6 font-display text-[clamp(3rem,7vw,5.8rem)] font-bold uppercase leading-[0.92] tracking-[-0.055em]">
          If you would rather{" "}
          <span className="text-accent-red">build</span> than wait.
        </h2>
        <p className="type-lead mx-auto mt-6 max-w-[37rem]">
          Start with the community, meet the people building, and find a
          project or session where you can contribute.
        </p>
        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-4">
          <Magnet>
            <a
              className="primary-link !mt-0 border-[rgba(255,59,107,0.44)] bg-[linear-gradient(135deg,rgba(255,59,107,0.24),rgba(255,99,124,0.12))] text-[#ffe1e8]"
              href="mailto:hello@devcell.club"
            >
              <ShinyText>Join Dev Cell</ShinyText>
            </a>
          </Magnet>
          <a className="primary-link !mt-0" href="/community">
            Read the manifesto first
          </a>
        </div>
      </RevealBlock>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="site-page site-page--home cinematic-page">
      <main className="cinematic-page__content">
        <CockpitHero />
        {/* The R3F drone scene renders on every viewport; mobile adds a gyro
            tilt (see HomeDroneHero). It stays lazy + IntersectionObserver-gated,
            so off-screen it costs nothing. */}
        <DeferredHomeDroneHero />
        <AboutSection />
        <ProgramsSection />
        <WorkPreview />
        <WaysInSection />
        <JoinSection />

        <footer className="mx-auto flex w-[min(calc(100%-3rem),72rem)] flex-col gap-3 border-t border-[rgba(139,234,255,0.14)] py-8 text-[0.72rem] uppercase tracking-[0.16em] text-text-dim sm:flex-row sm:items-center sm:justify-between">
          <a className="text-text-primary" href="#top">
            Dev Cell Club
          </a>
          <span>Made on campus / Mandi</span>
        </footer>
      </main>
    </div>
  );
}
