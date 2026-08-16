"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LearnerProfile, CurriculumModule } from "@/services/ai/client";
import { createClient } from "@/utils/supabase/client";

function PathContent() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [allPaths, setAllPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1 });
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Analyzing your skills...");
  
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 98) return prev;
        const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
        return Math.min(99, prev + increment);
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (loadingProgress > 20 && loadingProgress <= 50) setLoadingText("Identifying skill gaps...");
    else if (loadingProgress > 50 && loadingProgress <= 80) setLoadingText("Structuring daily modules...");
    else if (loadingProgress > 80) setLoadingText("Finalizing personalized path...");
  }, [loadingProgress]);

  useEffect(() => {
    async function loadOrGenerate() {
      try {
        let pathId = searchParams.get('id');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: pathsData } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false });
        
        if (pathsData) {
          setAllPaths(pathsData);
        }

        let pathData;
        if (pathId) {
           const { data } = await supabase.from('learning_paths').select('*').eq('id', pathId).single();
           pathData = data;
        }

        if (!pathData) {
          setIsLoading(false);
          return;
        }
        
        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        setProfile({
           id: user.id,
           name: userProfile?.name || "Learner",
           skillToLearn: pathData.skill_to_learn,
           skillGaps: pathData.skill_gaps || [],
           currentCareer: userProfile?.current_career || "Student",
           pathId: pathData.id
        } as any);

        const { data: modulesData } = await supabase
          .from('curriculum_modules')
          .select('*')
          .eq('path_id', pathData.id)
          .order('order_index', { ascending: true });

        if (modulesData && modulesData.length > 0) {
          const formattedModules = modulesData.map(m => ({
            id: m.id,
            title: m.title,
            angle: m.angle,
            timingLabel: m.timing_label,
            order: m.order_index,
            status: m.status
          }));
          setModules(formattedModules as any);
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pathId: pathData.id,
            name: userProfile?.name || "Learner",
            currentCareer: userProfile?.current_career || "Student",
            skillToLearn: pathData.skill_to_learn,
            skillGaps: pathData.skill_gaps || []
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        setModules(data);
      } catch (err: unknown) {
        console.error("Error loading curriculum:", err);
        const error = err as Error;
        setErrorMsg(error.message || "Failed to load curriculum.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrGenerate();
  }, [router, searchParams]);

  useEffect(() => {
    if (profile && profile.id) {
      supabase.from('profiles').select('total_xp, current_level').eq('id', profile.id as string).single().then(({ data }) => {
        if (data) setLiveStats({ totalXp: data.total_xp || 0, currentLevel: data.current_level || 1 });
      });
      supabase.from('user_progress').select('module_id, stars_earned').eq('profile_id', profile.id as string).then(({ data }) => {
        if (data) {
          setProgressMap(data.reduce((acc, p) => ({ ...acc, [p.module_id as string]: p.stars_earned || 0 }), {} as Record<string, number>));
        }
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background ring */}
            <svg className="absolute inset-0 w-full h-full text-surface -rotate-90" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" />
            </svg>
            {/* Animated progress ring */}
            <svg className="absolute inset-0 w-full h-full text-primary -rotate-90 transition-all duration-300 ease-out" viewBox="0 0 100 100" fill="none">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * loadingProgress) / 100}
              />
            </svg>
            {/* Center percentage */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-display font-bold text-high">{Math.round(loadingProgress)}%</span>
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-3">
             <div className="flex justify-between text-sm font-medium">
               <span className="text-high">Generating Curriculum</span>
               <span className="text-primary animate-pulse">{loadingText}</span>
             </div>
             <div className="w-full h-2 bg-surface rounded-full overflow-hidden shadow-inner">
               <div 
                 className="h-full bg-primary transition-all duration-300 ease-out relative"
                 style={{ width: `${loadingProgress}%` }}
               >
                 <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
               </div>
             </div>
          </div>
          
        </div>
      </main>
    );
  }

  if (!profile) {
    if (allPaths.length > 0) {
      return (
        <main className="min-h-screen bg-background px-4 sm:px-6 pt-24 pb-32">
          <div className="mx-auto max-w-5xl animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-high mb-8">My Learning Paths</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {allPaths.map((path) => (
                  <Link key={path.id} href={`/path?id=${path.id}`} className="bg-white border border-hairline p-6 rounded-2xl flex flex-col justify-between hover:border-primary/60 transition-all duration-200 group shadow-sm hover:shadow-md cursor-pointer">
                     <div className="mb-6">
                        <h4 className="font-bold text-lg text-high mb-2 group-hover:text-primary transition-colors line-clamp-2">{path.skill_to_learn}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Started {new Date(path.created_at).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="flex items-center pt-4 border-t border-hairline">
                        <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                           Continue <span aria-hidden="true">&rarr;</span>
                        </span>
                     </div>
                  </Link>
               ))}
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-md flex flex-col items-center gap-6 text-center bg-white p-10 rounded-3xl border border-hairline shadow-sm">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-muted mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display text-high tracking-tight">No Active Path</h2>
          <p className="text-mid text-sm leading-relaxed max-w-xs">
            You haven't generated a learning path yet. Let our AI figure out exactly what you need to learn.
          </p>
          <Link href="/onboarding" className="mt-4 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover hover:-translate-y-0.5 transition-all shadow-[0_0_20px_rgba(242,169,59,0.3)]">
            Create Your Path
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-muted hover:text-primary transition-colors mt-2">
            Return to Dashboard
          </Link>
        </div>
        
        <div className="w-full max-w-3xl mt-12 animate-fade-in-up" style={{animationDelay: '100ms'}}>
           <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-5 text-center">Or start a Trending Skill</h4>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {[
                { title: "Artificial Intelligence & ML", icon: "🧠", color: "bg-blue-50 text-blue-600 border-blue-200" },
                { title: "Generative AI & Workflows", icon: "🤖", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                { title: "Cybersecurity", icon: "🛡️", color: "bg-red-50 text-red-600 border-red-200" },
                { title: "Cloud Computing & DevOps", icon: "☁️", color: "bg-sky-50 text-sky-600 border-sky-200" },
                { title: "Data Science & Analytics", icon: "📊", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                { title: "Software Development", icon: "💻", color: "bg-slate-50 text-slate-700 border-slate-200" },
                { title: "Management Consulting", icon: "💼", color: "bg-amber-50 text-amber-600 border-amber-200" },
                { title: "Project Management", icon: "📋", color: "bg-orange-50 text-orange-600 border-orange-200" },
                { title: "UX/UI Design", icon: "🎨", color: "bg-purple-50 text-purple-600 border-purple-200" },
                { title: "Digital Marketing", icon: "📱", color: "bg-pink-50 text-pink-600 border-pink-200" },
             ].map((skill, i) => (
               <Link key={i} href={`/onboarding?skill=${encodeURIComponent(skill.title)}`} className="group flex flex-col items-center text-center bg-white border border-hairline p-5 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 border ${skill.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {skill.icon}
                  </div>
                  <h5 className="font-bold text-sm text-high group-hover:text-primary transition-colors leading-tight">{skill.title}</h5>
               </Link>
             ))}
           </div>
        </div>
      </main>
    );
  }

  let currentTimingLabel = "";

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 pt-24 pb-32 overflow-x-hidden">
      <div className="mx-auto max-w-5xl">

        {errorMsg && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 text-center shadow-lg backdrop-blur-md">
            {errorMsg}
          </div>
        )}

        {/* Breadcrumb UI */}
        <div className="mb-8 text-sm font-medium text-muted animate-fade-in flex items-center gap-2">
          <Link href="/path" className="hover:text-primary transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Paths
          </Link>
          <span className="text-hairline">/</span>
          <span className="text-high">{profile.skillToLearn}</span>
        </div>

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
                  <div className={`relative flex items-center justify-start md:justify-between w-full group ${isEven ? "md:flex-row-reverse" : "md:flex-row"
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
                      <div className={`p-6 rounded-2xl border transition-all duration-300 ${isCurrent
                        ? "bg-primary/5 border-primary shadow-[0_0_30px_rgba(242,169,59,0.15)] hover:bg-primary/10 hover:-translate-y-1"
                        : isLocked
                          ? "bg-surface/30 border-hairline hover:bg-surface/50"
                          : "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                        }`}>

                        <div className="flex items-center gap-2 mb-3">
                          <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-primary' : isLocked ? 'text-muted/60' : 'text-green-500'
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

export default function PathPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface" />
          <div className="h-4 w-32 bg-surface rounded-lg" />
        </div>
      </main>
    }>
      <PathContent />
    </Suspense>
  );
}
