"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { LearnerProfile, CurriculumModule, LessonContent } from "@/services/ai/client";
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from "@/utils/sounds";
import { createClient } from "@/utils/supabase/client";

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params.id as string;

  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumModule[]>([]);
  const [activeModule, setActiveModule] = useState<CurriculumModule | null>(null);
  
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [firstTryCorrect, setFirstTryCorrect] = useState<Record<number, boolean>>({});
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedStats, setEarnedStats] = useState({ stars: 0, xp: 0, totalXp: 0, currentLevel: 0 });

  // Audio state
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fetchLesson = async (p: LearnerProfile, m: CurriculumModule, allMods?: CurriculumModule[]) => {
    setIsLoading(true);
    setHasError(false);
    try {
      // 1. Fetch from API (which will check DB, then AI)
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: p, module: m }),
      });
      
      if (!res.ok) throw new Error("Failed to fetch lesson");
      
      const data = await res.json();
      setLessonContent(data);

      // 2. Pre-fetch next module in background
      if (allMods) {
        const currentIndex = allMods.findIndex(mod => mod.id === m.id);
        if (currentIndex !== -1 && currentIndex < allMods.length - 1) {
          const nextMod = allMods[currentIndex + 1];
          fetch("/api/lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile: p, module: nextMod }),
          }).catch(e => console.error("Background prefetch failed:", e));
        }
      }
    } catch (error: unknown) {
      console.error(error);
      setHasError(true);
      toast.error("Failed to generate lesson. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: moduleData } = await supabase
          .from("curriculum_modules")
          .select("*, learning_paths(*)")
          .eq("id", lessonId)
          .single();

        if (!moduleData) {
          router.push("/path");
          return;
        }

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        const profileObj = {
          id: user.id,
          name: userProfile?.name || "Learner",
          currentCareer: userProfile?.current_career || "Student",
          skillToLearn: moduleData.learning_paths.skill_to_learn,
          skillGaps: moduleData.learning_paths.skill_gaps || [],
        } as LearnerProfile;

        const moduleObj = {
          id: moduleData.id,
          title: moduleData.title,
          angle: moduleData.angle,
          status: moduleData.status,
          timingLabel: moduleData.timing_label,
        } as CurriculumModule;
        
        const { data: allModules } = await supabase
          .from("curriculum_modules")
          .select("*")
          .eq("path_id", moduleData.path_id)
          .order("order_index", { ascending: true });
        
        let formattedModules: CurriculumModule[] = [];
        if (allModules) {
          formattedModules = allModules.map(m => ({
            id: m.id,
            title: m.title,
            angle: m.angle,
            status: m.status,
            timingLabel: m.timing_label,
          })) as CurriculumModule[];
          setCurriculum(formattedModules);
        }

        setProfile(profileObj);
        setActiveModule(moduleObj);
        
        fetchLesson(profileObj, moduleObj, formattedModules);
      } catch (err) {
        console.error(err);
        router.push("/path");
      }
    }

    loadData();
  }, [lessonId, router]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleSpeech = (id: string, text: string) => {
    if (typeof window === "undefined") return;
    
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Target explicitly American male voices first (Windows/Mac)
      const preferredVoice = voices.find(v => 
        v.lang === 'en-US' && (v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Fred') || v.name.includes('Male'))
      ) || voices.find(v => 
        v.name.includes('Google US English') // Chrome fallback
      ) || voices.find(v => 
        v.lang === 'en-US' // Any US English fallback
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 1.0;
      
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      
      window.speechSynthesis.speak(utterance);
      setPlayingId(id);
    }
  };

  const handleOptionSelect = (quizIdx: number, optionIdx: number) => {
    if (!lessonContent) return;
    const isFirstTry = showFeedback[quizIdx] === undefined;
    const isCorrect = optionIdx === lessonContent.quiz[quizIdx].correctIndex;

    if (isFirstTry) {
      if (isCorrect) {
        setFirstTryCorrect(prev => ({ ...prev, [quizIdx]: true }));
        playCorrectSound();
      } else {
        setFirstTryCorrect(prev => ({ ...prev, [quizIdx]: false }));
        playIncorrectSound();
      }
    } else {
      if (isCorrect) playCorrectSound();
      else playIncorrectSound();
    }

    setSelectedAnswers(prev => ({ ...prev, [quizIdx]: optionIdx }));
    setShowFeedback(prev => ({ ...prev, [quizIdx]: true }));
  };

  const allQuizzesCompleted = lessonContent?.quiz.length ? lessonContent.quiz.every((_, idx) => showFeedback[idx]) : false;

  useEffect(() => {
    if (!lessonContent || !profile || !activeModule) return;
    if (allQuizzesCompleted && !showCelebration) {
      const correctCount = Object.values(firstTryCorrect).filter(Boolean).length;
      const total = lessonContent.quiz.length;
      const percentage = total > 0 ? correctCount / total : 0;
      
      let stars = 0;
      if (percentage === 1) stars = 3;
      else if (percentage >= 0.7) stars = 2;
      else if (percentage >= 0.4) stars = 1;

      const flawlessBonus = percentage === 1 ? 5 : 0;
      const xp = 10 + flawlessBonus;

      // Save to API
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          moduleId: activeModule.id,
          starsEarned: stars,
          xpEarned: xp
        })
      })
      .then(res => res.json())
      .then(data => {
        setEarnedStats({ stars, xp, totalXp: data?.totalXp || 0, currentLevel: data?.currentLevel || 0 });
      })
      .catch(console.error);

      playCelebrationSound();
      setShowCelebration(true);
    }
  }, [allQuizzesCompleted, showCelebration, lessonContent, profile, activeModule, firstTryCorrect]);

  if (!profile || !activeModule) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sidebar (Left) */}
      <aside className="w-80 border-r border-hairline bg-surface/50 backdrop-blur-md flex flex-col hidden md:flex">
        <div className="p-6 border-b border-hairline">
          <Link href="/path" className="inline-flex items-center text-sm font-medium text-muted hover:text-primary transition-colors mb-6">
            ← Back to Path
          </Link>
          <h2 className="text-xl font-display font-bold text-high tracking-tight">Your Journey</h2>
          <p className="text-xs text-primary/80 mt-1 font-medium">{profile.skillToLearn}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {curriculum.map((mod, idx) => {
            const isActive = mod.id === lessonId;
            return (
              <div 
                key={mod.id} 
                className={`p-4 rounded-xl border transition-all ${
                  isActive 
                    ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(242,169,59,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-primary text-background' : 'bg-surface border border-hairline text-muted'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold line-clamp-2 ${isActive ? 'text-primary' : 'text-high'}`}>
                      {mod.title}
                    </p>
                    <p className="text-[10px] text-muted font-medium mt-1 uppercase tracking-wider">
                      {mod.estimatedDuration}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content (Center) */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header (only visible on small screens) */}
        <div className="md:hidden border-b border-hairline bg-surface/80 backdrop-blur-md p-4 sticky top-0 z-20 flex justify-between items-center">
           <Link href="/path" className="text-sm font-medium text-primary">← Path</Link>
           <span className="text-xs font-semibold uppercase text-muted tracking-wider">Module {curriculum.findIndex(m => m.id === lessonId) + 1}</span>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
          {hasError && (
            <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center shadow-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 text-red-500 mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-500 mb-2">Generation Failed</h3>
              <p className="text-sm text-red-400 mb-6 max-w-md mx-auto">We couldn't load the lesson content.</p>
              <button 
                onClick={() => fetchLesson(profile, activeModule)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-red-500/25 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          )}

          {/* Module Header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Active Module
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-high leading-tight mb-4">
              {activeModule.title}
            </h1>
            <p className="text-sm font-medium text-muted">
              Analogy Focus: <span className="text-high">{activeModule.angle}</span>
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-10 animate-fade-in">
              {/* Read aloud button skeleton */}
              <div className="flex justify-end">
                <div className="h-9 w-32 bg-surface rounded-full shimmer" />
              </div>
              {/* Explanation paragraph skeletons */}
              <div className="space-y-4">
                <div className="h-5 w-full bg-surface rounded-lg shimmer" />
                <div className="h-5 w-11/12 bg-surface rounded-lg shimmer" />
                <div className="h-5 w-full bg-surface rounded-lg shimmer" />
                <div className="h-5 w-9/12 bg-surface rounded-lg shimmer" />
                <div className="h-5 w-full bg-surface rounded-lg shimmer" />
                <div className="h-5 w-10/12 bg-surface rounded-lg shimmer" />
                <div className="h-5 w-7/12 bg-surface rounded-lg shimmer" />
              </div>
              <hr className="border-hairline" />
              {/* Quiz section skeleton */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-40 bg-surface rounded-xl shimmer" />
                  <div className="h-6 w-24 bg-surface rounded-md shimmer" />
                </div>
                {[1, 2, 3].map(q => (
                  <div key={q} className="bg-white border border-hairline rounded-2xl p-6 space-y-4">
                    <div className="h-5 w-3/4 bg-surface rounded-lg shimmer" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(o => (
                        <div key={o} className="h-12 w-full bg-surface rounded-xl shimmer" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : lessonContent ? (
            <div className="space-y-16 animate-fade-in-up delay-200">
              
              {/* Explanation Section */}
              <section className="relative">
                <div className="flex justify-end mb-6">
                  <button 
                    onClick={() => toggleSpeech('explanation', lessonContent.explanation)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                      playingId === 'explanation' 
                        ? "bg-primary text-background shadow-[0_0_15px_rgba(242,169,59,0.4)] hover:bg-primary/90" 
                        : "bg-surface border border-hairline text-high hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {playingId === 'explanation' ? (
                      <>
                        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5z" />
                        </svg>
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Read Aloud
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-invert prose-p:text-mid prose-p:leading-relaxed prose-p:text-lg max-w-none">
                  <p>{lessonContent.explanation}</p>
                </div>
              </section>

              <hr className="border-hairline" />

              {/* Quiz Section */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-2xl font-bold font-display text-high">Knowledge Check</h2>
                  <span className="px-2 py-1 text-xs font-semibold bg-surface border border-hairline text-muted rounded-md">
                    {lessonContent.quiz.length} Questions
                  </span>
                </div>

                <div className="space-y-8">
                  {lessonContent.quiz.map((q, qIdx) => {
                    const hasAnswered = showFeedback[qIdx];
                    const selectedIdx = selectedAnswers[qIdx];
                    const isCorrect = selectedIdx === q.correctIndex;

                    return (
                      <div key={qIdx} className="bg-surface/50 border border-hairline rounded-2xl p-6 md:p-8 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4 mb-6">
                          <h3 className="text-lg font-medium text-high"><span className="text-primary mr-1">Q{qIdx + 1}.</span> {q.question}</h3>
                          <button 
                            onClick={() => toggleSpeech(`q-${qIdx}`, q.question)}
                            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                              playingId === `q-${qIdx}` ? "bg-primary text-background animate-pulse" : "bg-surface border border-hairline text-muted hover:text-primary hover:border-primary/50"
                            }`}
                            title="Read question aloud"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {playingId === `q-${qIdx}` ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 19h4l5 5V0L9 5H5z" />
                              ) : (
                                <>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </>
                              )}
                            </svg>
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {q.options.map((opt, oIdx) => {
                            let btnStyle = "border-hairline bg-background text-mid hover:border-primary/50 hover:bg-primary/5";
                            
                            if (hasAnswered) {
                              if (oIdx === q.correctIndex) {
                                btnStyle = "border-green-500/50 bg-green-500/10 text-green-400";
                              } else if (oIdx === selectedIdx) {
                                btnStyle = "border-red-500/50 bg-red-500/10 text-red-400";
                              } else {
                                btnStyle = "border-hairline bg-background/50 text-muted opacity-50";
                              }
                            } else if (selectedIdx === oIdx) {
                               btnStyle = "border-primary bg-primary/20 text-high";
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => !hasAnswered && handleOptionSelect(qIdx, oIdx)}
                                disabled={hasAnswered}
                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all text-sm font-medium flex items-center gap-4 ${btnStyle}`}
                              >
                                <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border text-xs ${
                                  hasAnswered && oIdx === q.correctIndex ? "bg-green-500 border-green-500 text-black" :
                                  hasAnswered && oIdx === selectedIdx ? "bg-red-500 border-red-500 text-black" :
                                  "border-current"
                                }`}>
                                  {hasAnswered && oIdx === q.correctIndex ? "✓" : 
                                   hasAnswered && oIdx === selectedIdx ? "✕" : 
                                   String.fromCharCode(65 + oIdx)}
                                </div>
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {/* Feedback Panel */}
                        {hasAnswered && (
                          <div className={`mt-6 p-5 rounded-xl border animate-fade-in ${
                            isCorrect 
                              ? "bg-green-500/10 border-green-500/20" 
                              : "bg-red-500/10 border-red-500/20"
                          }`}>
                            <p className={`text-sm font-semibold mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                              {isCorrect ? "Correct!" : "Not quite."}
                            </p>
                            <p className="text-sm text-mid leading-relaxed">
                              {isCorrect ? q.feedbackCorrect : q.feedbackIncorrect}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Completion Celebration Modal */}
              {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-surface border border-hairline p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
                    {/* Confetti / Star effects */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                    
                    <h2 className="text-3xl font-display font-bold text-high mb-2 relative z-10">Module Complete! 🥳</h2>
                    <p className="text-sm text-muted mb-8 relative z-10">You've mastered this concept.</p>
                    
                    <div className="flex justify-center gap-2 mb-6 relative z-10">
                      {[1, 2, 3].map(star => (
                        <svg key={star} className={`w-10 h-10 transition-all transform ${star <= earnedStats.stars ? 'text-primary scale-110' : 'text-surface-light opacity-30 grayscale'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <div className="bg-background/50 rounded-xl p-4 mb-8 border border-hairline inline-block relative z-10">
                      <p className="text-xs text-muted uppercase tracking-wider font-bold mb-1">XP Earned</p>
                      <p className="text-2xl font-black text-primary">+{earnedStats.xp}</p>
                    </div>

                    <Link 
                      href="/path"
                      className="block w-full py-4 bg-primary text-background text-sm font-bold rounded-full shadow-[0_0_20px_rgba(242,169,59,0.3)] hover:shadow-[0_0_30px_rgba(242,169,59,0.5)] hover:scale-105 transition-all relative z-10"
                    >
                      Return to Path →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
