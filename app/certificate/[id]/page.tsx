"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Playfair_Display, Great_Vibes } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"] });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });

interface CertificateData {
  certificateId: string;
  userName: string;
  avatarUrl: string | null;
  skillName: string;
  completionDate: string;
  totalModules: number;
  totalXp: number;
  avgStars: string;
  pathId: string;
}

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const pathId = params.id as string;
  const certificateRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const hasCelebrated = useRef(false);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const res = await fetch(`/api/certificate?pathId=${pathId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to load certificate");
        }
        const certData = await res.json();
        setData(certData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCertificate();
  }, [pathId]);

  // Celebration Effect
  useEffect(() => {
    if (data && !isLoading && !error && !hasCelebrated.current) {
      hasCelebrated.current = true;
      
      const playVictorySound = () => {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();

          const playNote = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
          };

          // Sparkle / Win arpeggio (C5, E5, G5, C6)
          playNote(523.25, 0.0, 0.3);
          playNote(659.25, 0.1, 0.3);
          playNote(783.99, 0.2, 0.3);
          playNote(1046.50, 0.3, 0.8);
        } catch (e) {
          console.error("Audio API not supported or blocked", e);
        }
      };

      const fireConfetti = async () => {
        try {
          const confetti = (await import("canvas-confetti")).default;
          const duration = 3000;
          const end = Date.now() + duration;

          const frame = () => {
            confetti({
              particleCount: 5,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#C5A880', '#1A233A', '#F9F7F3', '#F2A93B']
            });
            confetti({
              particleCount: 5,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#C5A880', '#1A233A', '#F9F7F3', '#F2A93B']
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          frame();
        } catch (e) {
          console.error("Failed to load confetti", e);
        }
      };

      playVictorySound();
      fireConfetti();
    }
  }, [data, isLoading, error]);

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `SkillioPath-Certificate-${data?.skillName || "certificate"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Certificate downloaded as PNG!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export certificate.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`SkillioPath-Certificate-${data?.skillName || "certificate"}.pdf`);
      toast.success("Certificate downloaded as PDF!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export certificate.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Certificate link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-surface" />
          <div className="h-6 w-64 bg-surface rounded-xl" />
          <div className="h-4 w-48 bg-surface rounded-lg" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md text-center bg-white border border-hairline rounded-3xl p-10 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold font-display text-high mb-3">Certificate Not Available</h2>
          <p className="text-muted mb-8">{error || "This certificate could not be loaded."}</p>
          <Link
            href="/path"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
          >
            ← Back to Paths
          </Link>
        </div>
      </main>
    );
  }

  let formattedDate = "";
  try {
    const rawDate = data.completionDate ? new Date(data.completionDate) : new Date();
    // If date is invalid (NaN), fallback to today
    const validDate = isNaN(rawDate.getTime()) ? new Date() : rawDate;
    
    formattedDate = validDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    // Ultimate fallback if parsing fails completely
    formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  // Just in case it's still completely empty, hardcode a fallback
  if (!formattedDate || formattedDate.trim() === "") {
    const today = new Date();
    formattedDate = `${today.toLocaleString('en-US', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:px-6">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <Link
          href={`/path?id=${data.pathId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-high transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Path
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted border border-hairline rounded-xl hover:border-primary/50 hover:text-primary transition-all bg-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share
          </button>
          <button
            onClick={handleDownloadPNG}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-muted border border-hairline rounded-xl hover:border-primary/50 hover:text-primary transition-all bg-white disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PNG
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div
          ref={certificateRef}
          className="certificate-container relative bg-white rounded-2xl overflow-hidden animate-cert-glow animate-cert-float"
          style={{ aspectRatio: "1.414 / 1" }}
        >
          {/* Decorative Classic Border */}
          <div className="absolute inset-0 p-3 sm:p-5">
            <div className="absolute inset-3 sm:inset-5 border-[3px] border-[#C5A880] pointer-events-none" />
            <div className="absolute inset-4 sm:inset-6 border border-[#C5A880] pointer-events-none" />
          </div>

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.09] pointer-events-none">
            <img src="/logo.png" alt="Watermark" crossOrigin="anonymous" className="w-[60%] sm:w-[50%] object-contain grayscale" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-between px-10 sm:px-20 pt-10 sm:pt-14 pb-16 sm:pb-20 text-center">

            {/* Top Logo */}
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="SkillioPath Logo" crossOrigin="anonymous" className="h-12  sm:h-20 object-contain mb-4" />
              <h3 className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-[#1A233A] mb-6">
                SkillioPath Digital Academy
              </h3>
            </div>

            {/* Title */}
            <div className="flex flex-col items-center space-y-3 w-full">
              <h1 className={`${playfair.className} text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A233A] tracking-wide`}>
                CERTIFICATE OF MASTERY
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mt-3">
                This certifies that
              </p>
              
              {/* User Name */}
              <h2 className={`${playfair.className} text-4xl sm:text-5xl md:text-6xl text-[#1A233A] mt-3 mb-1`}>
                {data.userName}
              </h2>

              {/* Achievement Text */}
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed mt-1">
                has successfully completed the comprehensive curriculum and demonstrated proficiency in
              </p>

              {/* Skill Name */}
              <h3 className={`${playfair.className} text-2xl sm:text-3xl text-[#C5A880] font-semibold mt-3 mb-6`}>
                {data.skillName}
              </h3>
            </div>

            {/* Bottom Section: Signature & Seal */}
            <div className="w-full flex justify-between items-end mt-4 px-2 sm:px-6">
              {/* Signature */}
              <div className="flex flex-col items-center w-36 sm:w-48">
                <div className={`${greatVibes.className} text-3xl sm:text-5xl text-[#1A233A] mb-1 sm:mb-2`}>
                  Tabe
                </div>
                <div className="w-full h-px bg-slate-300 mb-2" />
                <p className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Tabe Rickson, Founder
                </p>
              </div>

              {/* Minimal Seal/Stats */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-[#C5A880] flex flex-col items-center justify-center bg-[#F9F7F3] shadow-inner">
                  <p className="text-[10px] sm:text-sm font-bold text-[#1A233A]">{data.totalXp} XP</p>
                  <p className="text-[7px] sm:text-[9px] uppercase tracking-widest text-slate-500">{data.totalModules} Mods</p>
                </div>
              </div>

              {/* Date & ID */}
              <div className="flex flex-col items-center w-36 sm:w-48">
                <p className={`${playfair.className} sm:text-xl text-[#1A233A] font-bold mb-1 sm:mb-2`}>
                  {formattedDate}
                </p>
                <div className="w-full h-px bg-slate-300 mb-2" />
                <p className="text-[8px] sm:text-[10px] text-[#1A233A] uppercase tracking-wider font-bold">
                  Date Issued &bull; SP-{data.certificateId}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Export loading overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white border border-hairline p-8 rounded-2xl shadow-xl text-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-high font-bold">Generating your certificate...</p>
            <p className="text-sm text-muted mt-1">This may take a moment.</p>
          </div>
        </div>
      )}
    </main>
  );
}
