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
    "id": "h1-os-decentralized",
    "title": "OS-Decentralized Hackathon",
    "organizer": "Protocol Labs & Gitcoin",
    "description": "Build open-source decentralized applications and tools for the future of the decentralized web. Focus areas include IPFS, libp2p, and smart contract developer tooling.",
    "tags": [
      "Rust",
      "Web3",
      "Solidity",
      "Go"
    ],
    "prize_pool": "$100,000 USD",
    "registration_url": "https://gitcoin.co/hackathon/os-decentralized",
    "starts_at": "2026-06-29T19:23:46.743Z",
    "ends_at": "2026-07-09T19:23:46.743Z",
    "status": "upcoming",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.743Z"
  },
  {
    "id": "h2-nextjs-vite",
    "title": "NextJS & Vite Super-Build",
    "organizer": "Vercel & Vite Core Team",
    "description": "Build high-performance web applications using Remix, Next.js, or Vite. Submissions will be evaluated based on web vitals, bundle size optimization, and dynamic design aesthetics.",
    "tags": [
      "React",
      "Next.js",
      "Vite",
      "TypeScript",
      "TailwindCSS"
    ],
    "prize_pool": "$50,000 USD",
    "registration_url": "https://devpost.com/hackathons/nextjs-vite-superbuild",
    "starts_at": "2026-06-17T19:23:46.744Z",
    "ends_at": "2026-06-24T19:23:46.744Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h3-ai-open-devfest",
    "title": "AI Open DevFest",
    "organizer": "Hugging Face & OpenAI",
    "description": "Create open-source AI applications, agentic tools, or model integrations. Leverage open weights and standard APIs to solve real-world problems in coding, automation, and science.",
    "tags": [
      "AI",
      "Python",
      "FastAPI",
      "Machine Learning"
    ],
    "prize_pool": "$75,000 USD",
    "registration_url": "https://devpost.com/hackathons/ai-open-devfest",
    "starts_at": "2026-06-18T19:23:46.744Z",
    "ends_at": "2026-06-22T19:23:46.744Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-10",
    "title": "Solana Hyperdrive",
    "organizer": "Solana Foundation",
    "description": "A global open-source hackathon focused on building high-performance decentralized applications, infrastructure, and tools on Solana.",
    "tags": [
      "Rust",
      "Web3",
      "Solidity"
    ],
    "prize_pool": "$1,000,000 USD",
    "registration_url": "https://devpost.com/hackathons/solana-hyperdrive",
    "starts_at": "2026-06-24T19:23:40.538Z",
    "ends_at": "2026-07-04T19:23:40.538Z",
    "status": "upcoming",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-11",
    "title": "Vercel AI Hackathon",
    "organizer": "Vercel & Next.js",
    "description": "Build the next generation of AI-native applications utilizing Vercel AI SDK, Next.js, and open source LLMs.",
    "tags": [
      "AI",
      "Next.js",
      "React",
      "TypeScript"
    ],
    "prize_pool": "$80,000 USD",
    "registration_url": "https://devpost.com/hackathons/vercel-ai-hack",
    "starts_at": "2026-06-18T19:23:40.538Z",
    "ends_at": "2026-06-23T19:23:40.538Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-12",
    "title": "EthIndia 2026",
    "organizer": "Devfolio Community",
    "description": "Asia's biggest Ethereum hackathon bringing together hackers, developers, and designers to build open-source Web3 protocols.",
    "tags": [
      "Solidity",
      "Web3",
      "Rust",
      "Go"
    ],
    "prize_pool": "$150,000 USD",
    "registration_url": "https://devfolio.co/hackathons/ethindia2026",
    "starts_at": "2026-07-19T19:23:40.544Z",
    "ends_at": "2026-07-22T19:23:40.544Z",
    "status": "upcoming",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-13",
    "title": "Polygon Builders Hack",
    "organizer": "Polygon Labs",
    "description": "Deploy scalable dApps on Polygon using zero-knowledge technology and public open source contracts.",
    "tags": [
      "Solidity",
      "Web3",
      "TypeScript"
    ],
    "prize_pool": "$45,000 USD",
    "registration_url": "https://devfolio.co/hackathons/polygon-builders-hack",
    "starts_at": "2026-06-16T19:23:40.544Z",
    "ends_at": "2026-06-21T19:23:40.544Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-14",
    "title": "Gitcoin Grants 24 Hack",
    "organizer": "Gitcoin DAO",
    "description": "Help build Gitcoin's open source identity tools, sybil resistance, and coordination mechanics using indexers and clean UI layouts.",
    "tags": [
      "Go",
      "React",
      "GraphQL",
      "PostgreSQL"
    ],
    "prize_pool": "$35,000 USD",
    "registration_url": "https://gitcoin.co/hackathon/gg24-hack",
    "starts_at": "2026-06-09T19:23:40.544Z",
    "ends_at": "2026-06-18T19:23:40.544Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
  },
  {
    "id": "h-scraped-15",
    "title": "MLH Hack Autumn 2026",
    "organizer": "Major League Hacking",
    "description": "An open-source software and tooling build sprint. Create libraries, developer assets, and utilities for the student community.",
    "tags": [
      "Python",
      "Vite",
      "TypeScript",
      "FastAPI"
    ],
    "prize_pool": "$10,000 USD",
    "registration_url": "https://mlh.io/hackathons/autumn-2026",
    "starts_at": "2026-07-01T19:23:40.544Z",
    "ends_at": "2026-07-03T19:23:40.544Z",
    "status": "upcoming",
    "submitted_by": null,
    "created_at": "2026-06-19T19:23:46.744Z"
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
