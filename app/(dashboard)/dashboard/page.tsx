"use client";

import { useEffect, useState } from "react";
import { LearnerProfile, CurriculumModule } from "@/services/ai/client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalPath, setDeleteModalPath] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const router = useRouter();

  useEffect(() => {
    let parsedProfile: any = null;
    const savedProfileStr = sessionStorage.getItem("skilliopath_profile");
    if (savedProfileStr) {
      parsedProfile = JSON.parse(savedProfileStr);
    } else {
      const identityStr = localStorage.getItem("skilliopath_profile_identity");
      if (identityStr) {
        parsedProfile = JSON.parse(identityStr);
      }
    }

    if (parsedProfile) {
      setProfile(parsedProfile);
      
      const savedCurriculumStr = sessionStorage.getItem("skilliopath_curriculum");
      if (savedCurriculumStr) {
         setModules(JSON.parse(savedCurriculumStr));
      }

      supabase.from('profiles').select('total_xp, current_level').eq('id', parsedProfile.id).single().then(({data}) => {
         if (data) setLiveStats({ totalXp: data.total_xp || 0, currentLevel: data.current_level || 1 });
      });

      supabase.from('learning_paths').select('*').eq('profile_id', parsedProfile.id).order('created_at', { ascending: false }).then(({data}) => {
         if (data) setLearningPaths(data);
      });

      supabase.from('user_progress').select('*').eq('profile_id', parsedProfile.id).order('created_at', { ascending: false }).then(({data}) => {
         if (data && savedCurriculumStr) {
            const allMods: CurriculumModule[] = JSON.parse(savedCurriculumStr);
            const enrichedSessions = data.map(progress => {
               const mod = allMods.find(m => m.id === progress.module_id);
               return { ...progress, module: mod };
            }).filter(s => s.module);
            setPastSessions(enrichedSessions);
         }
         setIsLoading(false);
      });
    } else {
      setIsLoading(false);
      router.push('/onboarding');
    }
  }, [router]);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-primary/50"></div></div>;
  }

  if (!profile) return null;

  const currentModule = modules.find(m => m.status === "current");
  const nextUpModule = currentModule || modules.find(m => m.status === "locked");

  const handleDeletePath = async () => {
    if (!deleteModalPath) return;
    
    try {
      const res = await fetch(`/api/paths/${deleteModalPath.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete failed with status:", res.status, "body:", errorText);
        throw new Error(errorText || "Failed to delete path");
      }
      
      setLearningPaths(prev => prev.filter(p => p.id !== deleteModalPath.id));
      
      // We don't need to touch sessionStorage anymore.
      // If we deleted the active path, we simply update state.
      setModules([]);

      setDeleteModalPath(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error(error);
      alert("Could not delete the course. Please try again.");
    }
  };

  const handleOpenCourse = (path: any) => {
    setIsLoading(true);
    router.push(`/path?id=${path.id}`);
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto pb-32">
       <div className="mb-12 animate-fade-in relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-2xl border border-hairline shadow-sm">
            <div>
              <p className="text-primary font-bold tracking-widest text-xs uppercase mb-2">Overview</p>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-high mb-2">
                Welcome back, <span className="text-primary">{profile.name}</span>!
              </h1>
              <p className="text-muted text-lg">Continue mastering your skills and extending your path.</p>
            </div>
            <Link 
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm group whitespace-nowrap"
            >
              Start New Path
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
       </div>

       {nextUpModule && (
         <div className="mb-16 relative group">
            <div className="absolute -inset-0.5 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-white border border-hairline p-8 sm:p-10 rounded-2xl overflow-hidden shadow-md animate-fade-in-up transition-all hover:border-primary/50">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                  <svg className="w-48 h-48 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
               </div>
               
               <div className="flex items-center gap-3 mb-6 relative z-10">
                 <span className="flex h-2.5 w-2.5 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                 </span>
                 <p className="text-xs font-bold uppercase tracking-widest text-primary">Jump Back In</p>
               </div>
               
               <h2 className="text-2xl sm:text-3xl font-display font-bold text-high mb-3 relative z-10">{nextUpModule.title}</h2>
               <p className="text-mid text-lg max-w-2xl mb-8 leading-relaxed relative z-10">{nextUpModule.angle}</p>
               
               <Link 
                 href={`/lesson/${nextUpModule.id}`} 
                 className="inline-flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm relative z-10"
               >
                 Start Lesson
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
            </div>
         </div>
       )}

       <div className="mb-12">
          <h3 className="text-xl font-bold text-high mb-6 border-b border-hairline pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            My Learning Paths
          </h3>
          
          {learningPaths.length === 0 ? (
             <div className="space-y-8 animate-fade-in-up">
               <div className="bg-white border border-hairline rounded-3xl p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gold-gradient"></div>
                 <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 rotate-3">
                   <svg className="w-10 h-10 -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                 </div>
                 <h4 className="text-2xl font-bold font-display text-high mb-3">Ready to master a new skill?</h4>
                 <p className="text-mid font-medium mb-8 max-w-md mx-auto">Tell our AI exactly what you want to learn, and we'll build a personalized day-by-day roadmap just for you.</p>
                 <Link href="/onboarding" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(242,169,59,0.4)]">
                   Start a Custom Path
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                 </Link>
               </div>
               
               <div>
                  <h4 className="text-sm font-bold text-muted uppercase tracking-wider mb-5 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Trending Skills
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                       { title: "Advanced AI Prompting", icon: "🤖", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
                       { title: "UGC Content Creation", icon: "📸", color: "bg-pink-50 text-pink-600 border-pink-200" },
                       { title: "High-Converting Copywriting", icon: "✍️", color: "bg-amber-50 text-amber-600 border-amber-200" },
                       { title: "React Development", icon: "⚛️", color: "bg-blue-50 text-blue-600 border-blue-200" },
                       { title: "UI/UX Design Masterclass", icon: "🎨", color: "bg-purple-50 text-purple-600 border-purple-200" },
                       { title: "Data Science with Python", icon: "🐍", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
                    ].map((skill, i) => (
                      <Link key={i} href={`/onboarding?skill=${encodeURIComponent(skill.title)}`} className="group flex flex-col justify-between bg-white border border-hairline p-6 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 border ${skill.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                           {skill.icon}
                         </div>
                         <h5 className="font-bold text-lg text-high group-hover:text-primary transition-colors leading-tight mb-2">{skill.title}</h5>
                         <p className="text-sm text-muted font-medium flex items-center gap-1">
                           Start learning <span className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-1 transition-all text-primary">&rarr;</span>
                         </p>
                      </Link>
                    ))}
                  </div>
               </div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {learningPaths.map((path) => (
                  <div key={path.id} className="bg-white border border-hairline p-6 rounded-2xl flex flex-col justify-between hover:border-primary/60 transition-all duration-200 group shadow-sm hover:shadow-md">
                     <div className="cursor-pointer mb-6" onClick={() => handleOpenCourse(path)}>
                        <h4 className="font-bold text-lg text-high mb-2 group-hover:text-primary transition-colors line-clamp-2">{path.skill_to_learn}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Started {new Date(path.created_at).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="flex items-center justify-between pt-4 border-t border-hairline">
                        <button 
                           onClick={() => handleOpenCourse(path)}
                           className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                           Continue <span aria-hidden="true">&rarr;</span>
                        </button>
                        <button 
                           onClick={(e) => { e.stopPropagation(); setDeleteModalPath(path); setDeleteConfirmText(""); }}
                           className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                           title="Delete Course"
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                        </button>
                     </div>
                  </div>
               ))}
            </div>
          )}
       </div>

       <div>
          <h3 className="text-xl font-bold text-high mb-6 border-b border-hairline pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Past Learning Sessions
          </h3>
          
          {pastSessions.length === 0 ? (
            <div className="bg-surface/30 border border-hairline rounded-2xl p-8 text-center">
               <div className="w-16 h-16 rounded-full bg-surface-light/50 mx-auto flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
               </div>
               <p className="text-mid font-medium">No completed sessions yet.</p>
               <p className="text-sm text-muted mt-1">Your history will appear here once you finish a module.</p>
            </div>
          ) : (
            <div className="space-y-4">
               {pastSessions.map((session, idx) => (
                  <div key={idx} className="bg-white border border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
                     <div>
                        <h4 className="font-bold text-high mb-1">{session.module.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted font-medium">
                           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                           Completed {new Date(session.created_at).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex gap-1">
                           {[1, 2, 3].map(star => (
                              <svg key={star} className={`w-5 h-5 ${star <= session.stars_earned ? 'text-primary' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                           ))}
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border border-primary/20">
                           +{session.xp_earned} XP
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          )}
       </div>

       {deleteModalPath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
             <div className="bg-surface border border-hairline rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
                <h3 className="text-xl font-bold text-high mb-4">Delete Course</h3>
                <p className="text-mid mb-6">
                   This action cannot be undone. This will permanently delete your progress and curriculum for <strong className="text-high">{deleteModalPath.skill_to_learn}</strong>.
                </p>
                <div className="mb-6">
                   <label className="block text-sm font-medium text-muted mb-2">
                      Please type <strong>{deleteModalPath.skill_to_learn}</strong> to confirm.
                   </label>
                   <input 
                      type="text" 
                      value={deleteConfirmText}
                      onChange={e => setDeleteConfirmText(e.target.value)}
                      className="w-full bg-surface-light border border-hairline rounded-lg px-4 py-2 text-high focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      placeholder={deleteModalPath.skill_to_learn}
                   />
                </div>
                <div className="flex justify-end gap-3">
                   <button 
                      onClick={() => { setDeleteModalPath(null); setDeleteConfirmText(""); }}
                      className="px-5 py-2 rounded-lg font-bold text-muted hover:bg-surface-light hover:text-high transition-colors"
                   >
                      Cancel
                   </button>
                   <button 
                      disabled={deleteConfirmText !== deleteModalPath.skill_to_learn}
                      onClick={handleDeletePath}
                      className="px-5 py-2 rounded-lg font-bold bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                   >
                      Delete Forever
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}
