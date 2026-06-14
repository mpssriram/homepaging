import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "../components/cinematic-hero/Navbar";
import { CommandBand } from "../components/ui/CommandBand";
import { Dev3DCard } from "../components/ui/Dev3DCard";
import { GlowCard } from "../components/ui/GlowCard";
import { SignalAside } from "../components/ui/SignalAside";
import { useReducedMotion } from "../hooks/useReducedMotion";

type CardItem = {
  title: string;
  text: string;
};

type ValueCard = CardItem & {
  badgeTop: string;
  badgeMain: string;
  variant: "cyan" | "red" | "blue";
};

type StartStep = CardItem & {
  step: string;
};

const valueCards: ValueCard[] = [
  {
    title: "Learn",
    text: "Pick up web basics, Git, APIs, deployment, and modern tools through hands-on sessions.",
    badgeTop: "PATH",
    badgeMain: "01",
    variant: "cyan",
  },
  {
    title: "Build",
    text: "Join small teams working on websites, dashboards, club tools, and campus ideas.",
    badgeTop: "MAKE",
    badgeMain: "02",
    variant: "blue",
  },
  {
    title: "Get Help",
    text: "Ask doubts, review code, debug with seniors, and learn without pretending to know everything.",
    badgeTop: "HELP",
    badgeMain: "03",
    variant: "cyan",
  },
  {
    title: "Ship",
    text: "Turn practice into live demos, GitHub links, hackathon builds, and portfolio-ready work.",
    badgeTop: "LIVE",
    badgeMain: "04",
    variant: "red",
  },
];

const startSteps: StartStep[] = [
  { step: "01", title: "Join a session", text: "Come to an open lab, workshop, or build night. No expert badge needed." },
  { step: "02", title: "Pick a small task", text: "Start with a UI fix, GitHub issue, landing section, or beginner-friendly task." },
  { step: "03", title: "Build with feedback", text: "Share progress, get help, improve the work, and ship something real." },
];

const communitySignals = [
  { label: "Open Access", value: "All Levels", text: "Beginners, builders, designers, and curious students can start here." },
  { label: "Live Rhythm", value: "Weekly Builds", text: "Workshops and build nights keep the community moving." },
  { label: "Support Layer", value: "Mentor Active", text: "Seniors and peers help when you get stuck." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function SectionHeader({
  eyebrow,
  title,
  text,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <div className={`max-w-[56rem] min-w-0${centered ? " mx-auto text-center" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-[clamp(2.8rem,7vw,5.8rem)] font-bold tracking-[-0.055em] leading-[0.92] uppercase mt-[1.1rem]">{title}</h2>
      {text && <p className={`text-text-dim text-[0.84rem] leading-[1.85] max-w-[42rem] mt-[1.2rem] overflow-wrap-break-word${centered ? " mx-auto" : ""}`}>{text}</p>}
    </div>
  );
}

function AnimatedBlock({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.22 }} variants={fadeUp} transition={{ duration: 0.55, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

export function CommunityPage() {
  return (
    <main className="site-page site-page--community relative min-h-screen overflow-x-clip overflow-y-visible" id="top">
      <div className="relative z-1">
        <Navbar />

        <section className="relative grid min-h-[42rem] p-[9rem_1.5rem_5rem] place-items-center overflow-hidden border-b border-[rgba(255,59,107,0.12)]" aria-labelledby="community-title">
          <div className="absolute inset-[5rem_1rem_1rem] pointer-events-none border-x border-[rgba(255,59,107,0.16)] bg-[linear-gradient(90deg,rgba(255,59,107,0.12),transparent_8rem,transparent_calc(100%-8rem),rgba(255,59,107,0.12)),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[auto,100%_4rem] opacity-55" aria-hidden="true" />
          <div className="absolute inset-[6.75rem_max(1.5rem,calc((100%-76rem)/2))_2.25rem] pointer-events-none border border-[rgba(255,59,107,0.18)] shadow-[inset_0_0_3rem_rgba(119,231,255,0.05),0_0_4rem_rgba(119,231,255,0.06)] before:absolute before:top-[-1px] before:left-8 before:w-[7rem] before:h-[1px] before:bg-accent-red before:shadow-[0_0_1.25rem_rgba(255,99,124,0.75)] after:absolute after:top-[-1px] after:right-8 after:w-[7rem] after:h-[1px] after:bg-accent-red after:shadow-[0_0_1.25rem_rgba(255,99,124,0.75)]" aria-hidden="true" />
          <AnimatedBlock className="w-[min(calc(100vw-3rem),72rem)] min-w-0 py-4">
            <p className="eyebrow">Community Channel / Dev Cell</p>
            <h1 id="community-title" className="max-w-[58rem] mt-[1.2rem] font-display text-[clamp(4rem,11vw,8.8rem)] font-bold tracking-[-0.055em] leading-[0.84] uppercase text-[#f8fcff] [text-shadow:0_0_2rem_rgba(119,231,255,0.16)]">
              <span className="block">A home for</span>
              <span className="block">student</span>
              <span className="block">builders.</span>
            </h1>
            <p className="max-w-[48rem] mt-6 text-[clamp(0.9rem,1.8vw,1.08rem)] leading-[1.85] text-[rgba(226,243,250,0.78)] overflow-wrap-break-word">
              Join the student developer community where you can learn with others, ask for help, build real projects, and ship work you are proud to show.
            </p>
            <div className="flex flex-wrap gap-[0.85rem] mt-[0.4rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.38)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]" href="#community-join">
                Join Community
              </a>
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.35)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.12),rgba(255,59,107,0.04))] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))]" href="/team">
                Meet Core Crew
              </a>
            </div>
          </AnimatedBlock>
          <div className="absolute right-[max(1.5rem,calc((100%-76rem)/2))] bottom-[2.8rem] grid gap-[0.45rem] text-[rgba(194,240,255,0.56)] text-[0.56rem] tracking-[0.22em] text-right uppercase" aria-hidden="true">
            <span className="block">BEGINNER FRIENDLY</span>
            <span className="block">BUILD NIGHTS ONLINE</span>
            <span className="block">MENTOR SIGNAL ACTIVE</span>
          </div>
        </section>

        <section className="content-section pt-[2.4rem] pb-[1.2rem]">
          <AnimatedBlock>
            <CommandBand items={communitySignals} variant="community" />
          </AnimatedBlock>
        </section>

        <section className="content-section pt-[5.5rem] pb-[4rem]" id="community-value">
          <div className="grid gap-[1.4rem] items-start mb-[2.6rem] lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.65fr)]">
            <SectionHeader eyebrow="What You Get" title="Learn, build, get help, and ship." text="Dev Cell is simple on purpose: come in curious, work beside other students, and leave with real progress." />
            <SignalAside label="Crew Note" text="You can start even if you only know the basics. The community exists to make the first step less lonely." />
          </div>
          <div className="grid gap-[1.2rem] mt-[2.8rem] sm:grid-cols-2 lg:grid-cols-4">
            {valueCards.map((card) => (
              <AnimatedBlock key={card.title}>
                <Dev3DCard title={card.title} description={card.text} ctaLabel="Explore" badgeTop={card.badgeTop} badgeMain={card.badgeMain} variant={card.variant} />
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-[4rem] pb-[4rem]" id="start-here">
          <SectionHeader eyebrow="Start Here" title="Your first three moves." text="No long onboarding. Just show up, pick something small, and build with feedback." />
          <div className="grid gap-4 mt-[2.8rem] lg:grid-cols-3">
            {startSteps.map((item) => (
              <AnimatedBlock key={item.step}>
                <GlowCard className="h-full rounded-[1.1rem]">
                  <div className="h-full min-h-[14rem] p-[1.45rem] border border-[rgba(255,59,107,0.14)] bg-[rgba(5,11,16,0.74)] backdrop-blur-[12px] min-w-0 rounded-[1.1rem] transition-[transform,border-color,box-shadow] duration-180 ease-out hover:-translate-y-[0.18rem] hover:border-[rgba(255,59,107,0.3)] hover:shadow-[0_1.5rem_2.8rem_rgba(2,6,23,0.26)]">
                    <span className="text-accent-red text-[0.62rem] tracking-[0.22em] uppercase">{item.step}</span>
                    <h3 className="text-[#f5fbff] font-display text-[2.1rem] tracking-[-0.035em] mt-[3.8rem]">{item.title}</h3>
                    <p className="text-text-dim text-[0.84rem] leading-[1.85] mt-[0.45rem]">{item.text}</p>
                  </div>
                </GlowCard>
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-[4rem] pb-[8rem]" id="community-join" aria-labelledby="community-cta-title">
          <AnimatedBlock className="visual-center-offset mx-auto flex max-w-[60rem] flex-col items-center border border-[rgba(255,59,107,0.16)] bg-[linear-gradient(135deg,rgba(12,36,49,0.7),rgba(5,10,15,0.78))] shadow-[0_1.5rem_4rem_rgba(0,0,0,0.28)] backdrop-blur-[16px] p-[clamp(1.4rem,5vw,3.4rem)] text-center min-w-0">
            <SectionHeader eyebrow="Access Point / Join" title="Ready to build with Dev Cell?" text="Join the community, attend a session, or meet the people running projects and workshops." centered />
            <div className="mt-[0.4rem] flex w-full flex-wrap justify-center gap-[0.85rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.38)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]" href="mailto:hello@devcell.club">
                Join Dev Cell Now
              </a>
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.35)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.12),rgba(255,59,107,0.04))] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))]" href="/team">
                Meet Core Crew
              </a>
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.35)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.12),rgba(255,59,107,0.04))] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))]" href="/events">
                Open Event Board
              </a>
            </div>
          </AnimatedBlock>
        </section>

        <footer className="flex items-center justify-between w-[min(calc(100%-3rem),72rem)] mx-auto py-8 text-text-muted text-[0.58rem] tracking-[0.18em] uppercase">
          <a href="/" className="text-text-primary">Dev Cell Club</a>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://github.com/" rel="noreferrer" target="_blank" className="hover:text-accent-cyan focus-visible:text-accent-cyan">GitHub</a>
            <a href="mailto:hello@devcell.club" className="hover:text-accent-cyan focus-visible:text-accent-cyan">Email</a>
            <a href="#community-join" className="hover:text-accent-cyan focus-visible:text-accent-cyan">Community</a>
          </div>
          <span>Student developer community / Copyright 2026</span>
        </footer>
      </div>
    </main>
  );
}
