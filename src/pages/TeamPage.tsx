import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "../components/cinematic-hero/Navbar";
import { TeamMemberCarousel } from "../components/team/TeamMemberCarousel";
import { GlowCard } from "../components/ui/GlowCard";
import { TiltedCard } from "../components/ui/TiltedCard";
import type { TeamMember } from "../components/team/TeamMemberCard";
import { useReducedMotion } from "../hooks/useReducedMotion";

type ContributorGroup = {
  label: string;
  entries: string[];
};

type OpenRole = {
  title: string;
  text: string;
};

const coreTeamMembers: TeamMember[] = [
  {
    name: "Club Coordinator",
    role: "Community & Direction",
    domain: "Leadership",
    description:
      "Keeps the club rhythm clear, welcomes new members, and makes sure projects, events, and sessions stay connected.",
    status: "First contact",
    email: "mailto:hello@devcell.club?subject=Club%20Coordinator",
    tag: "Core",
  },
  {
    name: "Technical Lead",
    role: "Code Reviews & Architecture",
    domain: "Engineering",
    description:
      "Helps teams choose practical tech, review pull requests, debug stuck builds, and ship cleaner student projects.",
    status: "Review active",
    email: "mailto:hello@devcell.club?subject=Technical%20Lead",
    tag: "Lead",
  },
  {
    name: "Design & Content Lead",
    role: "Product Feel & Story",
    domain: "Design",
    description:
      "Shapes UI direction, posters, event pages, project storytelling, and the small details that make work feel polished.",
    status: "Critique open",
    email: "mailto:hello@devcell.club?subject=Design%20and%20Content%20Lead",
    tag: "Lead",
  },
  {
    name: "Events Lead",
    role: "Sessions & Hackathons",
    domain: "Events",
    description:
      "Plans workshops, build nights, speaker sessions, and hackathon logistics so students get regular chances to build.",
    status: "Planning desk",
    email: "mailto:hello@devcell.club?subject=Events%20Lead",
    tag: "Crew",
  },
  {
    name: "Project Mentor",
    role: "Student Builds",
    domain: "Projects",
    description:
      "Turns rough ideas into scoped tasks, helps beginners find starter issues, and keeps project teams moving.",
    status: "Build support",
    email: "mailto:hello@devcell.club?subject=Project%20Mentor",
    tag: "Mentor",
  },
];

const contributorGroups: ContributorGroup[] = [
  {
    label: "Project Contributors",
    entries: ["Frontend tasks", "Backend tasks", "Testing", "Deployments"],
  },
  {
    label: "Design Contributors",
    entries: ["UI polish", "Posters", "UX reviews", "Brand assets"],
  },
  {
    label: "Event Volunteers",
    entries: ["Hosting", "Speaker support", "Logistics", "Check-ins"],
  },
  {
    label: "Content Contributors",
    entries: ["Docs", "Session notes", "Social posts", "Showcase writeups"],
  },
];

const joinPath = [
  "Attend a session",
  "Pick a small task",
  "Join a project group",
  "Help run something",
  "Grow into crew",
];

const openRoles: OpenRole[] = [
  {
    title: "Frontend Contributors",
    text: "Help build pages, polish interfaces, and turn ideas into usable screens.",
  },
  {
    title: "Backend Contributors",
    text: "Work on APIs, databases, auth flows, and deployment support for student projects.",
  },
  {
    title: "Design & Content",
    text: "Create visuals, improve copy, design screens, and make projects easier to understand.",
  },
  {
    title: "Event Volunteers",
    text: "Support workshops, hackathons, build nights, speaker sessions, and showcases.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

function AnimatedBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
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
      <h2 className="font-display text-[clamp(2.7rem,7vw,5.8rem)] font-bold tracking-[-0.055em] leading-[0.92] uppercase mt-[1.1rem]">
        {title}
      </h2>
      {text ? (
        <p
          className={`text-text-dim text-[0.84rem] leading-[1.85] max-w-[42rem] mt-[1.15rem] overflow-wrap-break-word${
            centered ? " mx-auto" : ""
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

export function TeamPage() {
  return (
    <main className="site-page site-page--team relative min-h-screen overflow-x-clip overflow-y-visible" id="top">
      <div className="relative z-[1]">
        <Navbar />

        <section
          className="relative grid min-h-[38rem] p-[8.5rem_1.5rem_4.5rem] place-items-center overflow-hidden border-b border-[rgba(119,231,255,0.16)]"
          aria-labelledby="team-page-title"
        >
          <div
            className="absolute inset-[5rem_1rem_1rem] pointer-events-none border-x border-[rgba(119,231,255,0.15)] bg-[linear-gradient(90deg,rgba(34,211,238,0.1),transparent_7rem,transparent_calc(100%-7rem),rgba(255,59,107,0.08)),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[auto,100%_4rem]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-[6.5rem_max(1.5rem,calc((100%-74rem)/2))_2rem] pointer-events-none border border-[rgba(139,234,255,0.18)] shadow-[inset_0_0_2rem_rgba(34,211,238,0.08),0_0_3rem_rgba(2,6,23,0.2)] before:absolute before:top-[-1px] before:left-8 before:w-[6rem] before:h-[1px] before:bg-[#8beaff] before:shadow-[0_0_1rem_rgba(139,234,255,0.58)] after:absolute after:top-[-1px] after:right-8 after:w-[6rem] after:h-[1px] after:bg-[#8beaff] after:shadow-[0_0_1rem_rgba(139,234,255,0.58)]"
            aria-hidden="true"
          />
          <AnimatedBlock className="w-[min(calc(100vw-3rem),72rem)] min-w-0">
            <p className="eyebrow">Dev Cell Team</p>
            <h1
              id="team-page-title"
              className="max-w-[58rem] mt-[1.1rem] font-display text-[clamp(3.8rem,9vw,7.2rem)] font-bold tracking-[-0.055em] leading-[0.86] uppercase text-[#f8fafc] [text-shadow:0_0_1.6rem_rgba(34,211,238,0.18)]"
            >
              Meet the students building Dev Cell.
            </h1>
            <p className="max-w-[48rem] mt-6 text-[clamp(0.9rem,1.8vw,1.05rem)] leading-[1.82] text-[rgba(226,243,250,0.82)]">
              We run sessions, ship projects, organize events, review ideas, and help new members find their first real build.
            </p>
            <div className="flex flex-wrap gap-[0.85rem] mt-[0.4rem]">
              <a
                className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(139,234,255,0.46)] text-[#d9fbff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(135deg,rgba(8,52,70,0.86),rgba(8,25,38,0.88))] shadow-[inset_0_0_1.4rem_rgba(139,234,255,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#f8fafc] hover:border-[rgba(139,234,255,0.7)] focus-visible:text-[#f8fafc] focus-visible:border-[rgba(139,234,255,0.7)]"
                href="#join-team"
              >
                Join the Team
              </a>
              <a
                className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.28)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(69,17,27,0.32)] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(248,113,113,0.5)] hover:text-[#fff7f7] focus-visible:border-[rgba(248,113,113,0.5)] focus-visible:text-[#fff7f7]"
                href="/community#community-join"
              >
                Enter Community
              </a>
            </div>
          </AnimatedBlock>
        </section>

        <section className="content-section pt-20 pb-20" id="core-team">
          <SectionHeader
            eyebrow="Core Team"
            title="The crew"
            text="Students who keep Dev Cell moving through projects, events, sessions, reviews, and community support."
          />
          <AnimatedBlock>
            <TeamMemberCarousel ariaLabel="Core team member carousel" members={coreTeamMembers} />
          </AnimatedBlock>
        </section>

        <section className="content-section pt-20 pb-20" id="contributors">
          <SectionHeader
            eyebrow="Contributors"
            title="The wider crew"
            text="Students who help with code, design, docs, events, content, and project support."
          />
          <div className="grid grid-cols-1 gap-[1.2rem] mt-[2.8rem] md:grid-cols-2">
            {contributorGroups.map((group) => (
              <AnimatedBlock key={group.label}>
                <GlowCard className="rounded-[1rem]">
                  <article className="border border-[rgba(139,234,255,0.18)] bg-[linear-gradient(155deg,rgba(8,30,46,0.78),rgba(6,15,25,0.92))] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.04),0_1.2rem_2.6rem_rgba(2,6,23,0.24)] p-[1.2rem] min-w-0 transition-[transform,border-color,box-shadow] duration-180 ease-out hover:-translate-y-[0.16rem] hover:border-[rgba(139,234,255,0.36)] rounded-[1rem]">
                    <h3 className="text-[#f8fafc] font-display text-[1.6rem] tracking-[-0.03em]">
                      {group.label}
                    </h3>
                    <div className="flex flex-wrap gap-[0.6rem] mt-4">
                      {group.entries.map((entry) => (
                        <span
                          className="team-contributor-chip px-[0.68rem] py-[0.5rem] border border-[rgba(139,234,255,0.18)] text-[#e6fbff] bg-[rgba(8,30,46,0.64)] text-[0.64rem] tracking-[0.08em] uppercase"
                          key={entry}
                        >
                          {entry}
                        </span>
                      ))}
                    </div>
                  </article>
                </GlowCard>
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-20 pb-20" id="open-roles">
          <SectionHeader
            eyebrow="Open Roles"
            title="Ways to help right now"
            text="Students do not need a title to start helping. These are practical lanes where a new contributor can pick up small tasks and become visible."
          />
          <div className="grid grid-cols-1 gap-[1px] mt-[2.8rem] border border-[rgba(139,234,255,0.14)] bg-[rgba(139,234,255,0.14)] md:grid-cols-2 lg:grid-cols-4">
            {openRoles.map((role, index) => (
              <AnimatedBlock key={role.title}>
                <TiltedCard className="h-full rounded-[0.9rem]">
                  <article className="min-h-[14rem] p-[1.1rem] bg-[rgba(6,15,25,0.88)] rounded-[0.9rem] transition-[transform,background] duration-180 ease-out hover:bg-[rgba(8,30,46,0.9)]">
                    <span className="text-[#8beaff] text-[0.58rem] tracking-[0.18em] uppercase">
                      Open {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[#f8fafc] font-display text-[1.65rem] tracking-[-0.03em] mt-8">
                      {role.title}
                    </h3>
                    <p className="mt-3 text-[#d9f7ff] text-[0.78rem] leading-[1.7]">
                      {role.text}
                    </p>
                  </article>
                </TiltedCard>
              </AnimatedBlock>
            ))}
          </div>
        </section>

        <section className="content-section pt-20 pb-20" id="join-team">
          <AnimatedBlock className="visual-center-offset mx-auto flex max-w-[60rem] flex-col items-center border border-[rgba(139,234,255,0.2)] bg-[linear-gradient(155deg,rgba(8,30,46,0.82),rgba(6,15,25,0.92))] shadow-[inset_0_0_0_1px_rgba(224,242,254,0.04),0_1.2rem_2.6rem_rgba(2,6,23,0.24)] p-[clamp(1.4rem,4vw,3rem)] text-center min-w-0">
            <SectionHeader
              eyebrow="Join Path"
              title="From member to crew"
              text="The team grows through students who show up, take small responsibilities seriously, help others, and keep building after the first burst of excitement."
              centered
            />
            <div className="grid grid-cols-1 gap-[1px] mt-[2.8rem] border border-[rgba(139,234,255,0.14)] bg-[rgba(139,234,255,0.12)] sm:grid-cols-2 lg:grid-cols-5">
              {joinPath.map((step, index) => (
                <TiltedCard className="rounded-[0.9rem]" key={step}>
                  <div className="min-h-[9rem] p-4 bg-[rgba(6,15,25,0.88)] rounded-[0.9rem] transition-[transform,background] duration-180 ease-out hover:bg-[rgba(8,30,46,0.9)]">
                    <span className="text-[#8beaff] text-[0.58rem] tracking-[0.18em] uppercase">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-8 text-[#e6fbff] text-[0.78rem] leading-[1.65]">
                      {step}
                    </p>
                  </div>
                </TiltedCard>
              ))}
            </div>
            <div className="mt-[0.4rem] flex w-full flex-wrap justify-center gap-[0.85rem]">
              <a
                className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(139,234,255,0.46)] text-[#d9fbff] text-[0.68rem] tracking-[0.16em] uppercase bg-[linear-gradient(135deg,rgba(8,52,70,0.86),rgba(8,25,38,0.88))] shadow-[inset_0_0_1.4rem_rgba(139,234,255,0.08)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:text-[#f8fafc] hover:border-[rgba(139,234,255,0.7)] focus-visible:text-[#f8fafc] focus-visible:border-[rgba(139,234,255,0.7)]"
                href="mailto:hello@devcell.club?subject=I%20want%20to%20join%20the%20Dev%20Cell%20team"
              >
                Ask to Join
              </a>
              <a
                className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.28)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(69,17,27,0.32)] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(248,113,113,0.5)] hover:text-[#fff7f7] focus-visible:border-[rgba(248,113,113,0.5)] focus-visible:text-[#fff7f7]"
                href="/projects#active-builds"
              >
                Find Project Tasks
              </a>
              <a
                className="inline-flex items-center justify-center mt-8 px-[1.3rem] py-4 border border-[rgba(255,59,107,0.28)] text-[#fee2e2] text-[0.68rem] tracking-[0.16em] uppercase bg-[rgba(69,17,27,0.32)] shadow-[inset_0_0_1.2rem_rgba(255,59,107,0.06)] transition-[color,background,border-color,box-shadow] duration-180 ease-out hover:border-[rgba(248,113,113,0.5)] hover:text-[#fff7f7] focus-visible:border-[rgba(248,113,113,0.5)] focus-visible:text-[#fff7f7]"
                href="/events"
              >
                Help With Events
              </a>
            </div>
          </AnimatedBlock>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 p-6 border-t border-[rgba(139,234,255,0.12)] text-[rgba(226,243,250,0.56)] text-[0.58rem] tracking-[0.18em] uppercase">
          <a href="/">Dev Cell Club</a>
          <span>Built by students who keep showing up.</span>
        </footer>
      </div>
    </main>
  );
}
