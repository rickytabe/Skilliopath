"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUGGESTED_CAREERS = [
  "Marketing",
  "Software Engineering",
  "Data Science",
  "Product Management",
  "Design",
  "Sales",
  "Entrepreneurship",
  "Undecided",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(true);
  const [savedProfile, setSavedProfile] = useState<{ id: string; name: string; current_career: string } | null>(null);
  
  const [name, setName] = useState("");
  const [currentCareer, setCurrentCareer] = useState("");
  const [skillToLearn, setSkillToLearn] = useState("");
  const [currentLevel, setCurrentLevel] = useState("Beginner");
  const [timeline, setTimeline] = useState("1 month");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("skilliopath_profile_identity");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id && parsed.name && parsed.current_career) {
          setSavedProfile(parsed);
          setName(parsed.name);
          setCurrentCareer(parsed.current_career);
        }
      } catch (e) {}
    }
    setIsInitializing(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillToLearn.trim()) return;
    if (!savedProfile && (!name.trim() || !currentCareer.trim())) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      let profileId = savedProfile?.id;
      let finalName = name;
      let finalCareer = currentCareer;

      if (!savedProfile) {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), currentCareer: currentCareer.trim() })
        });
        
        if (!res.ok) throw new Error("Failed to create profile");
        
        const newProfile = await res.json();
        profileId = newProfile.id;
        finalName = newProfile.name;
        finalCareer = newProfile.current_career;

        const identity = { id: profileId as string, name: finalName, current_career: finalCareer };
        localStorage.setItem("skilliopath_profile_identity", JSON.stringify(identity));
        setSavedProfile(identity);
      }

      sessionStorage.setItem(
        "skilliopath_onboarding",
        JSON.stringify({ 
          profileId,
          name: finalName, 
          currentCareer: finalCareer,
          skillToLearn: skillToLearn.trim(),
          currentLevel,
          timeline
        })
      );

      sessionStorage.removeItem("skilliopath_profile");
      sessionStorage.removeItem("skilliopath_curriculum");

      router.push("/diagnostic");
    } catch (error) {
      setErrorMsg("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isInitializing) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16 bg-grid">
      <div className="w-full max-w-md mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-high transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="rounded-2xl border border-hairline bg-surface/60 p-8 backdrop-blur-sm shadow-2xl shadow-black/40">
          <div className="space-y-2 text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-high">
              {savedProfile ? `Welcome back, ${savedProfile.name}!` : "Design your path"}
            </h1>
            <p className="text-sm text-mid">
              {savedProfile ? "What new skill do you want to master today?" : "Tell us what you want to achieve."}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-500 text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!savedProfile && (
              <>
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-high">
                    First name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-base px-4 py-3 text-high placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. Tabe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="career" className="block text-sm font-medium text-high">
                    Current career or field of study
                  </label>
                  <input
                    id="career"
                    type="text"
                    required
                    value={currentCareer}
                    onChange={(e) => setCurrentCareer(e.target.value)}
                    className="w-full rounded-lg border border-hairline bg-base px-4 py-3 text-high placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="e.g. Marketing Student"
                    list="careers"
                  />
                  <datalist id="careers">
                    {SUGGESTED_CAREERS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label htmlFor="skill" className="block text-sm font-medium text-high">
                What exact skill do you want to master?
              </label>
              <input
                id="skill"
                type="text"
                required
                autoFocus={!!savedProfile}
                value={skillToLearn}
                onChange={(e) => setSkillToLearn(e.target.value)}
                className="w-full rounded-lg border border-hairline bg-base px-4 py-3 text-high placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="e.g. Data Analytics, Python, Prompt Engineering"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="level" className="block text-sm font-medium text-high">
                  Current Level
                </label>
                <select
                  id="level"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-base px-4 py-3 text-high focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="timeline" className="block text-sm font-medium text-high">
                  Timeline
                </label>
                <select
                  id="timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="w-full rounded-lg border border-hairline bg-base px-4 py-3 text-high focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors appearance-none"
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !skillToLearn.trim() || (!savedProfile && (!name.trim() || !currentCareer.trim()))}
              className="w-full rounded-lg bg-primary px-4 py-3 mt-4 font-semibold text-white shadow-sm transition-all hover:bg-glow disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base"
            >
              {isSubmitting ? "Starting..." : "Start diagnostic"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Your profile is saved so you can learn new skills later without re-entering your details.
        </p>
      </div>
    </main>
  );
}
