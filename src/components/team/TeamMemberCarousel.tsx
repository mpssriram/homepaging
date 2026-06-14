import { useEffect, useState } from "react";
import type { TeamMember } from "./TeamMemberCard";
import { TeamMemberCard } from "./TeamMemberCard";
import "./team-member-carousel.css";

type TeamMemberCarouselProps = {
  members: TeamMember[];
  ariaLabel: string;
};

export function TeamMemberCarousel({
  members,
  ariaLabel,
}: TeamMemberCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = members.length;

  const goPrevious = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % total);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches || total <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [total]);

  if (!members.length) {
    return null;
  }

  return (
    <section
      aria-label={ariaLabel}
      className="team-member-carousel"
    >
      <div className="team-member-carousel__frame">
        <div className="team-member-carousel__meta">
          <span className="team-member-carousel__count">
            {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <span className="team-member-carousel__status">
            Active Crew Signal
          </span>
        </div>
        {total > 1 ? (
          <div
            className="team-member-carousel__progress"
            key={activeIndex}
            aria-hidden="true"
          >
            <span className="team-member-carousel__progress-bar" />
          </div>
        ) : null}

        <div className="team-member-carousel__viewport">
          <div
            className="team-member-carousel__track"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {members.map((member) => (
              <div className="team-member-carousel__slide" key={`${member.name}-${member.role}`}>
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        </div>

        {total > 1 ? (
          <>
            <button
              aria-label="Previous team member"
              className="team-member-carousel__control team-member-carousel__control--prev"
              onClick={goPrevious}
              type="button"
            >
              <span aria-hidden="true">
                <svg
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m15 19-7-7 7-7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </button>
            <button
              aria-label="Next team member"
              className="team-member-carousel__control team-member-carousel__control--next"
              onClick={goNext}
              type="button"
            >
              <span aria-hidden="true">
                <svg
                  fill="none"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m9 5 7 7-7 7"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="team-member-carousel__nav" role="tablist" aria-label="Team member slides">
          {members.map((member, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                aria-selected={isActive}
                className={`team-member-carousel__nav-item${isActive ? " is-active" : ""}`}
                key={`${member.name}-${member.domain}`}
                onClick={() => setActiveIndex(index)}
                role="tab"
                type="button"
              >
                <span className="team-member-carousel__nav-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="team-member-carousel__nav-copy">
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
