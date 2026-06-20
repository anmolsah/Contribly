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
    "id": "h-real-1",
    "title": "Build with Gemini XPRIZE",
    "organizer": "XPRIZE",
    "description": "Build with Gemini XPRIZE - Online hackathon. May 19 - Aug 17, 2026. 14,643 participants registered.",
    "tags": [
      "AI",
      "Machine Learning",
      "Python",
      "React",
      "TypeScript"
    ],
    "prize_pool": "$2,000,000 USD",
    "registration_url": "https://xprize.devpost.com/",
    "starts_at": "2026-05-18T18:30:00.000Z",
    "ends_at": "2026-08-16T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-2",
    "title": "H0: Hack the Zero Stack with Vercel v0 and AWS Databases",
    "organizer": "Amazon",
    "description": "H0: Hack the Zero Stack with Vercel v0 and AWS Databases - Online hackathon. May 27 - Jun 29, 2026. 6,916 participants registered.",
    "tags": [
      "PostgreSQL",
      "Supabase",
      "React",
      "TypeScript"
    ],
    "prize_pool": "$80,000 USD",
    "registration_url": "https://h01.devpost.com/",
    "starts_at": "2026-05-26T18:30:00.000Z",
    "ends_at": "2026-06-28T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-3",
    "title": "USAII® Global AI Hackathon 2026",
    "organizer": "USAII",
    "description": "USAII® Global AI Hackathon 2026 - Online hackathon. Jun 14 - 21, 2026. 6,017 participants registered.",
    "tags": [
      "AI",
      "Machine Learning",
      "Python",
      "React"
    ],
    "prize_pool": "$15,000 USD",
    "registration_url": "https://usaii-global-ai-hackathon-2026.devpost.com/",
    "starts_at": "2026-06-13T18:30:00.000Z",
    "ends_at": "2026-06-20T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-4",
    "title": "Global AI Hackathon Series with Qwen Cloud",
    "organizer": "Alibaba Cloud",
    "description": "Global AI Hackathon Series with Qwen Cloud  - Online hackathon. May 26 - Jul 09, 2026. 4,270 participants registered.",
    "tags": [
      "AI",
      "Machine Learning",
      "React",
      "TailwindCSS",
      "TypeScript"
    ],
    "prize_pool": "$45,000 USD",
    "registration_url": "https://qwencloud-hackathon.devpost.com/",
    "starts_at": "2026-05-25T18:30:00.000Z",
    "ends_at": "2026-07-08T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-5",
    "title": "UiPath AgentHack",
    "organizer": "UiPath",
    "description": "UiPath AgentHack - Online hackathon. May 15 - Jun 29, 2026. 3,220 participants registered.",
    "tags": [
      "TypeScript",
      "AI",
      "Machine Learning",
      "Python"
    ],
    "prize_pool": "$50,000 USD",
    "registration_url": "https://uipath-agenthack.devpost.com/",
    "starts_at": "2026-05-14T18:30:00.000Z",
    "ends_at": "2026-06-28T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-6",
    "title": "Slack Agent Builder Challenge",
    "organizer": "Salesforce",
    "description": "Slack Agent Builder Challenge - Online hackathon. May 20 - Jul 13, 2026. 2,469 participants registered.",
    "tags": [
      "TypeScript",
      "AI"
    ],
    "prize_pool": "$42,000 USD",
    "registration_url": "https://slackhack.devpost.com/",
    "starts_at": "2026-05-19T18:30:00.000Z",
    "ends_at": "2026-07-12T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-7",
    "title": "Mind the Product presents World Product Day: Everyone Ships Now",
    "organizer": "Mind the Product",
    "description": "Mind the Product presents World Product Day: Everyone Ships Now - Online hackathon. May 20 - Jun 20, 2026. 1,304 participants registered.",
    "tags": [
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$10,000 USD",
    "registration_url": "https://mindtheproduct.devpost.com/",
    "starts_at": "2026-05-19T18:30:00.000Z",
    "ends_at": "2026-06-19T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-8",
    "title": "GitLab Transcend Hackathon",
    "organizer": "GitLab",
    "description": "GitLab Transcend Hackathon - Online hackathon. Jun 10 - 24, 2026. 1,094 participants registered.",
    "tags": [
      "AI",
      "Machine Learning",
      "Docker",
      "Kubernetes",
      "TypeScript",
      "React"
    ],
    "prize_pool": "$20,000 USD",
    "registration_url": "https://gitlab-transcend.devpost.com/",
    "starts_at": "2026-06-09T18:30:00.000Z",
    "ends_at": "2026-06-23T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-9",
    "title": "Reddit’s Games with a Hook Hackathon",
    "organizer": "reddit",
    "description": "Reddit’s Games with a Hook Hackathon - Online hackathon. Jun 17 - Jul 15, 2026. 777 participants registered.",
    "tags": [
      "TypeScript",
      "React"
    ],
    "prize_pool": "$40,000 USD",
    "registration_url": "https://redditgameswithahook.devpost.com/",
    "starts_at": "2026-06-16T18:30:00.000Z",
    "ends_at": "2026-07-14T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-10",
    "title": "Arm Create: AI Optimization Challenge",
    "organizer": "arm",
    "description": "Arm Create: AI Optimization Challenge - Online hackathon. Jun 04 - Aug 14, 2026. 458 participants registered.",
    "tags": [
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$8,000 USD",
    "registration_url": "https://arm-ai-optimization-challenge.devpost.com/",
    "starts_at": "2026-06-03T18:30:00.000Z",
    "ends_at": "2026-08-13T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-11",
    "title": "LUMA Hackathon (July 3rd - 10th)",
    "organizer": "LUMA",
    "description": "LUMA Hackathon (July 3rd - 10th) - Online hackathon. Apr 11 - Jul 10, 2026. 614 participants registered.",
    "tags": [
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$0 USD",
    "registration_url": "https://luma-hackathon-500.devpost.com/",
    "starts_at": "2026-04-10T18:30:00.000Z",
    "ends_at": "2026-07-09T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-12",
    "title": "Agentic AI Build Week 2026",
    "organizer": "GenAI Fund",
    "description": "Agentic AI Build Week 2026 - Galaxy Innovation Park hackathon. Jun 09 - Jul 11, 2026. 521 participants registered.",
    "tags": [
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$1,000,000 USD",
    "registration_url": "https://agentic-ai-build-week-2026.devpost.com/",
    "starts_at": "2026-06-08T18:30:00.000Z",
    "ends_at": "2026-07-10T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-13",
    "title": "Creator Colosseum Startup Competition: Student Founders. Real Startups.",
    "organizer": "Creator Colosseum",
    "description": "Creator Colosseum Startup Competition: Student Founders. Real Startups.  - Online hackathon. Apr 24 - Jun 30, 2026. 474 participants registered.",
    "tags": [
      "AI",
      "Python",
      "React"
    ],
    "prize_pool": "$575 USD",
    "registration_url": "https://creatorcolosseum.devpost.com/",
    "starts_at": "2026-04-23T18:30:00.000Z",
    "ends_at": "2026-06-29T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-14",
    "title": "PhysTech 2026: Physical Activity and Technology Hack Day",
    "organizer": "Binnovative",
    "description": "PhysTech 2026: Physical Activity and Technology Hack Day - Online hackathon. Feb 08 - Jun 27, 2026. 416 participants registered.",
    "tags": [
      "Python",
      "React",
      "FastAPI"
    ],
    "prize_pool": "$0 USD",
    "registration_url": "https://phystech-2026.devpost.com/",
    "starts_at": "2026-02-07T18:30:00.000Z",
    "ends_at": "2026-06-26T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-15",
    "title": "Github readme generation",
    "organizer": "presentme",
    "description": "Github readme generation  - Online hackathon. Apr 22 - Jul 06, 2026. 376 participants registered.",
    "tags": [
      "Python",
      "React",
      "AI"
    ],
    "prize_pool": "$0 USD",
    "registration_url": "https://github-readme-generation.devpost.com/",
    "starts_at": "2026-04-21T18:30:00.000Z",
    "ends_at": "2026-07-05T18:30:00.000Z",
    "status": "ongoing",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-16",
    "title": "HackMars 3.0: NEON",
    "organizer": "HackMars",
    "description": "HackMars 3.0: NEON - Online hackathon. May 16 - Jun 16, 2026. 166 participants registered.",
    "tags": [
      "Python",
      "React",
      "AI",
      "Machine Learning",
      "TypeScript"
    ],
    "prize_pool": "$0 USD",
    "registration_url": "https://hackmars-3-0-neon.devpost.com/",
    "starts_at": "2026-05-15T18:30:00.000Z",
    "ends_at": "2026-06-15T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-17",
    "title": "Alpha Club",
    "organizer": "me",
    "description": "Alpha Club - ONLINE' hackathon. Jun 17 - 20, 2026. 4 participants registered.",
    "tags": [
      "TypeScript",
      "AI"
    ],
    "prize_pool": "$0 USD",
    "registration_url": "https://alpha-club.devpost.com/",
    "starts_at": "2026-06-16T18:30:00.000Z",
    "ends_at": "2026-06-19T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-18",
    "title": "Google Cloud Rapid Agent Hackathon",
    "organizer": "Google",
    "description": "Google Cloud Rapid Agent Hackathon - Online hackathon. May 05 - Jun 11, 2026. 14,511 participants registered.",
    "tags": [
      "PostgreSQL",
      "Supabase",
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$60,000 USD",
    "registration_url": "https://rapid-agent.devpost.com/",
    "starts_at": "2026-05-04T18:30:00.000Z",
    "ends_at": "2026-06-10T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-19",
    "title": "FIND EVIL!",
    "organizer": "sans",
    "description": "FIND EVIL! - Online hackathon. Apr 15 - Jun 15, 2026. 4,420 participants registered.",
    "tags": [
      "AI",
      "Machine Learning"
    ],
    "prize_pool": "$22,000 USD",
    "registration_url": "https://findevil.devpost.com/",
    "starts_at": "2026-04-14T18:30:00.000Z",
    "ends_at": "2026-06-14T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
  },
  {
    "id": "h-real-20",
    "title": "Splunk Agentic Ops Hackathon",
    "organizer": "Splunk",
    "description": "Splunk Agentic Ops Hackathon - Online hackathon. May 18 - Jun 15, 2026. 2,387 participants registered.",
    "tags": [
      "AI",
      "Machine Learning",
      "TypeScript"
    ],
    "prize_pool": "$20,000 USD",
    "registration_url": "https://splunk.devpost.com/",
    "starts_at": "2026-05-17T18:30:00.000Z",
    "ends_at": "2026-06-14T18:30:00.000Z",
    "status": "completed",
    "submitted_by": null,
    "created_at": "2026-06-20T09:16:53.346Z"
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
