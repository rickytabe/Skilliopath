"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

function DiagnosticIcon() {
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
  );
}

function LessonIcon() {
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}

const steps = [
  {
    icon: DiagnosticIcon,
    number: "01",
    title: "Quick diagnostic chat",
    description: "A 2-minute AI conversation to understand what you know and what you need.",
  },
  {
    icon: PathIcon,
    number: "02",
    title: "Your personalized path",
    description: "A tailored micro-curriculum ordered from foundational to applied, using your field as context.",
  },
  {
    icon: LessonIcon,
    number: "03",
    title: "Learn in your language",
    description: "AI explains every concept with analogies from your own world — marketing, biology, engineering.",
  },
  {
    icon: QuizIcon,
    number: "04",
    title: "Instant feedback",
    description: "Short quizzes with specific, encouraging feedback — not generic \"correct\" or \"try again\".",
  },
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(!!sessionStorage.getItem("skilliopath_profile"));
    }
  }, []);

  return (
    <>
      {/* ── Nav ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-hairline/60 bg-base/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SkilioPath Logo" width={100} height={100} className="w-20 h-20 object-contain" />
            <span className="text-lg font-bold font-display tracking-tight text-high hidden sm:inline">
              Skillio<span className="text-gold-gradient">Path</span>
            </span>
          </Link>
          <Link
            href={isAuthenticated ? "/dashboard" : "/onboarding"}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base"
          >
            {isAuthenticated ? "Dashboard" : "Get started"}
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-grid pt-16 px-6">
        <div className="hero-glow relative z-10 w-full max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">

            {/* Left — Text */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-4 py-1.5 text-xs font-medium text-mid backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Personalized AI learning
              </div>

              {/* H1 — short, benefit-focused, under 10 words */}
              <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight leading-[1.1] text-high">
                The digital world is moving fast. <br className="hidden xl:block" />
                Don&apos;t get <span className="text-gold-gradient">left behind</span>.
              </h1>

              {/* Subheadline — the problem we solve */}
              <p className="animate-fade-in-up delay-200 max-w-lg text-lg leading-relaxed text-mid mx-auto lg:mx-0">
                Personalized AI-powered learning paths that help you master the right digital skills to grow your career, business, and confidence in today&apos;s digital world.
              </p>

              {/* CTA */}
              <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center lg:items-start gap-4 pt-2">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/onboarding"}
                  className="cta-pulse inline-block rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-glow hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get your free path"}
                </Link>
              </div>
            </div>

            {/* Right — Visual: hero image */}
            <div className="animate-fade-in-up delay-400 hidden lg:flex justify-end">
              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl shadow-primary/20 ring-1 ring-hairline">
                <Image
                  src="/landing-page-assets/heroimage.png"
                  alt="SkillioPath Hero Visual"
                  width={1200}
                  height={1200}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>

          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 animate-bounce text-muted">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Social proof strip ──────────────── */}
      <section className="border-y border-hairline bg-surface/40 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-3 px-6 text-sm text-muted font-mono">
          <span>AI-powered</span>
          <span className="hidden sm:inline text-hairline">|</span>
          <span>Personalized in 2 min</span>
          <span className="hidden sm:inline text-hairline">|</span>
          <span>Field-specific lessons</span>
          <span className="hidden sm:inline text-hairline">|</span>
          <span>Zero generic content</span>
        </div>
      </section>

      {/* ── How it works ────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
            How it works
          </h2>
          <p className="mx-auto max-w-xl text-mid">
            Four steps from &quot;I don&apos;t know where to start&quot; to learning skills that actually matter for your career.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`animate-fade-in-up delay-${(i + 1) * 100} group relative rounded-2xl border border-hairline bg-surface/50 p-6 transition-all hover:border-subtle hover:bg-surface`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon />
                </div>
                <span className="font-mono text-sm text-muted">{step.number}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold font-display text-high">{step.title}</h3>
              <p className="text-sm leading-relaxed text-mid">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Value prop / differentiator ─────── */}
      <section className="border-y border-hairline bg-surface/30 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left — comparison */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
                Not another generic course platform
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 text-xs">✕</span>
                  <p className="text-mid"><span className="text-muted line-through">One-size-fits-all curriculum</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 text-xs">✕</span>
                  <p className="text-mid"><span className="text-muted line-through">Static content built for &quot;everyone&quot;</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 text-xs">✕</span>
                  <p className="text-mid"><span className="text-muted line-through">Generic feedback: &quot;Correct!&quot; / &quot;Try again&quot;</span></p>
                </div>
              </div>
              <div className="h-px bg-hairline" />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">✓</span>
                  <p className="text-high">Curriculum generated around <span className="text-gold-gradient font-semibold">your field</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">✓</span>
                  <p className="text-high">Lessons explained with analogies <span className="text-gold-gradient font-semibold">you already understand</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs">✓</span>
                  <p className="text-high">Feedback that tells you <span className="text-gold-gradient font-semibold">why</span>, not just right or wrong</p>
                </div>
              </div>
            </div>

            {/* Right — example card */}
            <div className="rounded-2xl border border-hairline bg-base p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">A</div>
                <div>
                  <p className="text-sm font-semibold text-high">Alex — Marketing Major</p>
                  <p className="text-xs text-muted font-mono">Skill gap: AI tools for campaigns</p>
                </div>
              </div>
              <div className="rounded-xl bg-surface border border-hairline p-4 space-y-3">
                <p className="text-xs font-mono text-muted uppercase tracking-wider">Generated lesson</p>
                <p className="text-sm text-high leading-relaxed">
                  &quot;Think of a large language model like your best copywriter intern — it&apos;s fast and prolific, but it needs a clear brief. A <span className="text-gold-gradient font-medium">prompt</span> is that brief...&quot;
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-mono text-mid">prompt-engineering</span>
                <span className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-mono text-mid">ai-for-marketing</span>
                <span className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-mono text-mid">content-strategy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="hero-glow mx-auto max-w-3xl px-6 text-center relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-high">
            Your path starts with a{" "}
            <span className="text-gold-gradient">conversation</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-mid">
            Tell us your name and what you study. Our AI does the rest — no sign-up, no credit card, no 40-hour course you&apos;ll never finish.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/onboarding"}
            className="cta-pulse inline-block rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-glow hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base"
          >
            {isAuthenticated ? "Continue your learning path" : "Find your digital skill path"}
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────── */}
      <footer className="border-t border-hairline py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="SkilioPath Logo" width={24} height={24} className="w-6 h-6 object-contain grayscale opacity-70" />
            <span className="font-display font-bold text-high">Skillio<span className="text-gold-gradient">Path</span></span>
          </Link>
          <span>© {new Date().getFullYear()} SkilioPath</span>
        </div>
      </footer>
    </>
  );
}
