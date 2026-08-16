"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/actions";

export interface UserProfile {
  id: string;
  name: string;
  current_career: string | null;
  total_xp: number | null;
  current_level: number | null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [liveStats, setLiveStats] = useState({ totalXp: 0, currentLevel: 1 });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const supabaseClient = createClient();
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as UserProfile);
        setLiveStats({ totalXp: profileData.total_xp || 0, currentLevel: profileData.current_level || 1 });
      } else {
        // Automatically create a profile for OAuth users
        const username = user.email ? user.email.split('@')[0] : "Learner";
        const { data: newProfile } = await supabase.from('profiles').insert({
          id: user.id,
          name: username,
          current_career: "Setting up...",
          total_xp: 0,
          current_level: 1
        }).select().single();
        
        if (newProfile) {
          setProfile(newProfile as UserProfile);
          setLiveStats({ totalXp: 0, currentLevel: 1 });
          router.push("/onboarding");
        }
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: "My Path", href: "/path", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
    { name: "Career Market", href: "/market", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> },
    { name: "Profile", href: "/profile", icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
  ];

  return (
    <div className="flex h-screen bg-surface overflow-hidden relative">
      
      {/* Sidebar Navigation - Clean, Solid Design */}
      <aside className="w-64 border-r border-hairline bg-white hidden md:flex flex-col z-10">
        
        <div className="p-6 border-b border-hairline flex items-center gap-0">
           <Image src="/logo.png" alt="SkillioPath Logo" width={50} height={50} className="w-15 h-15 object-contain drop-shadow-sm" />
           <h2 className="text-xl font-display font-bold text-high tracking-tight">SkillioPath</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-mid hover:bg-surface hover:text-high'
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'text-primary scale-110' : 'text-muted group-hover:text-high'}`}>
                  {item.icon}
                </div>
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {profile && (
          <div className="p-5 border-t border-hairline mt-auto bg-base">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {profile.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-high truncate">{profile.name}</p>
                <p className="text-xs text-primary font-bold">Level {liveStats.currentLevel}</p>
              </div>
            </div>
            
            <div>
              <div className="w-full bg-surface rounded-full h-2 border border-hairline overflow-hidden">
                 <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${(liveStats.totalXp % 100)}%` }}></div>
              </div>
              <p className="text-[11px] text-right mt-1.5 text-mid font-semibold">{liveStats.totalXp} XP Total</p>
            </div>
            
            <form action={logout} className="mt-5">
              <button className="w-full py-2.5 text-sm font-bold text-muted hover:text-red-600 bg-surface hover:bg-red-50 rounded-xl transition-all duration-200 border border-hairline hover:border-red-200">
                Log out
              </button>
            </form>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-base relative z-10 custom-scrollbar">
        {/* Mobile Header */}
        <div className="md:hidden border-b border-hairline bg-white p-4 sticky top-0 z-20 flex justify-between items-center">
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
