# Contribly: Open Source Hackathons Hub

**Contribly** is a standalone, developer-first search and tracking directory for open-source hackathons. It is hosted on a subdomain (e.g., `hackathons.firstissue.dev`), operates as a separate Git repository, and utilizes a dedicated, isolated Supabase project for authentication and database storage.

---

## 1. Feature Specifications & Access Controls

Contribly is a completely open platform designed with developer accessibility in mind:
* **Guest Access (No Login Required)**: Users who are searching, filtering, and browsing the hackathons directory to find events can do so fully without creating an account or logging in.
* **Submitting a Hackathon**: Users who wish to submit/add a new hackathon must create an account and authenticate.
* **Bookmarking Events**: Saving/tracking hackathons directly to a personalized dashboard is an authenticated feature.

### Core Layout Tabs
* **Upcoming**: Chronological feed of events that have not started yet.
* **Ongoing**: Hackathons currently in progress, showing days/hours remaining.
* **Completed**: Read-only history of concluded hackathons.

---

## 2. Technical Architecture & Tech Stack

* **Frontend**: Remix
* **Styling**: Vanilla CSS or TailwindCSS following Vercel's signature dark theme.
* **State Management**: TanStack Query (React Query) for fetching, caching, and optimistic UI.
* **Database & Auth**: Dedicated, separate Supabase project (completely isolated from the main application).

### Isolated Authentication Model
Authentication on Contribly is **completely separate** from the main `FirstIssue.dev` application. There is no shared cookie session state. This ensures that:
1. Visitors can browse Contribly immediately without authentication.
2. Organizers or submitters can register local credentials (e.g., using Supabase Email/Password or a separate GitHub OAuth client registration).
3. The client initializes standard authentication persistence without wildcard domains:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'contribly.auth.token',
  },
});
```

---

## 3. Database Schema & Row-Level Security (RLS)

Contribly uses a dedicated, separate Supabase project database instance. Deploy the following two tables in the public schema of the new Supabase project:

### 1. `hackathons` Table
Stores curated and user-submitted hackathon listings:
```sql
create table public.hackathons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  organizer text not null,
  description text not null,
  tags text[] default '{}',
  prize_pool text not null,
  registration_url text not null unique,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  status text check (status in ('upcoming', 'ongoing', 'completed')) not null,
  submitted_by uuid references auth.users(id) on delete set null, -- Null for system scraped events
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for quick filtering and sorting
create index idx_hackathons_status on public.hackathons(status);
create index idx_hackathons_starts_at on public.hackathons(starts_at);
```

### 2. `user_hackathons` Table (Bookmarks / Tracking)
Links logged-in user accounts to bookmarked hackathons:
```sql
create table public.user_hackathons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  hackathon_id uuid references public.hackathons(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, hackathon_id)
);
```

### RLS Policies
```sql
-- Enable RLS
alter table public.hackathons enable row level security;
alter table public.user_hackathons enable row level security;

-- 1. Hackathons table permissions
create policy "Allow public read access to hackathons"
  on public.hackathons for select
  using (true);

create policy "Allow authenticated users to submit hackathons"
  on public.hackathons for insert
  with check (auth.uid() is not null);

create policy "Allow submitters to update their own hackathons"
  on public.hackathons for update
  using (auth.uid() = submitted_by);

create policy "Allow submitters to delete their own hackathons"
  on public.hackathons for delete
  using (auth.uid() = submitted_by);

-- 2. User Hackathons (Bookmarks) permissions
create policy "Allow users to read their own bookmarks"
  on public.user_hackathons for select
  using (auth.uid() = user_id);

create policy "Allow users to insert their own bookmarks"
  on public.user_hackathons for insert
  with check (auth.uid() = user_id);

create policy "Allow users to delete their own bookmarks"
  on public.user_hackathons for delete
  using (auth.uid() = user_id);
```

---

## 4. Suggested Hackathon Data Sources & Curation

To keep the platform updated, implement a simple Deno/Node worker running as a cron task (e.g. via GitHub Actions or Supabase Edge Functions) to pull and upsert from the following feeds every 12 hours:

1. **Devpost** (`devpost.com`):
   * Feed parser / scraping target: `devpost.com/hackathons?themes[]=Open+Source`
   * Target fields: Event Title, Organizer name, Logo image URL, Dates, Submission/Registration links.
2. **Devfolio** (`devfolio.co`):
   * Feed target: Curation API endpoints filtering by tag "Open Source".
3. **Gitcoin Hackathons** (`gitcoin.co`):
   * Fetch active hackathons using the Gitcoin Indexer GraphQL API.
4. **Major League Hacking** (`mlh.io`):
   * Search MLH active seasons for virtual/open-source specific category entries.
5. **Static/Curation Fallback**:
   * Build a lightweight administration panel (or direct Supabase UI inserts) to add major community events manually (e.g. Hacktoberfest, Google Summer of Code, LFX Mentorships).

---

## 5. UI/UX Specifications (Vercel-inspired Theme)

Implement a clean, developer-focused, high-contrast user interface that matches the visual language of `FirstIssue.dev`.

### Design Tokens & Layout Rules
* **Background Canvas**: Solid `#0B0C10` (deep blue-black). No floating colored gradients.
* **Borders & Dividers**: Thin, desaturated zinc lines (`border-zinc-800/60`).
* **Visual Grid Effects**: Include a mouse-tracking radial spotlight "torchlight" gradient grid animation:
  * Creates a subtle overlay grid.
  * Tracks cursor coordinate values `(x, y)` to illuminate grid cells ONLY within a `300px` radius.
* **Typography**: Clean sans-serif sans weights (e.g., `Inter` or `Outfit`) for interface text; `JetBrains Mono` or `Fira Code` for tags, prizes, dates, and numbers.
* **Bento Grid Cards**: Event panels styled as:
  ```css
  background: rgba(9, 9, 11, 0.25); /* zinc-950 at 25% opacity */
  border: 1px solid rgba(39, 39, 42, 0.6); /* zinc-800 at 60% opacity */
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ```
  * Hover state: `border-color: rgba(63, 63, 70, 1); /* zinc-700 */ background: rgba(255, 255, 255, 0.01);`

### Interaction Components
1. **Search & Tag Filter Row**: Clean outline search box and click-selectable stack filter buttons (e.g. `React`, `Rust`, `Go`, `TypeScript`).
2. **Bento Card Details**:
   * Small uppercase monospaced organizer label.
   * Large bold title in white.
   * Monospaced prize pool label (e.g., `$50,000 USD`) with a `Trophy` icon.
   * Clock icon indicating time remaining (e.g., `Starts in 3 days` or `Closes in 22 hours`).
   * Primary action: High-contrast white button (`bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded px-4 py-2`).
   * Secondary action: Heart/Bookmark icon toggle.
