export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  tags: string[];
  prize_pool: string;
  registration_url: string;
  starts_at: string;
  ends_at: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  submitted_by: string | null;
  created_at: string;
}

export interface UserBookmark {
  id: string;
  user_id: string;
  hackathon_id: string;
  created_at: string;
}

export const INITIAL_HACKATHONS: Hackathon[] = [
  {
    id: "h1-os-decentralized",
    title: "OS-Decentralized Hackathon",
    organizer: "Protocol Labs & Gitcoin",
    description: "Build open-source decentralized applications and tools for the future of the decentralized web. Focus areas include IPFS, libp2p, and smart contract developer tooling.",
    tags: ["Rust", "Web3", "Solidity", "Go"],
    prize_pool: "$100,000 USD",
    registration_url: "https://gitcoin.co/hackathon/os-decentralized",
    starts_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    ends_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),   // 20 days from now
    status: "upcoming",
    submitted_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: "h2-nextjs-vite",
    title: "NextJS & Vite Super-Build",
    organizer: "Vercel & Vite Core Team",
    description: "Build high-performance web applications using Remix, Next.js, or Vite. Submissions will be evaluated based on web vitals, bundle size optimization, and dynamic design aesthetics.",
    tags: ["React", "Next.js", "Vite", "TypeScript", "TailwindCSS"],
    prize_pool: "$50,000 USD",
    registration_url: "https://devpost.com/hackathons/nextjs-vite-superbuild",
    starts_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),  // started 2 days ago
    ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),    // ends in 5 days
    status: "ongoing",
    submitted_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: "h3-ai-open-devfest",
    title: "AI Open DevFest",
    organizer: "Hugging Face & OpenAI",
    description: "Create open-source AI applications, agentic tools, or model integrations. Leverage open weights and standard APIs to solve real-world problems in coding, automation, and science.",
    tags: ["AI", "Python", "FastAPI", "Machine Learning"],
    prize_pool: "$75,000 USD",
    registration_url: "https://devpost.com/hackathons/ai-open-devfest",
    starts_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),  // started 1 day ago
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),    // ends in 3 days
    status: "ongoing",
    submitted_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: "h4-cloud-native-hub",
    title: "K8s & Docker Cloud-Native Hub",
    organizer: "CNCF (Cloud Native Computing Foundation)",
    description: "Build innovative plugins, operators, or dashboards for Kubernetes and Docker. The goal is to make local development, cluster management, or logging simpler and more visual.",
    tags: ["Go", "Docker", "Kubernetes", "PostgreSQL"],
    prize_pool: "$60,000 USD",
    registration_url: "https://devfolio.co/hackathons/k8s-docker-cloudnative",
    starts_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    ends_at: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),   // 25 days from now
    status: "upcoming",
    submitted_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: "h5-supabase-postgres",
    title: "Postgres & Supabase Realtime-athon",
    organizer: "Supabase Inc.",
    description: "Create collaborative, real-time web applications using Supabase Database, RLS, and Auth. Leverage PGExtensions and vector search features to build intelligent products.",
    tags: ["TypeScript", "PostgreSQL", "Supabase", "React"],
    prize_pool: "$40,000 USD",
    registration_url: "https://devfolio.co/hackathons/supabase-postgres-realtime",
    starts_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // started 15 days ago
    ends_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),    // ended 5 days ago
    status: "completed",
    submitted_by: null,
    created_at: new Date().toISOString()
  },
  {
    id: "h6-svelte-solid-challenge",
    title: "SolidJS & Svelte Interface Challenge",
    organizer: "Vite Conf & Netlify",
    description: "A hackathon dedicated to creating lightning-fast, reactive client applications using Svelte, SvelteKit, SolidJS, or SolidStart. Visual aesthetics and high frame rates are core criteria.",
    tags: ["Svelte", "SolidJS", "GraphQL", "TailwindCSS", "Vite"],
    prize_pool: "$30,000 USD",
    registration_url: "https://devpost.com/hackathons/solidjs-svelte-challenge",
    starts_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // started 40 days ago
    ends_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),   // ended 30 days ago
    status: "completed",
    submitted_by: null,
    created_at: new Date().toISOString()
  }
];

export const FILTER_TAGS = [
  "React",
  "Next.js",
  "Vite",
  "Svelte",
  "SolidJS",
  "TypeScript",
  "Rust",
  "Go",
  "Python",
  "AI",
  "Machine Learning",
  "Web3",
  "Solidity",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "Supabase",
  "GraphQL",
  "FastAPI",
  "TailwindCSS"
];
