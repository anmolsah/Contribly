import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// --- Simple Local .env Loader ---
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Use Service Role Key for server-side scraping if available, fallback to anon key
const supabaseKey = serviceRoleKey || anonKey;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_url');

console.log("-----------------------------------------");
console.log("   CONTRIBLY HACKATHON FEED SCRAPER      ");
console.log("-----------------------------------------");
console.log(`Supabase Configured: ${isSupabaseConfigured ? 'YES' : 'NO'}`);
if (isSupabaseConfigured) {
  console.log(`Using Key Mode: ${serviceRoleKey ? 'Service Role Key (Admin Bypass RLS)' : 'Anon Key (Subject to RLS)'}`);
  if (!serviceRoleKey) {
    console.log("⚠️ WARNING: Running scraper with Anon Key. If your database RLS prevents anonymous writes,");
    console.log("             the scraper will fail with RLS violations.");
    console.log("             To fix this, add SUPABASE_SERVICE_ROLE_KEY=your_key in your .env file.");
  }
}
console.log("-----------------------------------------");

interface HackathonInput {
  title: string;
  organizer: string;
  description: string;
  tags: string[];
  prize_pool: string;
  registration_url: string;
  starts_at: string;
  ends_at: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const TECH_TAGS = [
  "React", "Next.js", "Vite", "Svelte", "SolidJS", "TypeScript", "Rust", 
  "Go", "Python", "AI", "Machine Learning", "Web3", "Solidity", 
  "Docker", "Kubernetes", "PostgreSQL", "Supabase", "GraphQL", "FastAPI", "TailwindCSS"
];

// Simulated feeds
function getSimulatedDevpost(): HackathonInput[] {
  const now = new Date();
  return [
    {
      title: "Solana Hyperdrive",
      organizer: "Solana Foundation",
      description: "A global open-source hackathon focused on building high-performance decentralized applications, infrastructure, and tools on Solana.",
      tags: ["Rust", "Web3", "Solidity"],
      prize_pool: "$1,000,000 USD",
      registration_url: "https://devpost.com/hackathons/solana-hyperdrive",
      starts_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming"
    },
    {
      title: "Vercel AI Hackathon",
      organizer: "Vercel & Next.js",
      description: "Build the next generation of AI-native applications utilizing Vercel AI SDK, Next.js, and open source LLMs.",
      tags: ["AI", "Next.js", "React", "TypeScript"],
      prize_pool: "$80,000 USD",
      registration_url: "https://devpost.com/hackathons/vercel-ai-hack",
      starts_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ongoing"
    }
  ];
}

function getSimulatedDevfolio(): HackathonInput[] {
  const now = new Date();
  return [
    {
      title: "EthIndia 2026",
      organizer: "Devfolio Community",
      description: "Asia's biggest Ethereum hackathon bringing together hackers, developers, and designers to build open-source Web3 protocols.",
      tags: ["Solidity", "Web3", "Rust", "Go"],
      prize_pool: "$150,000 USD",
      registration_url: "https://devfolio.co/hackathons/ethindia2026",
      starts_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 33 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming"
    },
    {
      title: "Polygon Builders Hack",
      organizer: "Polygon Labs",
      description: "Deploy scalable dApps on Polygon using zero-knowledge technology and public open source contracts.",
      tags: ["Solidity", "Web3", "TypeScript"],
      prize_pool: "$45,000 USD",
      registration_url: "https://devfolio.co/hackathons/polygon-builders-hack",
      starts_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ongoing"
    }
  ];
}

function getSimulatedGitcoin(): HackathonInput[] {
  const now = new Date();
  return [
    {
      title: "Gitcoin Grants 24 Hack",
      organizer: "Gitcoin DAO",
      description: "Help build Gitcoin's open source identity tools, sybil resistance, and coordination mechanics using indexers and clean UI layouts.",
      tags: ["Go", "React", "GraphQL", "PostgreSQL"],
      prize_pool: "$35,000 USD",
      registration_url: "https://gitcoin.co/hackathon/gg24-hack",
      starts_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed"
    }
  ];
}

function getSimulatedMLH(): HackathonInput[] {
  const now = new Date();
  return [
    {
      title: "MLH Hack Autumn 2026",
      organizer: "Major League Hacking",
      description: "An open-source software and tooling build sprint. Create libraries, developer assets, and utilities for the student community.",
      tags: ["Python", "Vite", "TypeScript", "FastAPI"],
      prize_pool: "$10,000 USD",
      registration_url: "https://mlh.io/hackathons/autumn-2026",
      starts_at: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming"
    }
  ];
}

function saveToMockFile(allHackathons: HackathonInput[]) {
  console.log("💾 Writing records directly to app/lib/mockData.ts...");
  const mockFilePath = path.resolve(process.cwd(), 'app', 'lib', 'mockData.ts');

  try {
    const newMergedList: any[] = [];
    const seenUrls = new Set<string>();

    const defaultMocks = [
      {
        id: "h1-os-decentralized",
        title: "OS-Decentralized Hackathon",
        organizer: "Protocol Labs & Gitcoin",
        description: "Build open-source decentralized applications and tools for the future of the decentralized web. Focus areas include IPFS, libp2p, and smart contract developer tooling.",
        tags: ["Rust", "Web3", "Solidity", "Go"],
        prize_pool: "$100,000 USD",
        registration_url: "https://gitcoin.co/hackathon/os-decentralized",
        starts_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming" as const,
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
        starts_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ongoing" as const,
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
        starts_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "ongoing" as const,
        submitted_by: null,
        created_at: new Date().toISOString()
      }
    ];

    for (const item of defaultMocks) {
      newMergedList.push(item);
      seenUrls.add(item.registration_url);
    }

    let index = 10;
    for (const h of allHackathons) {
      if (!seenUrls.has(h.registration_url)) {
        newMergedList.push({
          id: `h-scraped-${index++}`,
          title: h.title,
          organizer: h.organizer,
          description: h.description,
          tags: h.tags,
          prize_pool: h.prize_pool,
          registration_url: h.registration_url,
          starts_at: h.starts_at,
          ends_at: h.ends_at,
          status: h.status,
          submitted_by: null,
          created_at: new Date().toISOString()
        });
        seenUrls.add(h.registration_url);
      }
    }

    const newFileContent = `export interface Hackathon {
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

export const INITIAL_HACKATHONS: Hackathon[] = ${JSON.stringify(newMergedList, null, 2)};

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
`;
    fs.writeFileSync(mockFilePath, newFileContent, 'utf8');
    console.log(`✅ Successfully updated mockData.ts with ${newMergedList.length} total hackathons.`);
  } catch (err: any) {
    console.error("❌ Failed to update mockData.ts:", err.message);
  }
}

async function main() {
  const allHackathons = [
    ...getSimulatedDevpost(),
    ...getSimulatedDevfolio(),
    ...getSimulatedGitcoin(),
    ...getSimulatedMLH()
  ];

  console.log(`🤖 Scraped a total of ${allHackathons.length} hackathons from feeds.`);

  let dbSuccess = false;

  if (isSupabaseConfigured) {
    console.log("💾 Attempting to upsert records to Supabase database...");
    try {
      const supabase = createClient(supabaseUrl!, supabaseKey!);
      let inserted = 0;
      let errors = 0;

      for (const h of allHackathons) {
        const { error } = await supabase
          .from('hackathons')
          .upsert({
            title: h.title,
            organizer: h.organizer,
            description: h.description,
            tags: h.tags,
            prize_pool: h.prize_pool,
            registration_url: h.registration_url,
            starts_at: h.starts_at,
            ends_at: h.ends_at,
            status: h.status
          }, {
            onConflict: 'registration_url'
          });

        if (error) {
          errors++;
          // If table doesn't exist, we break early to trigger the fallback
          if (error.message.includes("Could not find the table") || error.code === "PGRST116") {
            console.warn("⚠️ Supabase tables seem to be missing. Breaking database load.");
            break;
          }
          console.error(`❌ Error upserting "${h.title}":`, error.message);
        } else {
          inserted++;
        }
      }

      if (inserted > 0 && errors === 0) {
        console.log(`✅ Upserted ${inserted} hackathons to database successfully.`);
        dbSuccess = true;
      }
    } catch (err: any) {
      console.warn(`⚠️ Supabase db operation threw exception: ${err.message}`);
    }
  }

  // Fallback to mock file writing if DB wasn't updated
  if (!dbSuccess) {
    console.log("ℹ️ Database upsert did not succeed or was skipped. Falling back to local file storage...");
    saveToMockFile(allHackathons);
  }

  console.log("-----------------------------------------");
  console.log("   SCRAPING PROCESS COMPLETE             ");
  console.log("-----------------------------------------");
}

main().catch(err => {
  console.error("❌ Scraper crashed:", err);
});
