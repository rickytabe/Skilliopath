"use client";

import { useEffect, useState } from "react";
import { Trophy, Globe, Map, MapPin, Medal, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CountryWithFlag, parseCountry } from "@/utils/country";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string | null;
  total_xp: number;
  current_level: number;
  current_career: string;
  country: string | null;
  continent: string | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'global' | 'continent' | 'country'>('global');
  const [hasLocationColumns, setHasLocationColumns] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        let url = `/api/leaderboard?filter=${filterType}`;
        if (filterType === 'continent' && profile?.continent) {
          url += `&value=${encodeURIComponent(profile.continent)}`;
        } else if (filterType === 'country' && profile?.country) {
          url += `&value=${encodeURIComponent(profile.country)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data.leaderboard);
          setHasLocationColumns(data.hasLocationColumns);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (filterType === 'global' || profile) {
      fetchLeaderboard();
    }
  }, [filterType, profile]);

  const getRankBadge = (index: number) => {
    if (index === 0) return <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold shadow-sm border border-yellow-200"><Medal className="w-4 h-4" /></div>;
    if (index === 1) return <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold shadow-sm border border-slate-200"><Medal className="w-4 h-4" /></div>;
    if (index === 2) return <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-sm border border-orange-200"><Medal className="w-4 h-4" /></div>;
    return <div className="w-8 h-8 flex items-center justify-center font-bold text-muted">#{index + 1}</div>;
  };

  return (
    <main className="min-h-screen bg-background px-4 sm:px-6 pt-24 pb-32 overflow-x-hidden">
      <div className="mx-auto max-w-5xl">
        
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-bold font-display text-high mb-4 flex items-center gap-4">
            <Trophy className="w-10 h-10 text-primary" />
            Global Leaderboard
          </h1>
          <p className="text-mid text-lg max-w-2xl">
            See how you stack up against learners worldwide. Earn XP by completing modules and generating new learning paths.
          </p>
        </div>

        {!hasLocationColumns && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <h4 className="font-bold mb-1">Database Update Required</h4>
              <p className="text-sm opacity-90">
                To use country and continent filters, please run the SQL script to add <code>country</code> and <code>continent</code> columns to your Supabase <code>profiles</code> table.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-hairline rounded-3xl shadow-sm overflow-hidden animate-fade-in-up" style={{animationDelay: '100ms'}}>
          
          <div className="p-4 sm:p-6 border-b border-hairline flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterType('global')}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${filterType === 'global' ? 'bg-primary text-white shadow-md' : 'bg-surface text-mid hover:text-high hover:bg-surface-hover'}`}
            >
              <Globe className="w-4 h-4" /> Global
            </button>
            <button 
              onClick={() => setFilterType('continent')}
              disabled={!hasLocationColumns || (profile && !profile.continent)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!hasLocationColumns || (profile && !profile.continent) ? 'opacity-50 cursor-not-allowed bg-surface text-muted' : filterType === 'continent' ? 'bg-primary text-white shadow-md' : 'bg-surface text-mid hover:text-high hover:bg-surface-hover'}`}
            >
              <Map className="w-4 h-4" /> My Continent {profile?.continent ? `(${profile.continent})` : ''}
            </button>
            <button 
              onClick={() => setFilterType('country')}
              disabled={!hasLocationColumns || (profile && !profile.country)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!hasLocationColumns || (profile && !profile.country) ? 'opacity-50 cursor-not-allowed bg-surface text-muted' : filterType === 'country' ? 'bg-primary text-white shadow-md' : 'bg-surface text-mid hover:text-high hover:bg-surface-hover'}`}
            >
              <MapPin className="w-4 h-4" /> My Country {profile?.country ? `(${parseCountry(profile.country).name})` : ''}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface/50 text-muted text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Learner</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="w-8 h-8 bg-surface rounded-full"></div></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface rounded-full"></div>
                          <div className="h-4 w-24 bg-surface rounded"></div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="h-5 w-16 bg-surface rounded-full"></div></td>
                      <td className="px-6 py-5 text-right"><div className="h-4 w-12 bg-surface rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted font-medium">
                      No learners found for this filter.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((user, index) => (
                    <tr key={user.id} className={`hover:bg-surface/30 transition-colors ${profile?.id === user.id ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRankBadge(index)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full border border-hairline object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-high flex items-center gap-2">
                              {user.name} 
                              {profile?.id === user.id && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wide">You</span>}
                            </div>
                            <div className="text-xs text-muted flex items-center gap-1">
                              {user.country && hasLocationColumns ? (
                                <><MapPin className="w-3 h-3" /> <CountryWithFlag countryStr={user.country} /></>
                              ) : (
                                <>{user.current_career}</>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-surface border border-hairline text-high">
                          Lvl {user.current_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold font-display text-primary">
                        {user.total_xp.toLocaleString()} XP
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </main>
  );
}
