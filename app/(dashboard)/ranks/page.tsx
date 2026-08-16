"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Cog, GraduationCap, Gem, Sparkles, Crown } from "lucide-react";
import { getTierForLevel } from "@/utils/xp";

export default function RanksPage() {
  // Generate the first 50 levels dynamically
  const levels = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    const xpRequired = ((Math.pow(2 * level - 1, 2) - 1) / 0.08);
    const tier = getTierForLevel(level);
    return { level, xpRequired, tier };
  });

  // Group levels by tier
  const tiers = [
    { name: "Novice", icon: <Shield className="w-full h-full" />, start: 1, end: 4, desc: "Just starting out on your learning journey." },
    { name: "Apprentice", icon: <Cog className="w-full h-full" />, start: 5, end: 9, desc: "Building fundamental skills and consistency." },
    { name: "Scholar", icon: <GraduationCap className="w-full h-full" />, start: 10, end: 19, desc: "Demonstrating serious dedication to learning." },
    { name: "Expert", icon: <Gem className="w-full h-full" />, start: 20, end: 34, desc: "Mastering complex concepts with high proficiency." },
    { name: "Master", icon: <Sparkles className="w-full h-full" />, start: 35, end: 49, desc: "Among the elite learners on the platform." },
    { name: "Grandmaster", icon: <Crown className="w-full h-full" />, start: 50, end: 50, desc: "The absolute pinnacle of achievement." },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto pb-32 animate-fade-in">
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-muted hover:text-high transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-high mb-4">Rank & Level System</h1>
        <p className="text-mid text-lg max-w-3xl">
          SkillioPath uses a progressive leveling system. Every lesson you complete earns you XP (Experience Points). 
          As you gain more XP, it requires progressively more effort to reach the next level. Complete lessons flawlessly to earn bonus XP and rank up faster!
        </p>
      </div>

      <div className="space-y-12">
        {tiers.map((tierGroup) => {
          const tierLevels = levels.filter(l => l.level >= tierGroup.start && l.level <= tierGroup.end);
          const baseTier = getTierForLevel(tierGroup.start);
          
          return (
            <div key={tierGroup.name} className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-sm">
              <div className={`p-6 border-b border-hairline flex items-center gap-4 bg-surface/30`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${baseTier.color.split(' ')[2]} ${baseTier.color.split(' ')[0]}`}>
                  <div className="w-8 h-8 flex items-center justify-center">
                    {tierGroup.icon}
                  </div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${baseTier.color.split(' ')[0]}`}>{tierGroup.name}</h2>
                  <p className="text-mid font-medium">{tierGroup.desc}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface text-muted text-sm border-b border-hairline">
                      <th className="py-4 px-6 font-semibold w-1/3">Level</th>
                      <th className="py-4 px-6 font-semibold w-1/3">Total XP Required</th>
                      <th className="py-4 px-6 font-semibold w-1/3">XP to Next Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {tierLevels.map((l, idx) => {
                      const nextLevelXp = l.level < 50 
                        ? ((Math.pow(2 * (l.level + 1) - 1, 2) - 1) / 0.08) - l.xpRequired
                        : "MAX LEVEL";
                        
                      return (
                        <tr key={l.level} className="hover:bg-surface/50 transition-colors">
                          <td className="py-4 px-6 font-bold text-high">
                            Level {l.level}
                          </td>
                          <td className="py-4 px-6 text-mid font-medium">
                            {l.xpRequired.toLocaleString()} XP
                          </td>
                          <td className="py-4 px-6 text-muted">
                            {typeof nextLevelXp === "number" ? `+${nextLevelXp.toLocaleString()} XP` : nextLevelXp}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
