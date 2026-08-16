"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

/* -- Steps data --------------------------------------------- */
const steps = [
  {
    number: "01",
    title: "Assess",
    description:
      "Take a 5-minute AI skill audit to identify exactly what you know and where your digital gaps are.",
  },
  {
    number: "02",
    title: "Learn",
    description:
      "Engaging, bite-sized lessons tailored strictly to your professional background. No generic fluff.",
  },
  {
    number: "03",
    title: "Apply",
    description:
      "Use AI agents to automate your real-world workflows in a safe sandbox environment.",
  },
];

/* -- Stats data --------------------------------------------- */
const stats = [
  {
    value: "40%",
    label: "of current skills will be obsolete by 2030.",
    iconColor: "bg-red-100 text-red-500",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    value: "59%",
    label: "of companies report a massive digital skills gap.",
    iconColor: "bg-amber-100 text-amber-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
      </svg>
    ),
  },
  {
    value: "2 min",
    label: "to get your personalized learning path.",
    iconColor: "bg-teal-100 text-teal-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    value: "100%",
    label: "tailored to your field - zero generic content.",
    iconColor: "bg-blue-100 text-blue-600",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
      </svg>
    ),
  },
];

/* -- Top Skills data --------------------------------------------- */
const topSkills = [
  {
    category: "Tech & Data Skills",
    skills: [
      "Artificial Intelligence & ML",
      "Generative AI & Workflows",
      "Cybersecurity",
      "Cloud Computing & DevOps",
      "Data Science & Analytics",
      "Software Development"
    ],
    icon: (
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
    ),
    color: "bg-blue-50 border-blue-100",
  },
  {
    category: "Strategic & Creative Skills",
    skills: [
      "Management Consulting",
      "Project Management",
      "UX/UI Design",
      "Digital Marketing"
    ],
    icon: (
      <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.536 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
    ),
    color: "bg-amber-50 border-amber-100",
  }
];

/* -- Avatars data --------------------------------------------- */
const avatars = [
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/46.jpg",
  "https://randomuser.me/api/portraits/women/22.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
  "https://randomuser.me/api/portraits/women/91.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg"
];
const doubledAvatars = [...avatars, ...avatars];

/* -- FAQ data --------------------------------------------- */
const faqs = [
  {
    question: "Is it too technical for me?",
    answer: "Absolutely not. SkillioPath is built specifically for non-technical professionals. There is zero coding required. We focus on teaching you how to manage and use AI tools, not how to program them."
  },
  {
    question: "How much time does it take?",
    answer: "You can start learning in just 5 minutes a day. Our lessons are bite-sized and designed to fit into a busy professional schedule."
  },
  {
    question: "Is the curriculum really personalized?",
    answer: "Yes. Unlike generic courses, our AI assesses your current domain knowledge (e.g., Marketing, Biology, Law) and generates a unique micro-curriculum that uses analogies from your field to teach complex digital concepts."
  }
];

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const ctaHref = isAuthenticated ? "/dashboard" : "/signup";

  return (
    <>
            {/* NAV                                                */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-hairline">
        <div className="w-full flex h-16 items-center justify-between px-8 lg:px-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="SkilioPath"
              width={80}
              height={80}
              className="w-14 h-14 object-contain"
            />
            <span className="text-lg font-bold font-display tracking-tight text-high">
              Skillio<span className="text-amber">Path</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-mid">
            <a href="#problem" className="hover:text-high transition-colors">
              The Gap
            </a>
            <a href="#how" className="hover:text-high transition-colors">
              How it works
            </a>
            <a href="#community" className="hover:text-high transition-colors">
              Community
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary px-5 py-2.5 text-sm rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-mid hover:text-high transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary px-5 py-2.5 text-sm rounded-lg"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

            {/* 1. HERO - Above the Fold                           */}
            <section className="relative pt-16 min-h-[calc(100vh-64px)] flex flex-col">
        {/* Main hero content - NO max-width container, content pushed to edges */}
        <div className="flex-1 flex items-stretch">
          <div className="w-full grid lg:grid-cols-[45%_55%] items-center">
            {/* Left - Text block, padded from left edge */}
            <div className="px-8 lg:pl-16 xl:pl-24 lg:pr-12 py-16 lg:py-0 space-y-7 z-10">
              {/* Social proof line */}
              <div className="animate-fade-in-up flex items-center gap-4">
                <div className="relative w-20 h-8 overflow-hidden mask-center-fade">
                  <div className="flex -space-x-2 absolute left-0 animate-slide-avatars">
                    {doubledAvatars.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Learner"
                        className="h-8 w-8 min-w-[32px] rounded-full border-2 border-white object-cover relative shadow-sm"
                        style={{ zIndex: 100 - i }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-muted">
                    Join professionals building digital skills.
                  </p>
                  <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wide mt-0.5">
                    Advancing UN SDG 4: Quality Education
                  </p>
                </div>
              </div>

              {/* Headline - Hard-hitting, benefit-driven promise */}
              <motion.h1 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
                }}
                className="text-5xl sm:text-6xl lg:text-[4rem] font-bold font-display tracking-tight leading-[1.05] text-high"
              >
                <motion.span className="block" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>Master the</motion.span>
                <motion.span className="block" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>Digital Skills</motion.span>
                <motion.span className="text-amber block mt-1" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>of Tomorrow.</motion.span>
              </motion.h1>

              {/* Subheadline - USP and outcome */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg leading-relaxed text-mid max-w-lg"
              >
                SkillioPath uses AI to turn completely non-technical people into confident, digital leaders. No generic courses. Just a personalized learning path built around who you already are.
              </motion.p>

              {/* CTAs */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.8 } }
                }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <motion.div 
                  variants={{ hidden: { opacity: 0, scale: 0.8, y: 10 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 150 } } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={ctaHref}
                    className="btn-primary px-7 py-4 text-base"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Start Upskilling for Free"}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </Link>
                </motion.div>

                <motion.div
                  variants={{ hidden: { opacity: 0, scale: 0.8, y: 10 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 150 } } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a href="#how" className="btn-outline px-7 py-4 text-base">
                    See How It Works
                  </a>
                </motion.div>
              </motion.div>
            </div>

            {/* Right - Hero image, bleeds to the right edge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.3, x: 100 }}
              animate={{ 
                opacity: [0, 1, 1, 1], 
                scale: [0.3, 0.3, 0.3, 1], 
                x: [100, 0, 0, 0]
              }}
              transition={{ 
                duration: 2,
                times: [0, 0.2, 0.6, 1],
                ease: ["easeOut", "linear", "backOut"],
                delay: 0.2
              }}
              className="hidden lg:block relative h-full min-h-[500px] xl:min-h-[600px]"
            >
              <Image
                src="/landing-page-assets/heroimage.png"
                alt="A professional mastering digital skills"
                fill
                className="object-cover object-center 2xl:object-left"
                priority
              />
              {/* Subtle gradient fade on left edge so image blends */}
              <div className="absolute inset-y-0 left-0 w-16 lg:w-24 2xl:w-32 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar - independent section */}
      <section className="bg-dark text-on-dark w-full">
        <div className="w-full px-8 lg:px-16 py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.iconColor}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold font-display leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm text-on-dark/70 leading-snug mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* 2. THE PROBLEM & MARKET DATA SECTION                 */}
            <section id="problem" className="bg-surface py-20 lg:py-28">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto text-center mb-14 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
              The Cost of Falling Behind
            </h2>
            <p className="text-lg text-mid leading-relaxed max-w-2xl mx-auto">
              Skills that took years to learn now expire in months. The gap between what you know and what the market needs is growing exponentially.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            <div className="card p-8 text-center space-y-4">
              <h2  className="font-bold text-high">Workforce Threat</h2>
               <p className="text-5xl font-bold font-display text-amber">80%</p>
              <p className="text-sm text-mid leading-relaxed">
                of the engineering and tech workforce will need major upskilling by 2027 to remain relevant.
              </p>
            </div>
            <div className="card p-8 text-center space-y-4">
              <h2  className="font-bold text-high">The AI Literacy Gap</h2>
               <p className="text-5xl font-bold font-display text-amber">91%</p>
              <p className="text-sm text-mid leading-relaxed">
                of future AI roles require human-AI interaction skills, but specialists are rare.
              </p>
            </div>
            <div className="card p-8 text-center space-y-4">
              <h2  className="font-bold text-high">The Overwhelmed Worker</h2>
               <p className="text-5xl font-bold font-display text-amber">54%</p>
              <p className="text-sm text-mid leading-relaxed">
                of global workers use AI weekly, but feel completely overwhelmed by the pace of change.
              </p>
            </div>
          </motion.div>

          {/* Cameroon Specific Context */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="max-w-6xl mx-auto bg-dark rounded-2xl p-8 lg:p-12 text-on-dark flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden shadow-xl">
             <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>
             <div className="flex-1 relative z-10 space-y-4">
                <h3 className="text-2xl font-bold font-display text-amber">The Connectivity vs. Proficiency Gap</h3>
                <p className="text-on-dark/80 leading-relaxed">
                  In Cameroon, mobile connectivity sits at a staggering <strong>96.4%</strong>, yet true internet penetration and high-level digital proficiency remain at just <strong>41.9%</strong>. 
                </p>
                <p className="text-on-dark/80 leading-relaxed">
                  Millions have basic access but lack the skills to leverage tools like Agentic AI or digital marketing effectively. SkillioPath bridges this exact divide.
                </p>
             </div>
          </motion.div>
        </div>
      </section>

            {/* TOP SKILLS TO LEARN                                  */}
            <section id="skills" className="py-20 lg:py-28 bg-white border-t border-border-hairline">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
              Not sure where to start?
            </h2>
            <p className="text-lg text-mid">
              Explore the most in-demand digital skills for the upcoming year. Whether you want to automate workflows or master growth, there's a path for you.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {topSkills.map((category, i) => (
              <div key={i} className={`rounded-2xl p-6 border transition-all hover:shadow-md ${category.color}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-border-hairline">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-high text-xl">{category.category}</h3>
                </div>
                <ul className="space-y-3">
                  {category.skills.map((skill, j) => (
                    <li key={j}>
                       <Link href={isAuthenticated ? `/onboarding?skill=${encodeURIComponent(skill)}` : `/signup`} className="group flex items-center justify-between p-3 rounded-xl bg-white border border-transparent hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                           <span className="text-sm font-bold text-high group-hover:text-primary transition-colors">{skill}</span>
                         </div>
                         <span className="text-xs font-bold text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-primary/10 px-2 py-1 rounded-md">
                           Start
                         </span>
                       </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

            {/* CAREER MARKET PREVIEW                                */}
            <section className="py-20 lg:py-28 bg-base border-t border-hairline">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <p className="text-primary font-bold tracking-widest text-xs uppercase">Career Intelligence</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
              High-Paying Skills in <span className="text-primary">Today&apos;s Market</span>
            </h2>
            <p className="text-lg text-mid">
              Real salary data. Real job demand. See exactly which skills are worth your time and investment.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { title: "Artificial Intelligence & ML", salary: "$145k", jobs: "45k+", learners: "45,210", rating: 4.9, growth: "+35% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>, color: "text-purple-600", bg: "bg-purple-50" },
              { title: "Cloud Computing & DevOps", salary: "$130k", jobs: "32k+", learners: "32,150", rating: 4.8, growth: "+18% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Cybersecurity & InfoSec", salary: "$120k", jobs: "28k+", learners: "28,400", rating: 4.9, growth: "+28% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>, color: "text-red-600", bg: "bg-red-50" },
              { title: "Data Science & Analytics", salary: "$115k", jobs: "52k+", learners: "52,800", rating: 4.7, growth: "+15% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: "Prompt Engineering", salary: "$105k", jobs: "15k+", learners: "15,600", rating: 4.6, growth: "+85% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, color: "text-amber-600", bg: "bg-amber-50" },
              { title: "UX/UI Design", salary: "$95k", jobs: "38k+", learners: "38,900", rating: 4.9, growth: "+12% YoY", icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>, color: "text-pink-600", bg: "bg-pink-50" },
            ].map((skill, i) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * i }}
                className="group bg-white border border-hairline rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-11 h-11 rounded-xl ${skill.bg} flex items-center justify-center ${skill.color}`}>
                    {skill.icon}
                  </div>
                  <h3 className="text-base font-bold text-high leading-tight group-hover:text-primary transition-colors">{skill.title}</h3>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-5 flex-1">
                  <div className="bg-base rounded-xl p-3">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Avg. Salary</p>
                    <p className="text-lg font-black text-high">{skill.salary}</p>
                  </div>
                  <div className="bg-base rounded-xl p-3">
                    <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1">Open Jobs</p>
                    <p className="text-lg font-black text-high">{skill.jobs}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-hairline pt-4">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="font-bold text-high">{skill.rating}</span>
                    </span>
                    <span className="text-green-600 font-bold">{skill.growth}</span>
                  </div>
                  <Link
                    href={isAuthenticated ? `/onboarding?skill=${encodeURIComponent(skill.title)}` : `/signup`}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Start Learning →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="text-center mt-12">
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-high text-white font-bold rounded-xl hover:bg-primary transition-colors shadow-lg hover:shadow-xl"
            >
              Explore All Skills in Career Market
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

            {/* 3. FEATURES AND BENEFITS SECTION                     */}
            <section id="features" className="py-20 lg:py-28 bg-base">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high mb-4">
              Pedagogical Partners, Not Just Content
            </h2>
            <p className="text-lg text-mid">
              We focus on the outcomes that actually matter.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <div className="card p-8 border-t-4 border-t-amber-500">
                <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-5.428-1.59-1.59" /></svg>
                </div>
                <h3 className="text-xl font-bold text-high mb-3">AI-Personalized Paths</h3>
                <p className="text-mid leading-relaxed">
                  <strong>Benefit:</strong> Learn only what you need. Save hours every week by skipping generic content and diving straight into context relevant to your field.
                </p>
             </div>
             
             <div className="card p-8 border-t-4 border-t-teal-500">
                <div className="h-12 w-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-high mb-3">Hands-on Sandbox</h3>
                <p className="text-mid leading-relaxed">
                  <strong>Benefit:</strong> Gain immediate confidence. Don't just watch videos-experiment in a safe, virtual environment to test ideas at the pace of innovation.
                </p>
             </div>

             <div className="card p-8 border-t-4 border-t-blue-500">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-high mb-3">Agentic AI Workflows</h3>
                <p className="text-mid leading-relaxed">
                  <strong>Benefit:</strong> Become an AI Manager. Learn to assign tasks to AI agents, observe outputs, and evaluate decisions rather than just being a passive user.
                </p>
             </div>
          </motion.div>
        </div>
      </section>

            {/* 4. HOW IT WORKS SECTION                              */}
            <section id="how" className="bg-surface py-20 lg:py-28">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
              How it works
            </h2>
            <p className="text-lg text-mid">
              A frictionless path from zero to digital proficiency.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid gap-8 sm:grid-cols-3 max-w-6xl mx-auto relative">
            {/* Connecting line for desktop */}
            <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border-hairline z-0" />
            
            {steps.map((step, i) => (
              <div key={step.number} className="relative z-10 flex flex-col items-center text-center">
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white border-2 border-border-hairline text-amber-600 font-display text-2xl font-bold mb-6 shadow-sm">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold font-display text-high mb-3">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-mid px-4">
                  {step.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

            {/* OUR IMPACT (SDGs)                                    */}
            <section className="bg-surface py-20 border-t border-border-hairline">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold font-display tracking-tight text-high">
              Our Global Impact
            </h2>
            <p className="text-lg text-mid">
              SkillioPath is designed to directly advance the United Nations Sustainable Development Goals.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             <div className="card p-8 flex flex-col items-center text-center space-y-5">
                <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-04.jpg" alt="SDG 4: Quality Education" className="w-28 h-28 rounded-lg shadow-sm" />
                <h3 className="font-bold text-high text-xl">Quality Education</h3>
                <p className="text-sm text-mid leading-relaxed">
                  We democratize high-quality, personalized technical education for non-technical individuals, promoting lifelong learning.
                </p>
             </div>
             <div className="card p-8 flex flex-col items-center text-center space-y-5">
                <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-08.jpg" alt="SDG 8: Decent Work" className="w-28 h-28 rounded-lg shadow-sm" />
                <h3 className="font-bold text-high text-xl">Decent Work</h3>
                <p className="text-sm text-mid leading-relaxed">
                  By upskilling the workforce for an AI-driven economy, we future-proof careers and promote sustained economic growth.
                </p>
             </div>
             <div className="card p-8 flex flex-col items-center text-center space-y-5">
                <img src="https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-10.jpg" alt="SDG 10: Reduced Inequalities" className="w-28 h-28 rounded-lg shadow-sm" />
                <h3 className="font-bold text-high text-xl">Reduced Inequalities</h3>
                <p className="text-sm text-mid leading-relaxed">
                  We bridge the critical gap between basic internet access and high-level digital proficiency in developing regions.
                </p>
             </div>
          </motion.div>
        </div>
      </section>

            {/* 5. INSTRUCTOR & COMMUNITY SECTION                    */}
            <section id="community" className="py-20 lg:py-28 bg-base border-t border-border-hairline">
        <div className="w-full px-8 lg:px-16 xl:px-24">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Founder Story */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-high">
                From Student to Founder. <br/>Built for the Driven Learner.
              </h2>
              <div className="text-lg text-mid leading-relaxed space-y-4">
                <p>
                  "As a university student nearing graduation, I struggled to figure out a clear, purposeful career path. It's the exact same problem so many graduates face today-the massive gap between traditional academic knowledge and actual, high-value digital skills."
                </p>
                <p>
                  I built SkillioPath not just to turn unskilled students into skilled professionals, but for anyone who has the passion to learn, earn, and grow. Whether you're a student, a graduate, or an early-career professional, we help you bridge the gap between where you are and where the digital economy is heading.
                </p>
                <p className="font-medium text-high">
                  We don't just teach you to use AI; we give you a personalized path to actually manage your future.
                </p>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="h-14 w-14 rounded-full bg-surface border border-border-subtle overflow-hidden">
                   <Image src="/landing-page-assets/tabe-rickson.png" alt="Tabe Rickson" width={56} height={56} className="object-cover h-full w-full" />
                </div>
                <div>
                  <p className="font-bold text-high">Tabe Rickson</p>
                  <p className="text-sm text-muted">Founder, SkillioPath</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Community Badges/Support */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="card p-8 lg:p-12 space-y-8 bg-surface">
              <h3 className="text-2xl font-bold text-high">Learning Beyond the Screen</h3>
              <p className="text-mid">Learning in isolation doesn't work. When you join SkillioPath, you plug into a thriving ecosystem focused on fostering true community and continuous growth.</p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white rounded shadow-sm border border-border-hairline flex items-center justify-center shrink-0 font-bold text-amber-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-high">Peer Collaboration</h4>
                    <p className="text-sm text-mid">Ask questions, share workflows, and collaborate with peers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white rounded shadow-sm border border-border-hairline flex items-center justify-center shrink-0 font-bold text-teal-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.829 1.504-2.115a4.484 4.484 0 0 0 2.25-2.147 4.5 4.5 0 0 0-2.25-5.918 4.484 4.484 0 0 0-5.918-2.25 4.5 4.5 0 0 0-2.25 5.918 4.484 4.484 0 0 0 2.25 2.147c.846.286 1.504 1.132 1.504 2.115v.192" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-high">Mentorship</h4>
                    <p className="text-sm text-mid">Direct support and guidance when you hit a roadblock.</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

            {/* 6. FINAL CONVERSION SECTION (THE "CLOSER")           */}
            <section className="bg-dark text-on-dark py-20 lg:py-28 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-dark to-dark pointer-events-none" />

        <div className="w-full px-8 lg:px-16 xl:px-24 relative z-10">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Final CTA */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-8 text-center lg:text-left">
              <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight">
                40% of your skills will be obsolete by 2030.
                <span className="block text-amber mt-2">Is your career ready?</span>
              </h2>
              <p className="text-lg text-on-dark/70">
                Stop watching generic tutorials. Start building the exact digital skills you need for your industry today.
              </p>
              <div className="pt-4">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-dark font-semibold rounded-full px-8 py-4 text-lg transition-all shadow-lg shadow-primary/20"
                >
                  {isAuthenticated ? "Continue your path" : "Start Upskilling For Free"}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                </Link>
                <p className="text-sm text-on-dark/50 mt-4">No credit card required. Cancel anytime.</p>
              </div>
            </motion.div>

            {/* Right: FAQ Accordion */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4 w-full">
              <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Frequently Asked Questions</h3>
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-white/5 border border-white/10 rounded-lg open:bg-white/10 transition-colors">
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-medium">
                    {faq.question}
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="text-on-dark/70 px-5 pb-5 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

            {/* FOOTER                                             */}
            <footer className="border-t border-hairline py-8 bg-base">
        <div className="w-full px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SkilioPath"
              width={24}
              height={24}
              className="w-6 h-6 object-contain opacity-70 grayscale"
            />
            <span className="font-display font-bold text-high">
              Skillio<span className="text-amber">Path</span>
            </span>
          </Link>
          <span>© {new Date().getFullYear()} SkillioPath. Built by Tabe Rickson.</span>
        </div>
      </footer>
    </>
  );
}
