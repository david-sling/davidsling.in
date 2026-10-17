import {
  siClaude,
  siExpo,
  siFigma,
  siNextdotjs,
  siPostgresql,
  siReact,
  siRedis,
  siSupabase,
  siTailwindcss,
  siTanstack,
  siTypescript,
  siVercel,
} from "simple-icons";

export const site = {
  name: "David Sling",
  email: "me@davidsling.in",
  role: "Frontend Lead at NEXTech",
  location: "Bengaluru, India",
  socials: [
    { label: "GitHub", href: "https://github.com/david-sling" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/david-sling" },
    { label: "Instagram", href: "https://www.instagram.com/davidsling.in" },
  ],
} as const;

export type ProjectSlug = "wave" | "equanim" | "offlyn" | "ai-protect";

export type Project = {
  slug: ProjectSlug;
  name: string;
  year: string;
  summary: string;
  /** Set for work built for an employer; shown as a badge on the card. */
  builtAt?: string;
  /** One verifiable fact shown on the card. */
  fact: string;
  tags: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "wave",
    name: "Wave",
    year: "2026",
    summary:
      "Group chat for AI coding agents, while you supervise. Zero install: paste a join prompt into Claude Code, Codex or Cursor and they start talking.",
    fact: "Open source, MIT",
    tags: ["Next.js", "Redis", "TypeScript", "CLI"],
    links: [
      { label: "Live", href: "https://wave.davidsling.in" },
      { label: "Source", href: "https://github.com/david-sling/wave" },
    ],
  },
  {
    slug: "equanim",
    name: "Equanim",
    year: "2026",
    summary:
      "A JSON animation spec where every visual property is a maths expression, designed for AI to write and anything to render.",
    fact: "Spec + renderer in 4 days",
    tags: ["TypeScript", "mathjs", "Canvas"],
    links: [
      { label: "Renderer", href: "https://equanim-renderer.vercel.app" },
      { label: "Source", href: "https://github.com/david-sling/equanim" },
    ],
  },
  {
    slug: "offlyn",
    name: "offlyn.love",
    year: "2026",
    summary:
      "Dating through friends of friends, like normal people. Your pool is the people your friends actually know. Web app plus an Expo app for iOS and Android.",
    fact: "Web + iOS + Android",
    tags: ["React Native", "Expo", "Supabase", "TanStack Start"],
    links: [{ label: "Live", href: "https://offlyn.love" }],
  },
  // Built at NEXTech: everything on its card and case study comes from the public product site.
  {
    slug: "ai-protect",
    name: "AI Protect",
    builtAt: "NEXTech",
    year: "2026",
    summary:
      "Shows a firm which AI tools its team uses, and catches client data at the paste, before it reaches any of them.",
    fact: "macOS and Windows, one console",
    tags: ["Endpoint agent", "Browser extension", "Console"],
    links: [
      {
        label: "Product site",
        href: "https://www.astralinkconnect.dev/products/ai-protect",
      },
    ],
  },
];

export type Role = {
  title: string;
  company: string;
  period: string;
  note: string;
  /** Shipped products, described only from their public sites. */
  products?: {
    name: string;
    url: string;
    role: string;
    summary: string;
    /** A case study on this site, written from public material only. */
    caseStudy?: ProjectSlug;
    /** The product's own mark. */
    logo?: string;
  }[];
};

/** Each employer's LinkedIn page, linked from its name in Experience. */
export const companyLinks: Record<string, string> = {
  LegalForce: "https://www.linkedin.com/company/legalforce-rapc-worldwide",
  Nonceblox: "https://www.linkedin.com/company/nonceblox",
};

export const roles: Role[] = [
  {
    title: "Frontend Lead",
    company: "NEXTech",
    period: "2025–now",
    note: "Leading the frontend team, and moving it to a spec-and-agents workflow.",
    products: [
      {
        name: "AI Protect",
        url: "https://www.astralinkconnect.dev/products/ai-protect",
        role: "Led it end to end with a team of four",
        summary:
          "Shows a business which AI tools its team uses, and catches client data at the paste.",
        caseStudy: "ai-protect",
        logo: "/media/ai-protect/mark.svg",
      },
      {
        name: "HOAshare",
        url: "https://www.hoashare.com/",
        logo: "/media/hoashare/mark.webp",
        role: "Led the frontend",
        summary:
          "Property management for HOAs, with a vendor marketplace that pays homeowners back.",
      },
    ],
  },
  {
    title: "Frontend Developer II",
    company: "LegalForce",
    period: "2023–2025",
    note: "Component system, a multilingual CMS across 20+ subdomains, a Notion-powered blog.",
  },
  {
    title: "Frontend Developer I",
    company: "LegalForce",
    period: "2022–2023",
    note: "Trademark search across 12M+ records: filtering, SSR, the works.",
  },
  {
    title: "Frontend Intern",
    company: "LegalForce",
    period: "2021–2022",
    note: "Joined as an intern, stayed three and a half years.",
  },
  {
    title: "Full Stack Intern",
    company: "Nonceblox",
    period: "2021–2022",
    note: "Next.js, Node and web3 for blockchain products.",
  },
];

export const stack = [
  { name: "Claude", icon: siClaude, size: "lg" },
  { name: "TanStack", icon: siTanstack },
  { name: "React", icon: siReact },
  { name: "TypeScript", icon: siTypescript },
  { name: "Supabase", icon: siSupabase },
  { name: "Postgres", icon: siPostgresql },
  { name: "Redis", icon: siRedis },
  { name: "Figma", icon: siFigma, size: "lg" },
  { name: "Expo", icon: siExpo },
  { name: "Next.js", icon: siNextdotjs },
  { name: "Tailwind", icon: siTailwindcss },
  { name: "Vercel", icon: siVercel },
] as const satisfies readonly {
  name: string;
  icon: { path: string; hex: string };
  size?: "lg";
}[];

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
