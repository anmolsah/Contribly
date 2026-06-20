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

// --- THEME-TO-TAG MAPPING ---
// Maps Devpost theme names to our tech/topic tags
const THEME_TO_TAGS: Record<string, string[]> = {
  "Machine Learning/AI": ["AI", "Machine Learning"],
  "Web": ["React", "TypeScript"],
  "DevOps": ["Docker", "Kubernetes"],
  "Databases": ["PostgreSQL", "Supabase"],
  "Blockchain": ["Web3", "Solidity"],
  "Gaming": ["TypeScript"],
  "Enterprise": ["TypeScript"],
  "Fintech": ["TypeScript", "Python"],
  "Education": ["Python", "React"],
  "Social Good": ["Python", "React"],
  "Design": ["React", "TailwindCSS"],
  "Health": ["Python", "FastAPI"],
  "Low/No Code": ["AI"],
  "Productivity": ["TypeScript", "React"],
  "Robotic Process Automation": ["Python", "AI"],
  "Beginner Friendly": [],
  "Open Ended": [],
  "Communication": ["TypeScript"],
  "AR/VR": ["TypeScript"],
  "Music/Art": ["React"],
  "E-commerce/Retail": ["React", "Next.js"],
  "Lifehacks": ["Python"],
  "Mobile": ["React", "TypeScript"],
};

function mapThemesToTags(themes: { id: number; name: string }[]): string[] {
  const tagSet = new Set<string>();
  for (const theme of themes) {
    const mapped = THEME_TO_TAGS[theme.name];
    if (mapped) {
      mapped.forEach(t => tagSet.add(t));
    }
  }
  // Always ensure at least some tags
  if (tagSet.size === 0) {
    tagSet.add("TypeScript");
    tagSet.add("React");
  }
  return Array.from(tagSet);
}

function parsePrizeAmount(prizeHtml: string): string {
  // Input: "$<span data-currency-value>2,000,000</span>" or "$<span data-currency-value>80,000</span>"
  const match = prizeHtml.match(/>([\d,]+)</);
  if (match) {
    return `$${match[1]} USD`;
  }
  return prizeHtml.replace(/<[^>]*>/g, '').trim() + ' USD';
}

function parseDateRange(dateStr: string): { starts_at: string; ends_at: string } {
  // Input formats: "May 19 - Aug 17, 2026", "Jun 14 - 21, 2026", "Jun 10 - 24, 2026"
  try {
    const parts = dateStr.split(' - ');
    if (parts.length === 2) {
      const startPart = parts[0].trim(); // e.g. "May 19" or "Jun 14"
      const endPart = parts[1].trim();   // e.g. "Aug 17, 2026" or "21, 2026"

      // Check if end part has a month or just a day
      const endHasMonth = /^[A-Za-z]/.test(endPart);
      
      let endDateStr: string;
      let startDateStr: string;

      if (endHasMonth) {
        // "May 19 - Aug 17, 2026"
        const yearMatch = endPart.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
        startDateStr = `${startPart}, ${year}`;
        endDateStr = endPart;
      } else {
        // "Jun 14 - 21, 2026"
        const yearMatch = endPart.match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
        const startMonth = startPart.split(' ')[0];
        const endDay = endPart.replace(/,?\s*\d{4}/, '').trim();
        startDateStr = `${startPart}, ${year}`;
        endDateStr = `${startMonth} ${endDay}, ${year}`;
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return {
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString()
        };
      }
    }
  } catch (e) {
    // fallback
  }

  // Fallback: use current date offsets
  const now = new Date();
  return {
    starts_at: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
  };
}

function determineStatus(starts_at: string, ends_at: string): 'upcoming' | 'ongoing' | 'completed' {
  const now = new Date();
  const start = new Date(starts_at);
  const end = new Date(ends_at);
  
  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'ongoing';
  return 'upcoming';
}

// --- REAL DEVPOST API SCRAPER ---
async function scrapeDevpost(): Promise<HackathonInput[]> {
  console.log("🔍 Fetching REAL hackathons from Devpost API...");
  const results: HackathonInput[] = [];

  try {
    // Fetch open/upcoming hackathons
    const openUrl = 'https://devpost.com/api/hackathons?status[]=upcoming&status[]=open&per_page=15';
    const openRes = await fetch(openUrl);
    if (!openRes.ok) throw new Error(`Devpost API returned ${openRes.status}`);
    const openData = await openRes.json();

    // Fetch recently ended hackathons
    const endedUrl = 'https://devpost.com/api/hackathons?status[]=ended&per_page=5';
    const endedRes = await fetch(endedUrl);
    const endedData = endedRes.ok ? await endedRes.json() : { hackathons: [] };

    const allHackathons = [
      ...(openData.hackathons || []),
      ...(endedData.hackathons || [])
    ];

    console.log(`  📦 Received ${allHackathons.length} hackathons from Devpost`);

    for (const h of allHackathons) {
      const { starts_at, ends_at } = parseDateRange(h.submission_period_dates || '');
      const status = determineStatus(starts_at, ends_at);
      const tags = mapThemesToTags(h.themes || []);
      const prizePool = parsePrizeAmount(h.prize_amount || '$0');

      results.push({
        title: h.title?.trim() || 'Untitled Hackathon',
        organizer: h.organization_name || 'Devpost',
        description: `${h.title} - ${h.displayed_location?.location || 'Online'} hackathon. ${h.submission_period_dates || ''}. ${h.registrations_count ? `${h.registrations_count.toLocaleString()} participants registered.` : ''}`,
        tags,
        prize_pool: prizePool,
        registration_url: h.url || `https://devpost.com/`,
        starts_at,
        ends_at,
        status
      });
    }

    console.log(`  ✅ Parsed ${results.length} real hackathons from Devpost`);
  } catch (err: any) {
    console.error(`  ❌ Devpost scrape failed: ${err.message}`);
  }

  return results;
}

function saveToMockFile(allHackathons: HackathonInput[]) {
  console.log("💾 Writing records directly to app/lib/mockData.ts...");
  const mockFilePath = path.resolve(process.cwd(), 'app', 'lib', 'mockData.ts');

  try {
    const newMergedList: any[] = [];
    const seenUrls = new Set<string>();

    let index = 1;
    for (const h of allHackathons) {
      if (!seenUrls.has(h.registration_url)) {
        newMergedList.push({
          id: `h-real-${index++}`,
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
    console.log(`✅ Successfully updated mockData.ts with ${newMergedList.length} REAL hackathons.`);
  } catch (err: any) {
    console.error("❌ Failed to update mockData.ts:", err.message);
  }
}

async function main() {
  // Scrape REAL data from Devpost API
  const allHackathons = await scrapeDevpost();

  if (allHackathons.length === 0) {
    console.log("⚠️ No hackathons were scraped. Check network connectivity.");
    return;
  }

  console.log(`🤖 Scraped a total of ${allHackathons.length} REAL hackathons from Devpost.`);

  let dbSuccess = false;

  if (isSupabaseConfigured) {
    console.log("💾 Attempting to upsert records to Supabase database...");
    try {
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      // First, clear old scraped data
      const { error: clearError } = await supabase
        .from('hackathons')
        .delete()
        .is('submitted_by', null);
      
      if (clearError) {
        console.warn(`  ⚠️ Could not clear old records: ${clearError.message}`);
      } else {
        console.log("  🗑️  Cleared old scraped records from database.");
      }

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

  // Always update mock file too so the local fallback has fresh data
  saveToMockFile(allHackathons);

  console.log("-----------------------------------------");
  console.log("   SCRAPING PROCESS COMPLETE             ");
  console.log(`   ${dbSuccess ? '✅ Database updated' : '📁 Mock file updated'}`);
  console.log("-----------------------------------------");
}

main().catch(err => {
  console.error("❌ Scraper crashed:", err);
});
