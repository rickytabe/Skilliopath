"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// --- SVG Icon Components ---
const Icons = {
  brain: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  cloud: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  shield: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  chart: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  target: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  bolt: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  pencil: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  camera: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  ),
  code: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  ),
  microphone: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
  globe: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.974 0-5.699-.542-8.162-1.48" />
    </svg>
  ),
  video: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  phone: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  wrench: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// Map skill IDs to their icons and color schemes
const SKILL_META: Record<string, { icon: React.ReactNode; color: string; iconColor: string }> = {
  "ai-ml":              { icon: Icons.brain,    color: "from-purple-500/15 to-purple-600/5",  iconColor: "text-purple-600" },
  "cloud-devops":       { icon: Icons.cloud,    color: "from-blue-500/15 to-blue-600/5",      iconColor: "text-blue-600" },
  "cybersecurity":      { icon: Icons.shield,   color: "from-red-500/15 to-red-600/5",        iconColor: "text-red-600" },
  "data-science":       { icon: Icons.chart,    color: "from-emerald-500/15 to-emerald-600/5", iconColor: "text-emerald-600" },
  "product-management": { icon: Icons.target,   color: "from-orange-500/15 to-orange-600/5",  iconColor: "text-orange-600" },
  "ux-ui":              { icon: Icons.sparkles, color: "from-pink-500/15 to-pink-600/5",      iconColor: "text-pink-600" },
  "prompt-engineering":  { icon: Icons.bolt,    color: "from-amber-500/15 to-amber-600/5",    iconColor: "text-amber-600" },
  "copywriting":        { icon: Icons.pencil,   color: "from-indigo-500/15 to-indigo-600/5",  iconColor: "text-indigo-600" },
  "ugc-creation":       { icon: Icons.camera,   color: "from-teal-500/15 to-teal-600/5",     iconColor: "text-teal-600" },
  "frontend-dev":       { icon: Icons.code,     color: "from-cyan-500/15 to-cyan-600/5",      iconColor: "text-cyan-600" },
  "digital-marketing":  { icon: Icons.microphone, color: "from-fuchsia-500/15 to-fuchsia-600/5", iconColor: "text-fuchsia-600" },
  "seo-specialist":     { icon: Icons.globe,    color: "from-lime-500/15 to-lime-600/5",      iconColor: "text-lime-600" },
  "video-editing":      { icon: Icons.video,    color: "from-rose-500/15 to-rose-600/5",      iconColor: "text-rose-600" },
  "tech-sales":         { icon: Icons.phone,    color: "from-green-500/15 to-green-600/5",    iconColor: "text-green-600" },
  "it-support":         { icon: Icons.wrench,   color: "from-slate-500/15 to-slate-600/5",    iconColor: "text-slate-600" },
};

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

function formatSalary(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000).toLocaleString()}k`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatJobCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k+`;
  }
  return `${count}+`;
}

export default function CareerMarketPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<MarketSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Tech & Data", "Business & Strategy", "Marketing & Creative", "Emerging Tech", "Creative & Design"];

  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch("/api/market");
        if (!res.ok) throw new Error("Failed to fetch market data");
        const json = await res.json();
        setSkills(json.skills || []);
        setIsLive(json.live || false);
      } catch (err) {
        console.error("Market fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMarketData();
  }, []);

  const filteredSkills = activeCategory === "All"
    ? skills
    : skills.filter(s => s.category === activeCategory);

  const handleStartPath = (skill: string) => {
    router.push(`/diagnostic?skillToLearn=${encodeURIComponent(skill)}&currentLevel=Beginner&timeline=3%20months`);
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto pb-32 animate-fade-in custom-scrollbar">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-high">
            Career <span className="text-gold-gradient">Market</span>
          </h1>
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Data
            </span>
          )}
        </div>
        <p className="text-muted text-base max-w-2xl">
          Discover high-paying, high-demand skills currently trending in the global market.
          Explore real salary insights, job availability, and start your personalized learning path instantly.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              activeCategory === cat
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                : "bg-surface text-muted hover:text-high hover:bg-surface-light border border-hairline hover:border-primary/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-hairline rounded-3xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-surface shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 bg-surface rounded-lg shimmer" />
                  <div className="h-4 w-1/3 bg-surface rounded-md shimmer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-surface rounded-2xl p-4 space-y-2">
                  <div className="h-3 w-16 bg-surface-light rounded-full shimmer" />
                  <div className="h-6 w-20 bg-surface-light rounded-lg shimmer" />
                  <div className="h-3 w-24 bg-surface-light rounded-full shimmer" />
                </div>
                <div className="bg-surface rounded-2xl p-4 space-y-2">
                  <div className="h-3 w-16 bg-surface-light rounded-full shimmer" />
                  <div className="h-4 w-full bg-surface-light rounded-lg shimmer" />
                  <div className="h-3 w-20 bg-surface-light rounded-full shimmer" />
                </div>
              </div>
              <div className="border-t border-hairline pt-5 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-surface rounded-lg shimmer" />
                  <div className="h-3 w-28 bg-surface rounded-full shimmer" />
                </div>
                <div className="h-10 w-24 bg-surface rounded-xl shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => {
            const meta = SKILL_META[skill.id] || { icon: Icons.brain, color: "from-gray-500/15 to-gray-600/5", iconColor: "text-gray-600" };

            return (
              <div
                key={skill.id}
                className="group relative bg-white border border-hairline rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden flex flex-col"
              >
                {/* Background Glow on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Card Header */}
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center ${meta.iconColor} shadow-sm border border-white/50 shrink-0`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-high leading-tight mb-1.5 group-hover:text-primary transition-colors">{skill.title}</h3>
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg bg-surface border border-hairline ${meta.iconColor}`}>
                      {skill.category}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-5 relative z-10 flex-1">
                  <div className="bg-surface/80 rounded-2xl p-4 border border-hairline/50">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1.5">Avg. Salary</p>
                    <p className="text-xl font-black text-high">{formatSalary(skill.salary.median)}</p>
                    <p className="text-[10px] text-muted mt-0.5">{formatSalary(skill.salary.min)} – {formatSalary(skill.salary.max)}</p>
                  </div>
                  <div className="bg-surface/80 rounded-2xl p-4 border border-hairline/50">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1.5">Open Positions</p>
                    <p className="text-xl font-black text-high">{formatJobCount(skill.jobCount)}</p>
                    <p className="text-[10px] text-muted mt-0.5">{skill.growthLabel}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto relative z-10 border-t border-hairline pt-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold text-high">{skill.rating}</span>
                      <span className="text-xs text-muted">({skill.reviews})</span>
                    </div>
                    <p className="text-xs text-muted font-medium flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      {skill.students} learning
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartPath(skill.title)}
                    className="px-5 py-2.5 bg-high text-white hover:bg-primary text-sm font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
                  >
                    Start Path
                  </button>
                </div>

                {/* Live indicator dot */}
                {skill.isLive && (
                  <div className="absolute top-4 right-4 z-10" title="Live market data">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSkills.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">No skills found in this category.</p>
          <button onClick={() => setActiveCategory("All")} className="mt-4 text-primary font-bold hover:underline">
            View All Skills
          </button>
        </div>
      )}
    </div>
  );
}
