# SkilioPath — AI Digital Skills Learning Companion

## 1. Problem

The digital economy evolves faster than traditional education can keep up. New skills (AI tools, prompt engineering, digital marketing, agentic coding) emerge constantly, but most learning platforms are generic, not tailored to the learner's actual context, and static instead of adaptive. Non-technical professionals and students get left behind, not because they lack motivation, but because nothing meets them where they are.

## 2. Audience & Persona

**Primary persona:** A final-year university student prepping for the job market. They know digital skills (AI literacy, prompt engineering, digital marketing) matter for employability, but existing courses feel generic and disconnected from their actual field of study or career goal. They start courses and abandon them halfway.

**Real pain:** "I don't know what's actually relevant to me" and "this content feels built for someone else."

**Secondary persona (stretch/extension):** A small business owner who wants to grow online but has no formal tech background and no time for long generic courses.

## 3. Solution Overview

An AI-powered learning companion that:
1. Diagnoses what the learner already knows and what they need, through a short adaptive conversation (not a static quiz)
2. Generates a personalized micro-curriculum in real time, tailored to their field/career goal
3. Teaches through an AI tutor that explains concepts using analogies from their own world
4. Checks understanding with instant, adaptive feedback

**Why it works:** replaces "one-size-fits-all course" with "a path built around this exact person," and replaces "search and hope" with a guided system.

## 4. End-to-End User Flow

### Step 1 — Landing
Simple, warm landing page. One clear CTA: "Find your digital skill path." Brief explainer of what the tool does (3 short lines, no jargon).

### Step 2 — Onboarding / Lightweight "Auth"
No full account system for the hackathon demo. Capture just enough to personalize:
- Name
- Field of study / career goal (free text or dropdown: e.g. Marketing, Engineering, Biology, Business, Undecided)
- Optional: current comfort level with tech (1–5 slider)

Store this in local/session state — no real backend auth needed for the demo. (Roadmap: real auth via email/Google post-hackathon.)

### Step 3 — AI Diagnostic Conversation
A short, friendly chat (3–5 exchanges) where the AI asks about:
- What they already know or have tried
- What's motivating them (job application, promotion, curiosity)
- Any specific tools/skills they've heard of and want to understand

AI outputs a structured skill profile (JSON): current level, target skills, gaps, tone/context to use in lessons.

### Step 4 — Personalized Micro-Curriculum Generation
Based on the skill profile, AI generates 3–4 short lesson modules, each:
- Titled in plain language (e.g. "AI Tools You'll Actually Use as a Marketing Grad")
- Tailored explanation angle based on their field
- Ordered from foundational → applied

Displayed as a simple path/roadmap UI.

### Step 5 — Interactive Lesson (core demo piece)
Learner opens one lesson:
- AI explains the concept using an analogy from their stated field/interest
- Learner can ask follow-up questions in a chat box
- Short check-for-understanding (2–3 questions) at the end
- Instant AI feedback, encouraging tone, no harsh scoring

### Step 6 — Progress & Next Steps
Simple progress view: modules completed, skill path so far, suggested next lesson. Optional: shareable "skill snapshot" card (nice demo/social flex for judges).

## 5. Core AI Touchpoints (where ML/AI actually does the work)

| Touchpoint | What AI does |
|---|---|
| Diagnostic | Adaptive questioning, structured profile extraction |
| Curriculum generation | Personalized lesson sequencing based on profile |
| Lesson delivery | Context-aware explanation using learner's field as analogy source |
| Feedback | Adaptive quiz generation + personalized feedback on answers |

## 6. Suggested Tech Stack (built for 24-hour speed)

- **Frontend:** Next.js (App Router), Tailwind
- **AI:** Claude/GPT API — structured JSON outputs for diagnostic profile, curriculum, and quiz generation
- **State:** Client-side/session state (no DB required for demo); optionally a lightweight store (e.g. localStorage or a simple in-memory session) for progress
- **Hosting:** Vercel (matches your existing portfolio setup)
- **No auth backend** for the hackathon version — captured via onboarding form only

## 7. Data Model (lightweight, for demo)

```
LearnerProfile {
  name: string
  fieldOrGoal: string
  comfortLevel: number (1-5)
  skillGaps: string[]
  tone: string
}

CurriculumModule {
  id: string
  title: string
  angle: string          // how it's framed for this learner
  content: string        // AI-generated explanation
  quiz: QuizItem[]
}

QuizItem {
  question: string
  options: string[]
  correctIndex: number
}
```

## 8. Business Model

**Primary (pitch-ready):** Freemium + subscription — free diagnostic and first module, paid plan unlocks unlimited skill paths, advanced tracks, certificates.

**Growth/scale story:** B2B2C via universities and student organizations (e.g. GDGOC-style communities) — sell per-cohort access, positioning the tool as a career-readiness resource institutions can offer their students.

## 9. End Goal / Vision Beyond the Hackathon

- Expand from "career-readiness skills" into a broader digital literacy platform covering multiple personas (students, business owners, career switchers)
- Real accounts, saved progress, and certificates
- Partnerships with universities and community tech groups for distribution
- Localized content that reflects real regional context (jobs, industries, examples), not generic global course content
- Long-term positioning: the AI-native alternative to static course platforms — one that adapts to the learner instead of asking the learner to adapt to it

## 10. Hackathon Demo Script (suggested)

1. Show the problem in one line (generic courses don't fit real learners)
2. Live demo: onboarding → diagnostic conversation → generated path → one full lesson with quiz
3. Highlight the personalization moment (same question, different learner, different explanation)
4. Close with business model + vision in under 30 seconds