# SkillioPath — Project Context

> **Read this before writing any code, copy, or design.**
> This is the authoritative source of truth for what SkillioPath is, who it is for, and what it must feel like. If anything you are building contradicts this file, stop and re-read it.

---

## The Real Problem We Are Solving

The digital economy evolves faster than education can. Skills like AI literacy, prompt engineering, digital marketing, and agentic coding are now essential for employment — but the people who need them most are the ones being left behind:

- A final-year student in Marketing, Biology, or Business who knows digital skills matter but cannot find anything that teaches them in terms they understand.
- A small business owner who needs to grow online but has zero technical background and no time for a 40-hour generic course.
- Anyone who comes from a non-computer-science background and finds every existing resource either too basic, too advanced, too generic, or too slow.

**They are not failing because they lack motivation. They are failing because nothing meets them where they are.**

This is what SkillioPath fixes.

---

## The Mission (in one sentence)

> **Turn complete non-technical people into confident, digitally-skilled professionals by building a learning path around who they already are — not who the course assumes they are.**

---

## Who We Build For (Primary Persona)

**Name:** Any final-year student or early-career professional in a non-technical field.

**Their reality:**
- They study Marketing, Biology, Law, Business, Education, or any non-CS discipline
- They know AI and digital skills are required to be competitive, but every existing course speaks in jargon built for engineers
- They start Coursera or YouTube tutorials, get lost in week 2, and quit — not because they are not smart, but because the material was never designed for their context
- They feel like they are already behind and the gap is growing

**Their real pain, in their own words:**
- *"I don't know what's actually relevant to me."*
- *"This content feels built for someone else."*
- *"I don't even know where to start."*

**What they need:**
- To be met where they are, not where the course assumes they are
- Explanations that use their existing knowledge as the bridge (a marketing student learning LLMs via copywriting analogies, not code)
- A path that is clearly theirs — not a generic syllabus
- Small wins they can feel, not a mountain to climb

---

## What SkillioPath Actually Does

1. **Diagnoses** — A 2-3 minute AI conversation (not a quiz) that figures out what the learner knows, what they need, and what motivates them.
2. **Generates a personalized path** — 3-4 micro-modules ordered foundational to applied, titled in plain language, framed through the lens of the learner's own field.
3. **Teaches through analogy** — Every concept is explained using the learner's own world as the reference point. Marketing student = copywriter analogies. Biology student = biological system analogies.
4. **Closes the loop** — Short quizzes with specific feedback that tells them *why*, not just right or wrong.

**The core product truth:** It replaces "one-size-fits-all course" with "a path built around this exact person."

---

## The Visual & Brand Identity

The product is called **SkilioPath**. The word *Path* is not decorative — it is the core metaphor.

### Design Concept
SkilioPath is a **trail**. A route. A winding journey through skills, not a shelf of courses. Every design decision should reinforce this:
- Curriculum is displayed as a **trail with waypoints**, not a card grid
- Progress is movement along a path, not a percentage bar
- The learner is a traveller being guided, not a student being lectured

### Color Palette (use these exactly, do not substitute)
| Token | Hex | Meaning |
|---|---|---|
| `--bg-base` | `#14162B` | Deep indigo-navy — the night sky the trail moves through |
| `--bg-surface` | `#1E2142` | Panels, lesson cards, AI chat bubbles |
| `--accent-primary` | `#F2A93B` | Warm amber — waypoint markers, CTAs, active states |
| `--accent-secondary` | `#3FA796` | Teal — completion, success, progress |
| `--text-high` | `#F5F3EE` | Headlines, primary body |
| `--text-muted` | `#9A9CC0` | Captions, secondary text, timestamps |
| `--border-hairline` | `#2E3159` | Dividers, input borders |

### Typography
- **Display (Space Grotesk):** Headlines, module titles, the wordmark — used sparingly
- **Body (Inter):** All reading content, chat text, lesson explanations
- **Utility (IBM Plex Mono):** Quiz labels, skill tags, progress stats — anything that reads as system output

### The One Signature Visual
The **animated trail** on the `/path` screen. When the curriculum generates, the winding SVG path draws itself in and each waypoint fades up sequentially. This is the visual "wow" moment of the product. It should feel earned — everything else in the UI stays calm and disciplined so this moment lands.

### Tone of Voice
- Warm, direct, encouraging — like a knowledgeable friend, not a corporate platform
- Write from the learner's perspective: "See your path" not "Generate curriculum"
- Loading states are specific: "Building your path..." not "Loading..."
- Errors are honest: "That didn't generate — try again" not "Oops! Something went wrong :("
- No jargon, no buzzwords, no filler

---

## What This Is NOT

Before building anything, check it against this list:

| Do NOT build | Why |
|---|---|
| A generic SaaS landing page with cards in a grid | This is a path product, not a course catalog |
| A dark background + blue or generic violet palette | The palette is defined above — use it exactly |
| Gold shimmer text or pulsing CTA animations | Overused template patterns that make it look AI-generated |
| "One-size-fits-all" copy | Every word should speak to the specific non-technical learner |
| A dashboard with a sidebar nav | This is a 5-screen focused flow, not an admin panel |
| Real auth, database, payment, settings | Out of scope for v1 — focus on the core flow |
| A course catalog or skill-track browser | The path is generated for this person — they don't browse |
| Generic "Correct!" / "Try again" quiz feedback | Feedback must be specific and reference the actual concept |

---

## The 5-Screen Flow (everything else is out of scope for v1)

```
/                  -> Landing — one CTA: "Find your path"
/onboarding        -> Name + field of study (2 fields, no complexity)
/diagnostic        -> AI chat, 2-3 exchanges, builds a learner profile
/path              -> Personalized curriculum as an animated trail with waypoints
/lesson/[id]       -> AI lesson (analogy-first) + follow-up chat + quiz + feedback
```

---

## The Landing Page's Specific Job

The landing page has **one job**: communicate the core transformation clearly and warmly enough that the learner trusts clicking "Find your path."

It must answer these three questions in under 10 seconds:
1. **What is this?** — A learning tool that builds a path for *you*, not for everyone
2. **Who is it for?** — People who feel left behind by generic courses; non-technical people who want to compete in a digital world
3. **What do I do?** — Click one button and start a 2-minute conversation

The landing page is NOT a marketing brochure. It does not need to list every feature. It needs to make the right person feel *seen* and *safe to start*.

---

## UNESCO Hackathon 2026 Context

> **IMPORTANT:** SkillioPath is an **independent startup**. It is being *submitted* to the UNESCO Youth Hackathon 2026 as a competition entry — it is NOT built for UNESCO, endorsed by UNESCO, or a UNESCO initiative. Do not reference UNESCO anywhere on the website, in copy, or in UI.

The hackathon is simply the competition context. The product stands entirely on its own.

### For the Submission (not for the website)
The hackathon theme is: *"Play Your Part: Youth Designing the Future of Media and Information Literacy"*

SkillioPath naturally fits under the **AI and MIL** focus area because it democratizes access to digital skills for non-technical youth. The judges care about:
- Real problem, real audience (ours: non-technical students left behind by generic courses)
- Innovation through AI personalization
- Feasibility and real-world impact
- Youth empowerment and digital inclusion

**Submission deadline: 23:59 Paris Time, August 16, 2026.**

### What this means for the product
The website, landing page, and all in-app copy should speak only to **the learner** — the non-technical student or professional who wants to grow their digital skills. The hackathon context is irrelevant to them and should never appear in the product.

---

## Quick Checks Before Any Change

Before writing code or copy, ask:

- Does this serve the non-technical learner who feels lost and left behind?
- Does this reinforce the *path/trail* metaphor or undermine it?
- Does this use the correct color palette (#14162B, #F2A93B, #3FA796) and tone?
- Am I building within the 5-screen scope?
- Does this make the learner feel *seen*, or does it feel generic?

If the answer to any of these is "no" or "I'm not sure" — re-read this file and adjust before proceeding.
