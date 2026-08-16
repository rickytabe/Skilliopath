import React from "react";
import { Shield, Cog, GraduationCap, Gem, Sparkles, Crown } from "lucide-react";

export type TierInfo = {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgClass: string;
};

export function getLevelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.floor((1 + Math.sqrt(1 + 0.08 * totalXp)) / 2);
}

export function getXpForLevel(level: number): number {
  return 100 * level * (level - 1) / 2;
}

export function getLevelProgress(totalXp: number) {
  const currentLevel = getLevelFromXp(totalXp);
  const currentLevelBaseXp = getXpForLevel(currentLevel);
  const nextLevelBaseXp = getXpForLevel(currentLevel + 1);
  
  const xpIntoLevel = totalXp - currentLevelBaseXp;
  const xpNeededForNext = nextLevelBaseXp - currentLevelBaseXp;
  const xpRemaining = nextLevelBaseXp - totalXp;
  const progressPercentage = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForNext) * 100));

  return {
    currentLevel,
    xpIntoLevel,
    xpNeededForNext,
    xpRemaining,
    progressPercentage
  };
}

export function getTierForLevel(level: number): TierInfo {
  if (level >= 50) return { 
    name: "Grandmaster", 
    icon: <Crown className="w-full h-full" />, 
    color: "text-rose-500 border-rose-500 bg-rose-500/10", bgClass: "bg-rose-500" 
  };
  if (level >= 35) return { 
    name: "Master", 
    icon: <Sparkles className="w-full h-full" />, 
    color: "text-purple-500 border-purple-500 bg-purple-500/10", bgClass: "bg-purple-500" 
  };
  if (level >= 20) return { 
    name: "Expert", 
    icon: <Gem className="w-full h-full" />, 
    color: "text-cyan-500 border-cyan-500 bg-cyan-500/10", bgClass: "bg-cyan-500" 
  };
  if (level >= 10) return { 
    name: "Scholar", 
    icon: <GraduationCap className="w-full h-full" />, 
    color: "text-amber-500 border-amber-500 bg-amber-500/10", bgClass: "bg-amber-500" 
  };
  if (level >= 5)  return { 
    name: "Apprentice", 
    icon: <Cog className="w-full h-full" />, 
    color: "text-slate-400 border-slate-400 bg-slate-400/10", bgClass: "bg-slate-400" 
  };
  return { 
    name: "Novice", 
    icon: <Shield className="w-full h-full" />, 
    color: "text-stone-500 border-stone-500 bg-stone-500/10", bgClass: "bg-stone-500" 
  };
}
