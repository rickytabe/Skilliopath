# SkilioPath — Build Spec for AI Coding Agent

> **Read this whole file before writing any code.** This is the single source of truth for the 24-hour build. Do not deviate from the design tokens or information architecture below without flagging the change. If context gets truncated mid-session, re-read this file before continuing.

---

## 0. Project Context (keep this loaded at all times)

- **Product:** SkilioPath — an AI learning companion that diagnoses a learner's digital-skill gaps and generates a personalized micro-curriculum, delivered through an AI tutor.
- **Persona (only build for this one):** A final-year university student prepping for the job market. They know digital skills matter but existing courses feel generic and disconnected from their field of study.
- **Constraint:** 24-hour hackathon build. One flawless flow beats five half-built features.
- **The ONE flow that must work end-to-end:** Onboarding → AI Diagnostic Chat → Generated Curriculum Path → One Interactive Lesson → Quiz + Feedback.
- **Everything else is out of scope for v1.** Do not build: real auth, a database, a course catalog, multi-skill libraries, account settings, payment. If asked to add scope, push back and point here.

---

## 1. Design System (fixed — do not invent your own palette or default to generic AI-tool UI)

**Do not use:** cream background + serif + terracotta/orange accent (#D97757-ish). Do not use: near-black background + single neon-green/vermilion accent. Do not use: generic SaaS "card grid with rounded shadows" layout, default Tailwind gray/blue palette, or numbered `01 / 02 / 03` markers unless they encode a real sequence (they do here — see Signature Element).

**Concept:** SkilioPath is literally a *path*. The visual language is a trail/route — waypoints, a winding connective line, topographic contour texture — not cards in a grid. This ties the UI directly to the product's name and core metaphor (a personalized route through skills, not a shelf of courses).

### Color tokens
| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#14162B` | App background, deep indigo-navy |
| `--bg-surface` | `#1E2142` | Panels, lesson cards, chat bubbles (AI) |
| `--accent-primary` | `#F2A93B` | Waypoint markers, active states, primary CTA |
| `--accent-secondary` | `#3FA796` | Progress/completion states, success feedback |
| `--text-high` | `#F5F3EE` | Headlines, primary text |
| `--text-muted` | `#9A9CC0` | Secondary text, captions, timestamps |
| `--border-hairline` | `#2E3159` | Dividers, input borders |

### Typography
- **Display:** Space Grotesk (headlines, module titles, the SkilioPath wordmark) — used with restraint, not on every line
- **Body:** Inter (all reading content, chat text, lesson explanations)
- **Utility/data:** IBM Plex Mono (quiz option labels, skill tags, progress percentages — anything that reads as "system output")

### Signature element
The **trail path**: an SVG winding line (not a straight vertical list) connecting curriculum waypoints on the "Your Path" screen. Each module is a waypoint node on the trail — completed nodes filled in `--accent-secondary`, current node pulses `--accent-primary`, locked nodes outlined in `--border-hairline`. This is the one place to spend visual boldness. Everything else (chat UI, lesson content, quiz) stays quiet and disciplined.

### Motion
One deliberate moment: when the curriculum generates, the trail draws itself in (path animates from start to end, waypoints fade in sequentially). No other decorative animation. Respect `prefers-reduced-motion`.

### Interaction floor (non-negotiable even under time pressure)
- Responsive down to mobile width
- Visible keyboard focus states on all interactive elements
- Loading states for every AI call (never a frozen screen) — use a short, specific message ("Reading your answers…", "Building your path…"), not a generic spinner with no text

---

## 2. Information Architecture

```
/                    → Landing (one CTA: "Find your path")
/onboarding          → Name + field of study/career goal (2 fields only)
/diagnostic          → AI chat, 2-3 exchanges, ends with structured profile
/path                → Generated curriculum shown as trail with waypoints
/lesson/[moduleId]   → AI explanation (context-tailored) + follow-up chat + quiz
/complete            → Quiz feedback + "next module" prompt (do not build a full progress dashboard — one summary state is enough)
```

Five screens. Nothing else. If you find yourself building a sixth screen, stop and check this doc.

---

## 3. Data Contracts (implement these types first, before any UI)

```typescript
interface LearnerProfile {
  name: string;
  fieldOrGoal: string;       // e.g. "Marketing", "Computer Science", "Undecided"
  skillGaps: string[];       // extracted by AI from diagnostic chat
  tone: string;              // e.g. "encouraging, practical" — informs lesson generation prompt
}

interface CurriculumModule {
  id: string;
  title: string;             // plain language, e.g. "AI Tools You'll Actually Use in Marketing"
  angle: string;             // the framing/analogy domain for this learner
  order: number;
  status: "locked" | "current" | "complete";
}

interface LessonContent {
  moduleId: string;
  explanation: string;       // AI-generated, tailored to fieldOrGoal
  quiz: QuizItem[];
}

interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}
```

---

## 4. AI Call Contracts (structured JSON in/out — build these as isolated, testable functions before wiring UI)

### Call 1 — Diagnostic
**Input:** conversation history + `fieldOrGoal`
**Output:** `LearnerProfile` (JSON only, no prose wrapper)
**Prompt must instruct the model to:** ask one question at a time, keep it to 2-3 exchanges max, then emit the profile JSON as the final message.

### Call 2 — Curriculum Generation
**Input:** `LearnerProfile`
**Output:** array of 3-4 `CurriculumModule` (JSON only)
**Prompt must instruct the model to:** order modules foundational → applied, keep titles in plain language, no generic course-catalog phrasing ("Introduction to...", "Module 1:").

### Call 3 — Lesson Generation
**Input:** one `CurriculumModule` + `LearnerProfile`
**Output:** `LessonContent` (JSON only)
**Prompt must instruct the model to:** explain the concept using an analogy drawn specifically from `fieldOrGoal`, keep explanation under 150 words, generate 2 quiz questions with specific (not generic "good job") feedback strings.

**Build note for the agent:** write these three as pure functions with typed input/output first, test them standalone with a hardcoded profile, THEN build the UI that calls them. Do not build UI and AI calls simultaneously — you will lose time debugging both at once.

---

## 5. Build Order (follow this sequence — each step should be a working checkpoint)

1. Scaffold Next.js app, install Tailwind, set up design tokens as CSS variables from Section 1
2. Build the three AI call functions (Section 4), test each standalone with hardcoded input via console/script — confirm valid JSON output before touching UI
3. Build `/onboarding` (2 fields, no validation complexity)
4. Build `/diagnostic` chat UI, wire to Call 1
5. Build `/path` trail visualization, wire to Call 2 — this is your signature visual, budget real time here
6. Build `/lesson/[moduleId]`, wire to Call 3 (explanation + chat follow-up + quiz)
7. Build `/complete` summary state
8. Wire landing page last — it's the least functionally risky, don't front-load time here
9. Do a full run-through, time it, cut anything that pushes past 2 minutes (see demo script below)
10. Pre-seed one cached full run (profile → curriculum → lesson → quiz) as a fallback in case live AI calls lag during the actual demo

---

## 6. Copy Guidelines (for any UI text the agent writes)

- Write from the learner's side: "See your path," not "Generate curriculum"
- Active voice, plain verbs, sentence case, no filler
- Loading states name what's happening: "Building your path…" not "Loading…"
- Errors say what happened and what to do, no apology tone: "That didn't generate — try again" not "Oops! Something went wrong :("
- Quiz feedback is specific to the answer given, never generic "Correct!" / "Try again" only

---

## 7. 2-Minute Demo Script (build toward this, not beyond it)

| Time | Screen | Notes |
|---|---|---|
| 0:00–0:15 | Landing → problem stated verbally | — |
| 0:15–0:40 | Onboarding + diagnostic (2 quick exchanges) | Live |
| 0:40–1:00 | Path screen — trail animates in | Live, this is the visual wow moment |
| 1:00–1:40 | Open one lesson, show tailored explanation, ask one follow-up | Live — this is the money moment |
| 1:40–1:55 | Quiz question → instant feedback | Live or pre-seeded if time is tight |
| 1:55–2:00 | Close: business model + vision, one breath | — |

Do not demo: progress dashboard, settings, multi-module browsing. Have the cached fallback run ready in case live calls lag.

---

## 8. Explicit Non-Goals (say no to these even if suggested mid-build)

- Real authentication / user accounts
- Database persistence beyond session state
- Multiple skill tracks or a course catalog
- Payment/subscription UI
- Settings or profile editing screens
- Generic dashboard-with-sidebar layout — this is a focused 5-screen flow, not an admin panel

## 9. Business Model (for the pitch, not the build)

Primary: Freemium + subscription. Scale story: B2B2C via universities/student communities (e.g. GDGOC-style networks) for cohort access.