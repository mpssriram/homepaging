import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "../components/cinematic-hero/Navbar";
import { Magnet } from "../components/ui/Magnet";
import { SignalAside } from "../components/ui/SignalAside";
import { TiltedCard } from "../components/ui/TiltedCard";
import { useReducedMotion } from "../hooks/useReducedMotion";

type BuildItem = { title: string; stage: string; stack: string; status: string; description: string; href: string };

const featuredBuild: BuildItem = {
  title: "Dev Cell Club Platform",
  stage: "Active Build",
  stack: "React / UI System",
  status: "Core Project",
  description: "The shared home for Dev Cell: community info, events, projects, and the small systems that help students keep building.",
  href: "mailto:hello@devcell.club?subject=Dev%20Cell%20Club%20Platform",
};

const activeBuilds: BuildItem[] = [
  { title: "Event Board", stage: "Prototype", stack: "Frontend / Data Views", status: "Needs UI Help", description: "A cleaner way to show upcoming sessions, registration links, and event updates.", href: "/events#upcoming-schedule" },
  { title: "Community Onboarding", stage: "Weekly Ops", stack: "Guides / Feedback", status: "Needs Builders", description: "A simple flow for welcoming new members, sharing first tasks, and collecting review notes.", href: "/community#community-join" },
  { title: "Starter Kits", stage: "Ongoing", stack: "Docs / Templates", status: "Good First Task", description: "Small repos, setup notes, and templates that help new contributors start faster.", href: "/community#community-join" },
];

const starterSteps = ["Pick one build", "Take one small task", "Ship it with feedback"];

const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };

function AnimatedBlock({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;
  return <motion.div className={className} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp} transition={{ duration: 0.5, ease: "easeOut" }}>{children}</motion.div>;
}

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
      {text && <p className={`text-text-dim text-[0.84rem] leading-[1.85] max-w-[42rem] mt-[1.15rem]${centered ? " mx-auto" : ""}`}>{text}</p>}
    </div>
  );
}

export function ProjectsPage() {
  return (
    <main className="site-page site-page--projects relative min-h-screen overflow-x-clip overflow-y-visible" id="top">
      <div className="relative z-[1]">
        <Navbar />

        <section className="relative grid min-h-[34rem] p-[8.5rem_1.5rem_4.5rem] place-items-center overflow-hidden border-b border-[rgba(255,59,107,0.12)]" aria-labelledby="projects-page-title">
          <div className="absolute inset-[5rem_1rem_1rem] pointer-events-none border-x border-[rgba(34,211,238,0.14)] bg-[linear-gradient(90deg,rgba(34,211,238,0.09),transparent_7rem,transparent_calc(100%-7rem),rgba(34,211,238,0.09)),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[auto,100%_4rem]" aria-hidden="true" />
          <div className="absolute inset-[6.5rem_max(1.5rem,calc((100%-74rem)/2))_2rem] pointer-events-none border border-[rgba(255,59,107,0.18)] shadow-[inset_0_0_2rem_rgba(34,211,238,0.04),0_0_3rem_rgba(34,211,238,0.04)] before:absolute before:top-[-1px] before:left-8 before:w-[6rem] before:h-[1px] before:bg-[#ff3b6b] before:shadow-[0_0_1rem_rgba(255,59,107,0.55)] after:absolute after:top-[-1px] after:right-8 after:w-[6rem] after:h-[1px] after:bg-[#ff3b6b] after:shadow-[0_0_1rem_rgba(255,59,107,0.55)]" aria-hidden="true" />
          <AnimatedBlock className="w-[min(calc(100vw-3rem),72rem)] min-w-0">
            <p className="eyebrow">Dev Cell Projects</p>
            <h1 id="projects-page-title" className="max-w-[54rem] mt-[1.1rem] font-display text-[clamp(3.8rem,8vw,6.5rem)] font-bold tracking-[-0.055em] leading-[0.88] uppercase text-[#f8fafc] [text-shadow:0_0_1.6rem_rgba(34,211,238,0.12)]">Build real things with the crew.</h1>
            <p className="max-w-[42rem] mt-6 text-[clamp(0.9rem,1.8vw,1.04rem)] leading-[1.82] text-[#d6ecf8]">Join practical student projects, take a small task, get feedback, and ship work that the club can actually use.</p>
            <div className="flex flex-wrap gap-[0.85rem] mt-[0.4rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.38)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]" href="#active-builds">See Open Builds</a>
            </div>
          </AnimatedBlock>
        </section>

        <section className="content-section pt-[5.5rem] pb-[4rem]">
          <SectionHeader eyebrow="Current Focus" title="Start with the club platform." />
          <AnimatedBlock className="grid gap-[1.4rem] items-start mt-[2.8rem] border border-[rgba(255,59,107,0.16)] bg-[linear-gradient(155deg,rgba(33,7,18,0.76),rgba(18,4,12,0.84))] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.04),0_1.2rem_2.6rem_rgba(2,6,23,0.22)] backdrop-blur-[16px] p-[clamp(1.4rem,4vw,3rem)] min-w-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.65fr)]">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-[0.7rem] text-[0.58rem] tracking-[0.16em] uppercase text-accent-cyan">
                <span>{featuredBuild.stage}</span><span>{featuredBuild.stack}</span><span>{featuredBuild.status}</span>
              </div>
              <h2 className="max-w-[42rem] mt-[1.1rem] font-display text-[clamp(3rem,6vw,5rem)] font-bold tracking-[-0.055em] leading-[0.92] uppercase">{featuredBuild.title}</h2>
              <p className="max-w-[42rem] mt-4 text-[#d6ecf8] text-[0.88rem] leading-[1.82]">{featuredBuild.description}</p>
              <div className="flex flex-wrap gap-[0.85rem] mt-[0.4rem]">
                <Magnet>
                  <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.38)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]" href={featuredBuild.href}>Join This Build</a>
                </Magnet>
              </div>
            </div>
            <SignalAside label="Good First Work" text="Landing sections, event cards, copy cleanup, design polish, docs, and small UI fixes all count." />
          </AnimatedBlock>
        </section>

        <section className="content-section pt-[4rem] pb-[4rem]" id="active-builds">
          <SectionHeader eyebrow="Open Builds" title="Choose a lane." text="These are small enough to join, useful enough to matter, and flexible enough for different skill levels." />
          <div className="grid gap-[1.2rem] mt-[2.8rem] lg:grid-cols-3">
            {activeBuilds.map((build) => (
              <AnimatedBlock key={build.title}>
                <TiltedCard className="rounded-[1.1rem] h-full">
                  <div className="flex flex-col min-h-[17rem] p-[1.2rem] border border-[rgba(255,59,107,0.14)] bg-[linear-gradient(155deg,rgba(33,7,18,0.76),rgba(18,4,12,0.84))] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.04),0_1.2rem_2.6rem_rgba(2,6,23,0.22)] backdrop-blur-[16px] transition-[transform,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(255,59,107,0.38)] hover:shadow-[inset_0_0_0_1px_rgba(224,242,254,0.05),0_1.5rem_2.8rem_rgba(2,6,23,0.28),0_0_1.8rem_rgba(255,59,107,0.1)] min-w-0 rounded-[1.1rem]">
                    <div className="flex flex-wrap gap-[0.7rem] items-center justify-between">
                      <span className="text-[0.56rem] tracking-[0.18em] uppercase text-accent-cyan">{build.stage}</span>
                      <span className="inline-flex px-[0.62rem] py-[0.42rem] border border-[rgba(255,59,107,0.35)] text-[#fee2e2] bg-[rgba(69,17,27,0.42)] text-[0.58rem] tracking-[0.16em] uppercase">{build.status}</span>
                    </div>
                    <h3 className="mt-[0.95rem] text-[#f8fafc] font-display text-[1.9rem] tracking-[-0.03em]">{build.title}</h3>
                    <div className="flex flex-wrap gap-[0.7rem] mt-[0.95rem]">
                      <span className="inline-flex px-[0.62rem] py-[0.42rem] border border-[rgba(255,59,107,0.16)] text-[#e0f2fe] bg-[rgba(10,25,45,0.58)] text-[0.58rem] tracking-[0.16em] uppercase">{build.stack}</span>
                    </div>
                    <p className="mt-3 text-text-dim text-[0.82rem] leading-[1.78] flex-1">{build.description}</p>
                    <a className="w-fit mt-auto pt-[1.25rem] text-[#e0f2fe] text-[0.68rem] tracking-[0.16em] uppercase hover:text-accent-cyan focus-visible:text-accent-cyan transition-colors duration-180 ease-out" href={build.href}>View Build Brief</a>
                  </div>
                </TiltedCard>
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-[4rem] pb-[8rem]">
          <AnimatedBlock className="visual-center-offset mx-auto flex max-w-[60rem] flex-col items-center border border-[rgba(255,59,107,0.16)] bg-[linear-gradient(155deg,rgba(10,25,45,0.72),rgba(8,18,32,0.82))] p-[clamp(1.4rem,4vw,3rem)] text-center min-w-0">
            <SectionHeader eyebrow="Start Small" title="Your first contribution can be tiny." text="You do not need to own a whole product. Start with one fix, one screen, one doc, or one useful improvement." centered />
            <div className="mt-[2rem] flex w-full flex-wrap justify-center gap-[0.7rem]">
              {starterSteps.map((step) => (
                <span className="inline-flex border border-[rgba(255,59,107,0.18)] bg-[rgba(69,17,27,0.36)] px-[0.78rem] py-[0.52rem] text-[#fee2e2] text-[0.62rem] tracking-[0.14em] uppercase" key={step}>{step}</span>
              ))}
            </div>
            <div className="mt-[0.4rem] flex w-full flex-wrap justify-center gap-[0.85rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.38)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.18),rgba(255,99,124,0.06))] shadow-[inset_0_0_1.4rem_rgba(255,59,107,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#fff5f7] hover:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)] focus-visible:text-[#fff5f7] focus-visible:bg-[linear-gradient(135deg,#ff3b6b,#ff637c)]" href="mailto:hello@devcell.club">Join a Build Lane</a>
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.35)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(180deg,rgba(255,59,107,0.12),rgba(255,59,107,0.04))] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))] focus-visible:bg-[linear-gradient(180deg,rgba(255,59,107,0.16),rgba(255,59,107,0.08))]" href="/events">See Events</a>
            </div>
          </AnimatedBlock>
        </section>

        <footer className="flex justify-between p-6 border-t border-[rgba(255,59,107,0.12)] text-[rgba(224,242,254,0.52)] text-[0.58rem] tracking-[0.18em] uppercase">
          <a href="/">Dev Cell Club</a>
          <span>Student builds, shared systems, and work that keeps getting better.</span>
        </footer>
      </div>
    </main>
  );
}
