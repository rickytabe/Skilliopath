"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LearnerProfile, CurriculumModule } from "@/services/ai/client";
import { supabase } from "@/lib/supabase";

export default function PathPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1 });
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadOrGenerate() {
      try {
        const savedProfileStr = sessionStorage.getItem("skilliopath_profile");
        if (!savedProfileStr) {
          router.push("/onboarding");
          return;
        }
        const parsedProfile = JSON.parse(savedProfileStr) as LearnerProfile;
        setProfile(parsedProfile);

        const savedCurriculumStr = sessionStorage.getItem("skilliopath_curriculum");
        if (savedCurriculumStr) {
          setModules(JSON.parse(savedCurriculumStr));
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsedProfile),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setModules(data);
        sessionStorage.setItem("skilliopath_curriculum", JSON.stringify(data));
      } catch (err: unknown) {
        console.error("Error loading curriculum:", err);
        const error = err as Error;
        setErrorMsg(error.message || "Failed to load curriculum.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrGenerate();
  }, [router]);

  useEffect(() => {
    if (profile) {
      supabase.from('profiles').select('total_xp, current_level').eq('id', profile.id).single().then(({data}) => {
         if (data) setLiveStats({ totalXp: data.total_xp || 0, currentLevel: data.current_level || 1 });
      });
      supabase.from('user_progress').select('module_id, stars_earned').eq('profile_id', profile.id).then(({data}) => {
         if (data) {
           setProgressMap(data.reduce((acc, p) => ({ ...acc, [p.module_id]: p.stars_earned || 0 }), {} as Record<string, number>));
         }
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-muted font-medium tracking-wide text-sm uppercase">Mapping your day-by-day roadmap...</p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  let currentTimingLabel = "";

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 pt-24 pb-32 overflow-x-hidden">
      <div className="mx-auto max-w-5xl">
        
        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 text-center shadow-lg backdrop-blur-md">
            {errorMsg}
          </div>
        )}

        {/* Header Summary */}
        <div className="mb-20 text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-high mb-6">
            Master <span className="text-gold-gradient">{profile.skillToLearn}</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 rounded-full">
              Timeline: {profile.timeline}
            </span>
            <span className="px-4 py-1.5 text-sm font-medium bg-white/5 text-mid border border-hairline rounded-full">
              Level {liveStats.currentLevel}
            </span>
            <span className="px-4 py-1.5 text-sm font-medium bg-white/5 text-mid border border-hairline rounded-full">
              {liveStats.totalXp} XP
            </span>
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-hairline bg-surface/50 p-6 backdrop-blur-sm text-left">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Your Personalized Focus Areas</h2>
            <ul className="space-y-3">
              {profile.skillGaps.map((gap, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                    ❖
                  </div>
                  <span className="text-sm font-medium text-high">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* The Roadmap */}
        <div className="relative">
          {/* Central Line for Desktop */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-hairline transform md:-translate-x-1/2 hidden sm:block"></div>

          <div className="space-y-12 sm:space-y-0 relative">
            {modules.map((mod, idx) => {
              const showHeader = mod.timingLabel !== currentTimingLabel;
              if (showHeader) currentTimingLabel = mod.timingLabel;

              const isEven = idx % 2 === 0;
              const isCurrent = mod.status === "current";
              const isComplete = mod.status === "complete";
              const isLocked = mod.status === "locked";

              return (
                <div key={mod.id} className="relative">
                  {/* Group Header (Timing Label) */}
                  {showHeader && (
                    <div className="sticky top-20 z-20 flex justify-start md:justify-center mb-8 mt-16 first:mt-0 ml-12 sm:ml-0">
                      <div className="bg-base/80 backdrop-blur-md border border-primary/30 px-6 py-2 rounded-full text-sm font-bold text-primary shadow-[0_0_15px_rgba(242,169,59,0.15)]">
                        {mod.timingLabel}
                      </div>
                    </div>
                  )}

                  {/* Node Row */}
                  <div className={`relative flex items-center justify-start md:justify-between w-full group ${
                    isEven ? "md:flex-row-reverse" : "md:flex-row"
                  }`}>
                    
                    {/* Empty Space for alternate side on Desktop */}
                    <div className="hidden md:block w-5/12"></div>

                    {/* Center Node / Icon */}
                    <div className="absolute left-0 sm:left-6 md:left-1/2 w-12 h-12 transform -translate-x-0 sm:-translate-x-1/2 flex items-center justify-center z-10">
                      {isCurrent && (
                        <div className="w-10 h-10 rounded-full bg-base border-4 border-primary shadow-[0_0_20px_rgba(242,169,59,0.5)] flex items-center justify-center animate-pulse">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                        </div>
                      )}
                      {isComplete && (
                        <div className="w-10 h-10 rounded-full bg-green-500 text-background flex items-center justify-center shadow-lg shadow-green-500/20">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {isLocked && (
                        <div className="w-8 h-8 rounded-full bg-surface border-2 border-hairline flex items-center justify-center text-muted text-xs font-medium transition-colors group-hover:border-primary/50 group-hover:text-primary/50">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Content Card */}
                    <div className="w-full pl-16 sm:pl-20 md:pl-0 md:w-5/12">
                      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                        isCurrent 
                          ? "bg-primary/5 border-primary shadow-[0_0_30px_rgba(242,169,59,0.15)] hover:bg-primary/10 hover:-translate-y-1" 
                          : isLocked 
                            ? "bg-surface/30 border-hairline hover:bg-surface/50" 
                            : "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                      }`}>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            isCurrent ? 'text-primary' : isLocked ? 'text-muted/60' : 'text-green-500'
                          }`}>
                            {isCurrent ? "Next Up" : isLocked ? "Locked" : "Completed"}
                          </p>
                          <span className="text-muted/30 text-xs">•</span>
                          <p className={`text-xs font-medium ${isCurrent ? 'text-primary/80' : 'text-muted/50'}`}>
                            {mod.estimatedDuration || "30 mins"}
                          </p>
                        </div>
                        
                        {isCurrent ? (
                          <Link href={`/lesson/${mod.id}`} className="block focus:outline-none">
                            <h3 className="text-xl font-bold text-high mb-2 hover:text-primary transition-colors">
                              {mod.title}
                            </h3>
                          </Link>
                        ) : (
                          <h3 className={`text-xl font-bold mb-2 ${isLocked ? 'text-muted' : 'text-high'}`}>
                            {mod.title}
                          </h3>
                        )}
                        
                        <p className={`text-sm leading-relaxed ${isLocked ? 'text-muted/70' : 'text-mid'}`}>
                          {mod.angle}
                        </p>

                        {isCurrent && (
                          <Link href={`/lesson/${mod.id}`} className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary hover:text-glow transition-colors">
                            Start Lesson
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        )}

                        {isComplete && progressMap[mod.id] !== undefined && (
                          <div className="flex gap-1 mt-4">
                            {[1, 2, 3].map(star => (
                              <svg key={star} className={`w-4 h-4 ${star <= progressMap[mod.id] ? 'text-primary' : 'text-surface-light opacity-30 grayscale'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Certificate Goal Node */}
            {modules.length > 0 && (
              <div className="relative mt-24 flex flex-col md:items-center pt-4 md:pt-16">
                
                {/* Goal Icon */}
                <div className="absolute top-0 left-0 sm:left-6 md:left-1/2 w-12 h-12 transform -translate-x-0 sm:-translate-x-1/2 flex items-center justify-center z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_40px_rgba(234,179,8,0.5)] flex items-center justify-center border-4 border-background z-20">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                </div>

                {/* Content Card */}
                <div className="w-full pl-16 sm:pl-20 md:pl-0 md:max-w-lg md:mx-auto z-10">
                  <div className="p-8 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden md:text-center backdrop-blur-md">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-500/20 rounded-full blur-[50px]"></div>
                    
                    <div className="flex items-center md:justify-center gap-2 mb-3 relative z-10">
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                        Final Goal
                      </p>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-high mb-3 relative z-10">
                      {profile.skillToLearn} Certification
                    </h3>
                    
                    <p className="text-sm leading-relaxed text-yellow-500/80 relative z-10 font-medium">
                      Complete all modules to unlock your personalized certificate of mastery.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
