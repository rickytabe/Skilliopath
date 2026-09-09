"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

  const formattedDate = new Date(data.completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          className="certificate-container relative bg-white rounded-2xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: "1.414 / 1" }}
        >
          {/* Decorative Gold Border */}
          <div className="absolute inset-0 p-3 sm:p-5">
            <div className="absolute inset-3 sm:inset-5 border-2 border-primary/30 rounded-xl pointer-events-none" />
            <div className="absolute inset-5 sm:inset-8 border border-primary/15 rounded-lg pointer-events-none" />
          </div>

          {/* Corner Ornaments */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-lg" />
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-r-2 border-primary/40 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />

          {/* Watermark Pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, #F2A93B 40px, #F2A93B 41px)`,
          }} />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 sm:px-16 py-8 sm:py-12 text-center">

            {/* Top Branding */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-primary/70 mb-1">SkillioPath</h3>
              <p className="text-[10px] sm:text-xs text-muted tracking-widest uppercase">AI-Powered Digital Skills Academy</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 w-full max-w-sm sm:max-w-md">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/30" />
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/30" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-high mb-2 sm:mb-3 tracking-tight">
              Certificate of Mastery
            </h1>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-8 font-medium">This certifies that</p>

            {/* User Name */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-bold text-primary mb-3 sm:mb-4" style={{
              textShadow: "0 2px 20px rgba(242,169,59,0.15)",
            }}>
              {data.userName}
            </h2>

            {/* Achievement Text */}
            <p className="text-sm sm:text-lg text-mid font-medium mb-4 sm:mb-6 max-w-sm sm:max-w-xl leading-relaxed">
              has successfully completed all <strong className="text-high">{data.totalModules} modules</strong> and demonstrated proficiency in
            </p>

            {/* Skill Name */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 sm:px-10 py-3 sm:py-4 mb-6 sm:mb-8 inline-block">
              <h3 className="text-xl sm:text-3xl font-display font-bold text-high">{data.skillName}</h3>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-display font-bold text-high">{data.totalXp}</p>
                <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider font-bold">XP Earned</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-hairline" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg sm:text-2xl font-display font-bold text-high">{data.avgStars}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider font-bold">Avg Stars</p>
              </div>
              <div className="w-px h-6 sm:h-8 bg-hairline" />
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-display font-bold text-high">{data.totalModules}</p>
                <p className="text-[10px] sm:text-xs text-muted uppercase tracking-wider font-bold">Modules</p>
              </div>
            </div>

            {/* Date & Certificate ID */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 text-[10px] sm:text-xs text-muted">
              <div>
                <p className="font-bold uppercase tracking-wider mb-1">Date Issued</p>
                <p className="text-high font-medium">{formattedDate}</p>
              </div>
              <div className="w-px h-6 bg-hairline" />
              <div>
                <p className="font-bold uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-high font-mono font-medium">SP-{data.certificateId}</p>
              </div>
            </div>

            {/* Seal */}
            <div className="absolute bottom-4 right-6 sm:bottom-8 sm:right-12 flex flex-col items-center opacity-60">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-primary/40 flex items-center justify-center bg-primary/5">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-primary/40 mt-1">Verified</p>
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
