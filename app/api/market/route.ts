import { NextResponse } from "next/server";

// --- Skill Definitions (search queries + hardcoded metadata) ---
const SKILL_DEFINITIONS = [
  {
    id: "ai-ml",
    title: "Artificial Intelligence & ML",
    searchQuery: "artificial intelligence machine learning engineer",
    category: "Tech & Data",
    students: "45,210",
    rating: 4.9,
    reviews: "12k+",
    growthLabel: "🔥 Explosive Growth (+35% YoY)",
    fallbackSalary: { min: 110000, median: 145000, max: 195000 },
    fallbackJobs: 12400,
  },
  {
    id: "cloud-devops",
    title: "Cloud Computing & DevOps",
    searchQuery: "cloud engineer devops",
    category: "Tech & Data",
    students: "32,150",
    rating: 4.8,
    reviews: "8.5k+",
    growthLabel: "High Demand (+18% YoY)",
    fallbackSalary: { min: 100000, median: 130000, max: 175000 },
    fallbackJobs: 9800,
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & InfoSec",
    searchQuery: "cybersecurity analyst information security",
    category: "Tech & Data",
    students: "28,400",
    rating: 4.9,
    reviews: "6.2k+",
    growthLabel: "🔥 Critical Shortage (+28% YoY)",
    fallbackSalary: { min: 90000, median: 120000, max: 165000 },
    fallbackJobs: 8200,
  },
  {
    id: "data-science",
    title: "Data Science & Analytics",
    searchQuery: "data scientist analytics",
    category: "Tech & Data",
    students: "52,800",
    rating: 4.7,
    reviews: "15k+",
    growthLabel: "Steady Growth (+15% YoY)",
    fallbackSalary: { min: 85000, median: 115000, max: 160000 },
    fallbackJobs: 11500,
  },
  {
    id: "product-management",
    title: "Product Management",
    searchQuery: "product manager",
    category: "Business & Strategy",
    students: "21,300",
    rating: 4.8,
    reviews: "5.1k+",
    growthLabel: "High Demand (+20% YoY)",
    fallbackSalary: { min: 85000, median: 110000, max: 155000 },
    fallbackJobs: 7600,
  },
  {
    id: "ux-ui",
    title: "UX/UI Design",
    searchQuery: "ux designer ui designer",
    category: "Creative & Design",
    students: "38,900",
    rating: 4.9,
    reviews: "9.3k+",
    growthLabel: "Steady Growth (+12% YoY)",
    fallbackSalary: { min: 70000, median: 95000, max: 135000 },
    fallbackJobs: 6400,
  },
  {
    id: "prompt-engineering",
    title: "Prompt Engineering",
    searchQuery: "prompt engineer AI",
    category: "Emerging Tech",
    students: "15,600",
    rating: 4.6,
    reviews: "3.2k+",
    growthLabel: "🔥 Explosive Growth (+85% YoY)",
    fallbackSalary: { min: 80000, median: 105000, max: 150000 },
    fallbackJobs: 3200,
  },
  {
    id: "copywriting",
    title: "Direct Response Copywriting",
    searchQuery: "copywriter direct response",
    category: "Marketing & Creative",
    students: "19,200",
    rating: 4.8,
    reviews: "4.8k+",
    growthLabel: "High Demand (+14% YoY)",
    fallbackSalary: { min: 55000, median: 85000, max: 120000 },
    fallbackJobs: 4100,
  },
  {
    id: "ugc-creation",
    title: "UGC Content Creation",
    searchQuery: "content creator UGC social media",
    category: "Marketing & Creative",
    students: "24,500",
    rating: 4.7,
    reviews: "7.1k+",
    growthLabel: "🔥 Rapid Growth (+45% YoY)",
    fallbackSalary: { min: 40000, median: 70000, max: 110000 },
    fallbackJobs: 5300,
  },
];

// --- In-Memory Cache (24 hours) ---
interface CacheEntry {
  data: MarketSkill[];
  timestamp: number;
}

interface MarketSkill {
  id: string;
  title: string;
  category: string;
  students: string;
  rating: number;
  reviews: string;
  growthLabel: string;
  salary: { min: number; median: number; max: number };
  jobCount: number;
  isLive: boolean;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let cache: CacheEntry | null = null;

function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

async function fetchSalaryEstimate(
  query: string,
  apiKey: string
): Promise<{ min: number; median: number; max: number } | null> {
  try {
    const url = `https://jsearch.p.rapidapi.com/estimated-salary?job_title=${encodeURIComponent(query)}&location=United%20States&radius=100`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json.data;
    if (data && data.length > 0) {
      const entry = data[0];
      return {
        min: Math.round(entry.min_salary || 0),
        median: Math.round(entry.median_salary || 0),
        max: Math.round(entry.max_salary || 0),
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchJobCount(
  query: string,
  apiKey: string
): Promise<number | null> {
  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=us`;
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
    });

    if (!res.ok) return null;

    const json = await res.json();
    // The search endpoint returns total results in the status
    return json.data?.length ? (json.status?.total_results || json.data.length * 10) : null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ skills: cache.data, cached: true });
    }

    const apiKey = process.env.RAPIDAPI_KEY;

    // If no API key, return fallback data
    if (!apiKey) {
      const fallbackSkills: MarketSkill[] = SKILL_DEFINITIONS.map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category,
        students: s.students,
        rating: s.rating,
        reviews: s.reviews,
        growthLabel: s.growthLabel,
        salary: s.fallbackSalary,
        jobCount: s.fallbackJobs,
        isLive: false,
      }));

      return NextResponse.json({ skills: fallbackSkills, cached: false, live: false });
    }

    // Fetch live data for all skills (sequentially to respect rate limits)
    const skills: MarketSkill[] = [];

    for (const skillDef of SKILL_DEFINITIONS) {
      const [salaryData, jobCount] = await Promise.all([
        fetchSalaryEstimate(skillDef.searchQuery, apiKey),
        fetchJobCount(skillDef.searchQuery, apiKey),
      ]);

      skills.push({
        id: skillDef.id,
        title: skillDef.title,
        category: skillDef.category,
        students: skillDef.students,
        rating: skillDef.rating,
        reviews: skillDef.reviews,
        growthLabel: skillDef.growthLabel,
        salary: salaryData || skillDef.fallbackSalary,
        jobCount: jobCount || skillDef.fallbackJobs,
        isLive: !!(salaryData || jobCount),
      });
    }

    // Cache results
    cache = { data: skills, timestamp: Date.now() };

    return NextResponse.json({ skills, cached: false, live: true });
  } catch (error) {
    console.error("Error in /api/market:", error);

    // Return fallback on any error
    const fallbackSkills: MarketSkill[] = SKILL_DEFINITIONS.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      students: s.students,
      rating: s.rating,
      reviews: s.reviews,
      growthLabel: s.growthLabel,
      salary: s.fallbackSalary,
      jobCount: s.fallbackJobs,
      isLive: false,
    }));

    return NextResponse.json({ skills: fallbackSkills, cached: false, live: false });
  }
}
