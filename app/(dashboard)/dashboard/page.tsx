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
      
      // If we deleted the active path, clear it from session storage
      const profileStr = sessionStorage.getItem("skilliopath_profile");
      if (profileStr) {
         const profile = JSON.parse(profileStr);
         // The active profile might have pathId set from diagnostic
         if (profile.pathId === deleteModalPath.id || profile.skillToLearn === deleteModalPath.skill_to_learn) {
             sessionStorage.removeItem("skilliopath_curriculum");
             // Also optionally remove the profile so the app knows there's no active path
             sessionStorage.removeItem("skilliopath_profile");
             setModules([]);
             setProfile(null as any); // We'll let the user see an empty state or we can redirect
         }
      }

      setDeleteModalPath(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error(error);
      alert("Could not delete the course. Please try again.");
    }
  };

  const handleOpenCourse = async (path: any) => {
    setIsLoading(true);
    try {
      const { data: modulesData } = await supabase
        .from('curriculum_modules')
        .select('*')
        .eq('path_id', path.id)
        .order('order_index', { ascending: true });
        
      if (modulesData) {
        sessionStorage.setItem("skilliopath_curriculum", JSON.stringify(modulesData));
        
        const profileStr = sessionStorage.getItem("skilliopath_profile");
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          profile.skillToLearn = path.skill_to_learn;
          profile.skillGaps = path.skill_gaps || [];
          sessionStorage.setItem("skilliopath_profile", JSON.stringify(profile));
        }
        
        router.push("/path");
      }
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto pb-32">
       <div className="mb-10 animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-high mb-2">Welcome back, {profile.name}!</h1>
            <p className="text-muted text-lg">Continue mastering your skills.</p>
          </div>
          <Link 
            href="/onboarding"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface/50 border border-primary text-primary font-bold rounded-full hover:bg-primary/10 transition-all shadow-[0_0_15px_rgba(242,169,59,0.1)]"
          >
            Start a New Skill
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </Link>
       </div>

       {nextUpModule && (
         <div className="mb-12 bg-surface/50 border border-primary/30 p-6 sm:p-8 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-[0_0_40px_rgba(242,169,59,0.05)] animate-fade-in-up">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg className="w-32 h-32 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
            </div>
            
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Jump Back In</p>
            <h2 className="text-2xl font-bold text-high mb-3">{nextUpModule.title}</h2>
            <p className="text-mid max-w-xl mb-8 leading-relaxed">{nextUpModule.angle}</p>
            
            <Link 
              href={`/lesson/${nextUpModule.id}`} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background font-bold rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(242,169,59,0.3)]"
            >
              Start Lesson
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
         </div>
       )}

       <div className="mb-12">
          <h3 className="text-xl font-bold text-high mb-6 border-b border-hairline pb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            My Learning Paths
          </h3>
          
          {learningPaths.length === 0 ? (
            <div className="bg-surface/30 border border-hairline rounded-2xl p-8 text-center">
               <p className="text-mid font-medium">You haven't started any courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {learningPaths.map((path) => (
                  <div key={path.id} className="bg-surface/50 border border-hairline p-5 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors group">
                     <div className="cursor-pointer" onClick={() => handleOpenCourse(path)}>
                        <h4 className="font-bold text-lg text-high mb-2 group-hover:text-primary transition-colors">{path.skill_to_learn}</h4>
                        <p className="text-xs text-muted mb-4">Started on {new Date(path.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center justify-between">
                        <button 
                           onClick={() => handleOpenCourse(path)}
                           className="text-sm font-semibold text-primary hover:text-primary/80"
                        >
                           Continue Learning →
                        </button>
                        <button 
                           onClick={(e) => { e.stopPropagation(); setDeleteModalPath(path); setDeleteConfirmText(""); }}
                           className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                           title="Delete Course"
                        >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  <div key={idx} className="bg-surface/50 border border-hairline p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                     <div>
                        <h4 className="font-bold text-high mb-1">{session.module.title}</h4>
                        <p className="text-xs text-muted">Completed on {new Date(session.created_at).toLocaleDateString()}</p>
                     </div>
                     <div className="flex items-center gap-6">
                        <div className="flex gap-1">
                           {[1, 2, 3].map(star => (
                              <svg key={star} className={`w-5 h-5 ${star <= session.stars_earned ? 'text-primary' : 'text-surface-light opacity-30 grayscale'}`} fill="currentColor" viewBox="0 0 20 20">
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                           ))}
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
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
