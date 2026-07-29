"use client";

import { useEffect, useState } from "react";
import { LearnerProfile } from "@/services/ai/client";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1, totalStars: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfileStr = sessionStorage.getItem("skilliopath_profile");
    if (savedProfileStr) {
      const parsedProfile = JSON.parse(savedProfileStr) as LearnerProfile;
      setProfile(parsedProfile);
      
      Promise.all([
        supabase.from('profiles').select('total_xp, current_level').eq('id', parsedProfile.id).single(),
        supabase.from('user_progress').select('stars_earned').eq('profile_id', parsedProfile.id)
      ]).then(([profileData, progressData]) => {
         const xp = profileData.data?.total_xp || 0;
         const level = profileData.data?.current_level || 1;
         const stars = progressData.data?.reduce((acc, curr) => acc + (curr.stars_earned || 0), 0) || 0;
         
         setLiveStats({ totalXp: xp, currentLevel: level, totalStars: stars });
         setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-primary/50"></div></div>;
  }

  if (!profile) return null;

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto pb-32 animate-fade-in">
       <h1 className="text-3xl font-display font-bold text-high mb-8">Your Profile</h1>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className="md:col-span-2 bg-surface/50 border border-hairline p-8 rounded-3xl backdrop-blur-md">
             <div className="flex items-center gap-6 mb-8 border-b border-hairline pb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-background font-bold text-4xl shadow-xl shadow-primary/20">
                   {profile.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-high">{profile.name}</h2>
                   <p className="text-muted">{profile.currentCareer}</p>
                </div>
             </div>

             <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Ultimate Goal</p>
                <p className="text-xl text-high font-medium mb-8">Master <span className="text-gold-gradient">{profile.skillToLearn}</span></p>

                <p className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Skill Gaps to Close</p>
                <ul className="space-y-3">
                  {profile.skillGaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-base text-high">{gap}</span>
                    </li>
                  ))}
                </ul>
             </div>
          </div>

          {/* Stats Column */}
          <div className="space-y-6">
             <div className="bg-surface/50 border border-primary/30 p-6 rounded-3xl text-center relative overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(242,169,59,0.05)]">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
                   <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Current Level</p>
                <p className="text-5xl font-black text-primary mb-1">{liveStats.currentLevel}</p>
                <p className="text-sm text-muted">{liveStats.totalXp} Total XP</p>
             </div>

             <div className="bg-surface/50 border border-hairline p-6 rounded-3xl text-center relative overflow-hidden backdrop-blur-md">
                <div className="flex justify-center gap-1 mb-3">
                   {[1, 2, 3].map(star => (
                      <svg key={star} className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                   ))}
                </div>
                <p className="text-4xl font-black text-high mb-1">{liveStats.totalStars}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Mastery Stars</p>
             </div>
          </div>
       </div>
    </div>
  );
}
