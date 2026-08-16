"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getLevelProgress, getTierForLevel } from "@/utils/xp";
import { toast } from "sonner";
import Link from "next/link";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  currentCareer: string | null;
  totalXp: number;
  currentLevel: number;
  createdAt: string;
  totalStars: number;
  completedModules: number;
  totalModules: number;
  learningPaths: { id: string; skill: string; createdAt: string; moduleCount: number }[];
}

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCareer, setEditCareer] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileData) return;

        // Fetch all learning paths with module counts
        const { data: pathsData } = await supabase
          .from("learning_paths")
          .select("id, skill_to_learn, created_at")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        const enrichedPaths = [];
        if (pathsData) {
          for (const path of pathsData) {
            const { count } = await supabase
              .from("curriculum_modules")
              .select("*", { count: "exact", head: true })
              .eq("path_id", path.id);
            enrichedPaths.push({
              id: path.id,
              skill: path.skill_to_learn,
              createdAt: path.created_at,
              moduleCount: count || 0,
            });
          }
        }

        // Fetch progress stats
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("stars_earned, xp_earned")
          .eq("profile_id", user.id);

        const totalStars = progressData?.reduce((acc, curr) => acc + (curr.stars_earned || 0), 0) || 0;
        const completedModules = progressData?.length || 0;

        // Total modules across all paths
        let totalModules = 0;
        if (pathsData) {
          for (const path of pathsData) {
            const { count } = await supabase
              .from("curriculum_modules")
              .select("*", { count: "exact", head: true })
              .eq("path_id", path.id);
            totalModules += count || 0;
          }
        }

        setProfile({
          id: user.id,
          name: profileData.name || "Learner",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || null,
          currentCareer: profileData.current_career,
          totalXp: profileData.total_xp || 0,
          currentLevel: profileData.current_level || 1,
          createdAt: profileData.created_at,
          totalStars,
          completedModules,
          totalModules,
          learningPaths: enrichedPaths,
        });

        setEditName(profileData.name || "");
        setEditCareer(profileData.current_career || "");
        setEditAvatarUrl(user.user_metadata?.avatar_url || null);
      } catch (err) {
        console.error("Error loading profile:", err);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/webp', 0.8);
        setEditAvatarUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile) return;
    if (!editName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: editName.trim(),
          current_career: editCareer.trim() || null,
        })
        .eq("id", profile.id);

      if (error) throw error;

      if (editAvatarUrl !== profile.avatarUrl) {
        await supabase.auth.updateUser({
          data: { avatar_url: editAvatarUrl }
        });
      }

      setProfile((prev) =>
        prev ? { ...prev, name: editName.trim(), currentCareer: editCareer.trim() || null, avatarUrl: editAvatarUrl } : prev
      );
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditCareer(profile.currentCareer || "");
    setEditAvatarUrl(profile.avatarUrl);
    setIsEditing(false);
  };

  const memberSince = profile ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";
  
  const xpStats = profile ? getLevelProgress(profile.totalXp) : { currentLevel: 1, xpNeededForNext: 100, xpRemaining: 100, progressPercentage: 0 };
  const tier = profile ? getTierForLevel(xpStats.currentLevel) : getTierForLevel(1);

  const completionRate = profile && profile.totalModules > 0 ? Math.round((profile.completedModules / profile.totalModules) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-6 sm:p-10 max-w-5xl mx-auto pb-32 animate-fade-in">
        <div className="h-8 w-40 bg-surface rounded-xl shimmer mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-hairline p-8 rounded-3xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-surface shimmer" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-surface rounded-xl shimmer" />
                  <div className="h-4 w-28 bg-surface rounded-lg shimmer" />
                  <div className="h-3 w-36 bg-surface rounded-lg shimmer" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-hairline p-6 rounded-3xl">
              <div className="h-5 w-32 bg-surface rounded-lg shimmer mb-6" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 bg-surface rounded-2xl shimmer" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-hairline p-6 rounded-3xl">
                <div className="h-4 w-20 mx-auto bg-surface rounded-full shimmer mb-4" />
                <div className="h-12 w-16 mx-auto bg-surface rounded-xl shimmer mb-2" />
                <div className="h-3 w-24 mx-auto bg-surface rounded-full shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto pb-32 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-high">Your Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-semibold text-muted bg-surface border border-hairline rounded-xl hover:bg-surface/80 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-hover transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity Card */}
          <div className="bg-white border border-hairline rounded-3xl overflow-hidden shadow-sm">
            {/* Banner */}
            <div className="h-24 bg-gradient-to-r from-primary/80 via-primary to-amber-400 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wOCI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgOHYyaC0ydi0yaDJ6bTAgLTR2MmgtMnYtMmgyek0yMCAzNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            </div>

            <div className="px-8 pb-8 -mt-12 relative z-10">
              <div className="flex items-end gap-5 mb-6">
                {/* Avatar */}
                <div className="relative group">
                  {isEditing ? (
                    <label className="cursor-pointer block relative rounded-full border-4 border-white shadow-lg ring-2 ring-white/50 w-20 h-20 overflow-hidden group">
                      {editAvatarUrl ? (
                        <img
                          src={editAvatarUrl}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold text-3xl">
                          {profile.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover ring-2 ring-white/50"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold text-3xl ring-2 ring-white/50">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )
                  )}
                </div>
                <div className="pb-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-2xl font-bold text-high bg-surface border border-hairline rounded-xl px-3 py-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full max-w-xs"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-high">{profile.name}</h2>
                  )}
                  <p className="text-sm text-muted mt-0.5">Member since {memberSince}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email - Read Only */}
                <div className="bg-surface/50 border border-hairline rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Email</span>
                  </div>
                  <p className="text-sm font-medium text-high truncate">{profile.email}</p>
                </div>

                {/* Career - Editable */}
                <div className="bg-surface/50 border border-hairline rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Current Role</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editCareer}
                      onChange={(e) => setEditCareer(e.target.value)}
                      className="text-sm font-medium text-high bg-white border border-hairline rounded-lg px-2 py-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
                      placeholder="e.g. Student, Developer..."
                    />
                  ) : (
                    <p className="text-sm font-medium text-high">{profile.currentCareer || "Not set"}</p>
                  )}
                </div>

                {/* Account ID - Read Only */}
                <div className="bg-surface/50 border border-hairline rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Account ID</span>
                  </div>
                  <p className="text-xs font-mono text-mid truncate">{profile.id}</p>
                </div>

                {/* Auth Provider - Read Only */}
                <div className="bg-surface/50 border border-hairline rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">Auth Provider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <p className="text-sm font-medium text-high">Google</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Paths Section */}
          <div className="bg-white border border-hairline rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-high">Learning Paths</h3>
              <Link
                href="/onboarding"
                className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Path
              </Link>
            </div>

            {profile.learningPaths.length === 0 ? (
              <div className="text-center py-10 text-muted">
                <svg className="w-10 h-10 mx-auto mb-3 text-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-sm">No learning paths yet.</p>
                <Link href="/onboarding" className="text-sm font-bold text-primary mt-2 inline-block hover:underline">Create your first path →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.learningPaths.map((path) => (
                  <Link
                    key={path.id}
                    href={`/path?id=${path.id}`}
                    className="group flex items-center justify-between p-4 bg-surface/50 border border-hairline rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-high group-hover:text-primary transition-colors truncate">{path.skill}</p>
                        <p className="text-xs text-muted">{path.moduleCount} modules · Started {new Date(path.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">

          {/* Level Card */}
          <div className="bg-white border border-primary/30 p-6 rounded-3xl text-center relative overflow-hidden shadow-sm">
            <div className={`absolute top-0 right-0 p-4 opacity-10 ${tier.color.split(' ')[0]}`}>
              <div className="w-24 h-24 flex items-center justify-center">{tier.icon}</div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">Rank: {tier.name}</p>
            <p className="text-5xl font-black text-primary mb-1">{xpStats.currentLevel}</p>
            <p className="text-sm text-muted mb-4">{profile.totalXp} Total XP</p>
            <div className="w-full bg-surface rounded-full h-2.5 border border-hairline overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${tier.bgClass}`}
                style={{ width: `${xpStats.progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-muted font-medium mb-4">{xpStats.xpRemaining} XP to Level {xpStats.currentLevel + 1}</p>
            <Link href="/ranks" className="inline-flex items-center justify-center w-full py-2 bg-surface/50 hover:bg-surface border border-hairline hover:border-primary/30 rounded-xl text-sm font-semibold text-mid hover:text-primary transition-colors">
              View Rank Details
            </Link>
          </div>

          {/* Stars Card */}
          <div className="bg-white border border-hairline p-6 rounded-3xl text-center relative overflow-hidden shadow-sm">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3].map((star) => (
                <svg key={star} className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-4xl font-black text-high mb-1">{profile.totalStars}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">Mastery Stars</p>
          </div>

          {/* Progress Card */}
          <div className="bg-white border border-hairline p-6 rounded-3xl text-center shadow-sm">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full text-surface -rotate-90" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" />
              </svg>
              <svg className="absolute inset-0 w-full h-full text-green-500 -rotate-90 transition-all duration-1000" viewBox="0 0 100 100" fill="none">
                <circle
                  cx="50" cy="50" r="42"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * completionRate) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-high">{completionRate}%</span>
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-1">Completion Rate</p>
            <p className="text-sm text-mid font-medium">{profile.completedModules} of {profile.totalModules} modules</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-hairline p-5 rounded-3xl shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Quick Actions</p>
            <div className="space-y-2">
              <Link href="/path" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-high hover:bg-primary/5 hover:text-primary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                Continue Learning
              </Link>
              <Link href="/market" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-high hover:bg-primary/5 hover:text-primary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                Career Market
              </Link>
              <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-high hover:bg-primary/5 hover:text-primary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
