"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnerProfile } from "@/services/ai/client";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1 });

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

    if (parsedProfile && parsedProfile.id) {
      setProfile(parsedProfile);
      supabase.from('profiles').select('total_xp, current_level').eq('id', parsedProfile.id as string).single().then(({data}) => {
         if (data) setLiveStats({ totalXp: data.total_xp || 0, currentLevel: data.current_level || 1 });
      });
    } else {
      router.push("/onboarding");
    }
  }, [router]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: "My Path", href: "/path", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
    { name: "Profile", href: "/profile", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-hairline bg-surface/50 backdrop-blur-md flex flex-col hidden md:flex">
        <div className="p-6 border-b border-hairline flex items-center gap-3">
           <Image src="/logo.png" alt="SkillioPath Logo" width={32} height={32} className="w-8 h-8 object-contain" />
           <h2 className="text-xl font-display font-bold text-high tracking-tight">SkillioPath</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-muted hover:bg-white/5 hover:text-high'
                }`}
              >
                <div className={`${isActive ? 'text-primary' : 'text-muted'}`}>
                  {item.icon}
                </div>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {profile && (
          <div className="p-4 border-t border-hairline bg-surface-light/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-background font-bold text-lg">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-high line-clamp-1">{profile.name}</p>
                <p className="text-xs text-primary font-semibold">Level {liveStats.currentLevel}</p>
              </div>
            </div>
            <div className="w-full bg-background/50 rounded-full h-1.5 mt-2 border border-hairline">
               <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(liveStats.totalXp % 100)}%` }}></div>
            </div>
            <p className="text-[10px] text-right mt-1 text-muted font-medium">{liveStats.totalXp} Total XP</p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-hairline bg-surface/80 backdrop-blur-md p-4 sticky top-0 z-20 flex justify-between items-center">
           <div className="flex items-center gap-2">
             <Image src="/logo.png" alt="SkillioPath Logo" width={24} height={24} className="w-6 h-6 object-contain" />
             <span className="font-bold text-sm">SkillioPath</span>
           </div>
           <div className="flex gap-4 text-muted">
              {navItems.map(item => (
                <Link key={item.name} href={item.href} className={pathname === item.href ? 'text-primary' : ''}>
                  {item.icon}
                </Link>
              ))}
           </div>
        </div>

        {children}
      </main>
    </div>
  );
}
