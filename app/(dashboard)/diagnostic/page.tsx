"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<Record<string, string> | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState("Initializing diagnostic...");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  const fetchNextQuestion = async (data: Record<string, string>, history: Message[]) => {
    setIsLoading(true);
    setLoadingState("Reading your answers...");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingData: data, history }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const resData = await res.json();
      if (resData.text) {
        setMessages((prev) => [...prev, { role: "model", content: resData.text }]);
      } else if (resData.error) {
        throw new Error(resData.error);
      }
    } catch (error: unknown) {
      console.error("Error fetching chat:", error);
      const err = error as Error;
      toast.error(err.message || "Failed to connect to AI.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const skillToLearn = searchParams.get('skillToLearn');
      const currentLevel = searchParams.get('currentLevel');
      const timeline = searchParams.get('timeline');
      
      if (!skillToLearn || !currentLevel || !timeline) {
        router.push("/onboarding");
        return;
      }
      
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          router.push("/login");
          return;
        }
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data: userProfile }) => {
          const data = {
            profileId: user.id,
            name: userProfile?.name || "Learner",
            currentCareer: userProfile?.current_career || "Student",
            skillToLearn,
            currentLevel,
            timeline
          };
          setOnboardingData(data);
          fetchNextQuestion(data, []);
        });
      });
    } catch (err) {
      console.error(err);
      router.push("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const generateProfile = async (data: Record<string, string>, history: Message[]) => {
    setIsLoading(true);
    setLoadingState("Building your path...");
    
    try {
      const res = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingData: data, history, profileId: data.profileId }),
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const profile = await res.json();
      if (profile && !profile.error) {
        router.push("/dashboard");
      } else {
        throw new Error(profile.error || "Failed to build profile.");
      }
    } catch (error: unknown) {
      console.error("Error generating profile:", error);
      const err = error as Error;
      toast.error(err.message || "Failed to generate your path.");
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newHistory = [...messages, { role: "user" as const, content: input }];
    setMessages(newHistory);
    setInput("");

    // Decide if we should keep asking or generate profile
    const userMessageCount = newHistory.filter((m) => m.role === "user").length;
    if (!onboardingData) return;
    
    if (userMessageCount >= 2) { // Generate after 2 replies
      generateProfile(onboardingData, newHistory);
    } else {
      fetchNextQuestion(onboardingData, newHistory);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col">
        
        {/* Header */}
        <div className="mb-8 text-center animate-fade-in-up">
          <h1 className="text-2xl font-semibold text-high mb-2">Diagnostic Mode</h1>
          <p className="text-muted text-sm">
            Let&apos;s figure out where you stand in <span className="text-primary font-medium">{onboardingData?.skillToLearn || "your skill"}</span>
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6 scrollbar-hide pb-4 relative">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full animate-fade-in-up delay-${(idx % 3) * 100} ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
                  msg.role === "user"
                    ? "bg-primary text-background rounded-br-sm"
                    : "bg-surface border border-hairline text-high rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-surface border border-hairline px-5 py-4 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-muted font-medium">{loadingState}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="relative animate-fade-in-up delay-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your answer..."
            className="w-full rounded-full border border-hairline bg-surface/50 px-6 py-4 pr-16 text-sm text-high placeholder-muted backdrop-blur-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 flex aspect-square items-center justify-center rounded-full bg-primary text-background transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
