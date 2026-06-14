import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "../components/cinematic-hero/Navbar";
import { Magnet } from "../components/ui/Magnet";
import { SignalAside } from "../components/ui/SignalAside";
import { TiltedCard } from "../components/ui/TiltedCard";
import { useReducedMotion } from "../hooks/useReducedMotion";

type EventItem = { title: string; type: string; date: string; time: string; location: string; description: string; tag: string; href?: string };

const featuredEvent: EventItem = { title: "Open Lab: Build With Us", type: "Open Lab", date: "Friday", time: "6:00 PM", location: "Dev Cell Room / Online", description: "Bring a project, a bug, or just curiosity. Work with other students, ask seniors for help, and make progress on something real.", tag: "Beginner Friendly", href: "#upcoming-schedule" };

const upcomingEvents: EventItem[] = [
  { title: "Open Lab: Build With Us", type: "Open Lab", date: "Friday / Week 1", time: "6:00 PM", location: "Dev Cell Room / Online", description: "Bring a project, ask doubts, and make progress with other student builders.", tag: "Open to All", href: "#join-events" },
  { title: "Git & GitHub Starter Workshop", type: "Workshop", date: "Saturday / Week 1", time: "11:00 AM", location: "Lab Block", description: "A beginner-first session on version control, pull requests, and collaboration basics.", tag: "Beginner Friendly", href: "#join-events" },
  { title: "React UI Build Night", type: "Build Night", date: "Tuesday / Week 2", time: "7:00 PM", location: "Dev Cell Room", description: "Work on layouts, states, and interfaces alongside the frontend crew.", tag: "Hands-on", href: "#join-events" },
  { title: "Hackathon Team Formation Meet", type: "Hackathon", date: "Thursday / Week 2", time: "5:30 PM", location: "Seminar Hall", description: "Find teammates, shape ideas, and get early feedback before building sprints begin.", tag: "Team Event", href: "#join-events" },
];

const firstVisitNotes = ["Bring your laptop", "Ask doubts freely", "Start with one small build"];

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

export function EventsPage() {
  return (
    <main className="site-page site-page--events relative min-h-screen overflow-x-clip overflow-y-visible" id="top">
      <div className="relative z-[1]">
        <Navbar />

        <section className="relative grid min-h-[34rem] p-[8.5rem_1.5rem_4.5rem] place-items-center overflow-hidden border-b border-[rgba(56,189,248,0.12)]" aria-labelledby="events-page-title">
          <div className="absolute inset-[5rem_1rem_1rem] pointer-events-none border-x border-[rgba(34,211,238,0.14)] bg-[linear-gradient(90deg,rgba(34,211,238,0.09),transparent_7rem,transparent_calc(100%-7rem),rgba(34,211,238,0.09)),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[auto,100%_4rem]" aria-hidden="true" />
          <div className="absolute inset-[6.5rem_max(1.5rem,calc((100%-74rem)/2))_2rem] pointer-events-none border border-[rgba(56,189,248,0.18)] shadow-[inset_0_0_2rem_rgba(34,211,238,0.04),0_0_3rem_rgba(34,211,238,0.04)] before:absolute before:top-[-1px] before:left-8 before:w-[6rem] before:h-[1px] before:bg-[#ff3b6b] before:shadow-[0_0_1rem_rgba(255,59,107,0.55)] after:absolute after:top-[-1px] after:right-8 after:w-[6rem] after:h-[1px] after:bg-[#ff3b6b] after:shadow-[0_0_1rem_rgba(255,59,107,0.55)]" aria-hidden="true" />
          <AnimatedBlock className="w-[min(calc(100vw-3rem),72rem)] min-w-0">
            <p className="eyebrow">Dev Cell Events</p>
            <h1 id="events-page-title" className="max-w-[56rem] mt-[1.1rem] font-display text-[clamp(3.8rem,8vw,6.6rem)] font-bold tracking-[-0.055em] leading-[0.88] uppercase text-[#f8fafc] [text-shadow:0_0_1.6rem_rgba(34,211,238,0.12)]">Show up, build, and leave with progress.</h1>
            <p className="max-w-[42rem] mt-6 text-[clamp(0.9rem,1.8vw,1.04rem)] leading-[1.82] text-[#d6ecf8]">Workshops, open labs, build nights, and team sessions for students who want to learn by making things.</p>
            <div className="flex flex-wrap gap-[0.85rem] mt-[0.4rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(34,211,238,0.45)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(8,30,46,0.72)] shadow-[inset_0_0_1.4rem_rgba(34,211,238,0.12)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#020617] hover:bg-[#22d3ee] focus-visible:text-[#020617] focus-visible:bg-[#22d3ee]" href="#upcoming-schedule">See Upcoming Events</a>
            </div>
          </AnimatedBlock>
        </section>

        <section className="content-section pt-[5.5rem] pb-[4rem]">
          <SectionHeader eyebrow="Next Event" title="Start here." />
          <AnimatedBlock>
            <TiltedCard className="rounded-[1.2rem]">
              <div className="grid gap-[1.4rem] items-start mt-[2.8rem] border border-[rgba(34,211,238,0.2)] bg-[linear-gradient(145deg,rgba(10,25,45,0.74),rgba(8,18,32,0.86))] shadow-[inset_0_0_0_1px_rgba(56,189,248,0.05),0_0_2rem_rgba(34,211,238,0.07)] p-[clamp(1.4rem,4vw,3rem)] rounded-[1.2rem] lg:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.65fr)]">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-[0.75rem] text-[#8fe8ff] text-[0.58rem] tracking-[0.16em] uppercase">
                    <span>{featuredEvent.type}</span><span>{featuredEvent.date}</span><span>{featuredEvent.time}</span><span>{featuredEvent.location}</span>
                  </div>
                  <h2 className="max-w-[42rem] mt-[1.1rem] font-display text-[clamp(3rem,6vw,5rem)] font-bold tracking-[-0.055em] leading-[0.92] uppercase">{featuredEvent.title}</h2>
                  <p className="max-w-[42rem] mt-4 text-[#d6ecf8] text-[0.88rem] leading-[1.82]">{featuredEvent.description}</p>
                  <Magnet>
                    <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(34,211,238,0.45)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(8,30,46,0.72)] shadow-[inset_0_0_1.4rem_rgba(34,211,238,0.12)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#020617] hover:bg-[#22d3ee] focus-visible:text-[#020617] focus-visible:bg-[#22d3ee]" href="#join-events">Join This Session</a>
                  </Magnet>
                </div>
                <SignalAside label={featuredEvent.tag} text="A rough project, one bug you want solved, or simple curiosity is enough to show up." />
              </div>
            </TiltedCard>
          </AnimatedBlock>
        </section>

        <section className="content-section pt-[4rem] pb-[4rem]" id="upcoming-schedule">
          <SectionHeader eyebrow="Upcoming" title="Pick a session." text="A short list of events students can actually join this month." />
          <div className="grid gap-[1.2rem] mt-[2.8rem] md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <AnimatedBlock key={event.title}>
                <TiltedCard className="rounded-[1rem] h-full">
                  <div className="flex flex-col min-h-[15rem] p-[1.2rem] border border-[rgba(34,211,238,0.16)] bg-[linear-gradient(155deg,rgba(10,25,45,0.72),rgba(8,18,32,0.82))] transition-[transform,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(34,211,238,0.32)] hover:shadow-[0_0_1.8rem_rgba(34,211,238,0.08)] min-w-0 rounded-[1rem]">
                    <div className="flex justify-between gap-[0.8rem] items-center">
                      <span className="text-[#22d3ee] text-[0.56rem] tracking-[0.18em] uppercase">{event.type}</span>
                      <span className="text-[#fee2e2] text-[0.56rem] tracking-[0.18em] uppercase">{event.tag}</span>
                    </div>
                    <h3 className="mt-[0.95rem] text-[#f8fafc] font-display text-[1.9rem] tracking-[-0.03em]">{event.title}</h3>
                    <div className="flex flex-col gap-[0.45rem] mt-[0.95rem] text-[#8fe8ff] text-[0.58rem] tracking-[0.16em] uppercase">
                      <span>{event.date}</span><span>{event.time}</span><span>{event.location}</span>
                    </div>
                    <p className="mt-3 text-text-dim text-[0.74rem] leading-[1.72] flex-1">{event.description}</p>
                    <a className="w-fit mt-auto pt-[1.25rem] text-[#e0f2fe] text-[0.68rem] tracking-[0.16em] uppercase hover:text-[#22d3ee] focus-visible:text-[#22d3ee] transition-colors duration-180 ease-out" href={event.href ?? "#join-events"}>Reserve Seat</a>
                  </div>
                </TiltedCard>
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-[4rem] pb-[8rem]" id="join-events">
          <AnimatedBlock className="visual-center-offset mx-auto flex max-w-[60rem] flex-col items-center border border-[rgba(34,211,238,0.16)] bg-[linear-gradient(155deg,rgba(10,25,45,0.72),rgba(8,18,32,0.82))] p-[clamp(1.4rem,4vw,3rem)] text-center min-w-0">
            <SectionHeader eyebrow="New Here" title="Come to the next session." text="No expert badge needed. Meet other builders, ask doubts, and take one small step into the Dev Cell community." centered />
            <div className="mt-[2rem] flex w-full flex-wrap justify-center gap-[0.7rem]">
              {firstVisitNotes.map((note) => (
                <span className="inline-flex border border-[rgba(34,211,238,0.18)] bg-[rgba(8,30,46,0.62)] px-[0.78rem] py-[0.52rem] text-[#e0f2fe] text-[0.62rem] tracking-[0.14em] uppercase" key={note}>{note}</span>
              ))}
            </div>
            <div className="mt-[0.4rem] flex w-full flex-wrap justify-center gap-[0.85rem]">
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(34,211,238,0.45)] text-[#c5f8ff] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(8,30,46,0.72)] shadow-[inset_0_0_1.4rem_rgba(34,211,238,0.12)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#020617] hover:bg-[#22d3ee] focus-visible:text-[#020617] focus-visible:bg-[#22d3ee]" href="mailto:hello@devcell.club">Join Next Session</a>
              <a className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.3)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(69,17,27,0.38)] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.07)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(255,59,107,0.72)] hover:text-white hover:bg-[rgba(127,29,29,0.52)] focus-visible:border-[rgba(255,59,107,0.72)] focus-visible:text-white focus-visible:bg-[rgba(127,29,29,0.52)]" href="/community">Enter Community Channel</a>
            </div>
          </AnimatedBlock>
        </section>

        <footer className="flex justify-between p-6 border-t border-[rgba(56,189,248,0.12)] text-[rgba(224,242,254,0.52)] text-[0.58rem] tracking-[0.18em] uppercase">
          <a href="/">Dev Cell Club</a>
          <span>Practical sessions, real builders, and something worth showing up for.</span>
        </footer>
      </div>
    </main>
  );
}
