export type ShippedProject = {
  title: string;
  description: string;
  link: string;
  stack?: string;
  builders?: string;
};

// To add a project: copy one of the objects below, fill in the fields, and
// save. The homepage teaser renders these as cards automatically; clear the
// array to fall back to the "Projects are on the way" placeholder copy.
export const shippedProjects: ShippedProject[] = [
  {
    title: "Example Project — replace me",
    description:
      "One or two sentences on what it does, who it's for, and why it exists.",
    link: "https://github.com/",
    stack: "React / Node",
    builders: "Jane D., Arjun K.",
  },
  {
    title: "Another Build — replace me",
    description:
      "Swap this card for a real shipped project once one is ready to show.",
    link: "https://github.com/",
    stack: "Python / FastAPI",
  },
];
