type TeamMember = {
  name: string;
  role: string;
  domain: string;
  description: string;
  status?: string;
  avatar?: string;
  github?: string;
  linkedin?: string;
  email?: string;
  tag?: string;
};

type TeamMemberCardProps = {
  member: TeamMember;
};

const linkLabels = {
  github: "GitHub",
  linkedin: "LinkedIn",
  email: "Email",
} as const;

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const links = [
    member.github ? { href: member.github, label: linkLabels.github } : null,
    member.linkedin ? { href: member.linkedin, label: linkLabels.linkedin } : null,
    member.email ? { href: member.email, label: linkLabels.email } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  const initials = member.avatar
    ? null
    : member.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");

  return (
    <article className="team-member-card">
      <div className="team-member-card__header">
        <div className="team-member-card__avatar" aria-hidden="true">
          {member.avatar ? (
            <img alt="" src={member.avatar} />
          ) : (
            <span>{initials || "DC"}</span>
          )}
        </div>
        <div className="team-member-card__identity">
          {member.tag ? (
            <span className="team-member-card__tag">{member.tag}</span>
          ) : null}
          <h3>{member.name}</h3>
          <p className="team-member-card__role">{member.role}</p>
        </div>
      </div>

      <div className="team-member-card__meta">
        <div className="team-member-card__domain">{member.domain}</div>
        {member.status ? (
          <div className="team-member-card__status">{member.status}</div>
        ) : null}
      </div>
      <p className="team-member-card__description">{member.description}</p>
      {links.length ? (
        <div
          className="team-member-card__links"
          aria-label={`${member.name} contact links`}
        >
          {links.map((link) => (
            <a href={link.href} key={`${member.name}-${link.label}`}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export type { TeamMember };
