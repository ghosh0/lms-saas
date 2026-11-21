"use client";

// =============================================================================
// Course Creation Studio — Modern Black & Emerald (5 Credits / Live Course)
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { createCourseAction } from "@/actions/lessons";
import {
  Sparkles,
  Coins,
  FileUp,
  FileText,
  AlertTriangle,
  Loader2,
  Check,
  ArrowRight,
  Info,
  IndianRupee,
  BookOpen,
  Radio,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

const TEACHER_PERSONAS = [
  {
    id: "dr-rutherford",
    name: "Dr. Rutherford",
    tagline: "Brilliant & Witty",
    description: "Intellectually brilliant with sharp, witty humor and clever analogies that make challenging concepts crystal clear.",
    stylePrompt: `You are Dr. Rutherford, a brilliant and witty academic teacher.
- You explain concepts with intellectual depth, razor-sharp clarity, and clever analogies.
- You have a warm, humorous, witty personality that keeps students engaged.
- You break down complex ideas with playful thought experiments.`,
  },
  {
    id: "dr-williams",
    name: "Dr. Williams",
    tagline: "Patient & Analytical",
    description: "Deeply methodical and analytical, breaking complex systems down step-by-step with disciplined rigor and infinite patience.",
    stylePrompt: `You are Dr. Williams, a patient, deeply analytical, and methodical professor.
- You break down concepts step-by-step with structured logical rigor.
- You are exceptionally patient, making sure the student grasps each fundamental step before advancing.
- You encourage deliberate thinking and offer precise, clear explanations.`,
  },
  {
    id: "dr-miller",
    name: "Dr. Miller",
    tagline: "Dynamic & Socratic",
    description: "High-energy and thought-provoking, using sharp Socratic questions to challenge student intuition and foster first-principles mastery.",
    stylePrompt: `You are Dr. Miller, an energetic, thought-provoking Socratic educator.
- You use guided questions to challenge student intuition and prompt them to discover answers.
- You encourage first-principles reasoning and cultivate critical thinking.
- You bring infectious curiosity and lively intellectual energy to every concept.`,
  },
];

export default function CreateCoursePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [gradeLevel, setGradeLevel] = useState("High School");
  const [teacherId, setTeacherId] = useState("dr-rutherford");
  const [durationMins, setDurationMins] = useState(30);
  const [priceInRupees, setPriceInRupees] = useState<number>(0);

  // PDF Notes Upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Form Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState(false);

  const userCredits = (session?.user as unknown as { credits?: number })?.credits ?? 0;
  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only PDF files are supported for course notes.");
      return;
    }

    setPdfFile(file);
    setUploadingPdf(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/courses/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload PDF notes.");
      }

      setPdfUrl(data.url);
      setPdfName(data.fileName);
    } catch (uErr: unknown) {
      console.error("[CreateCourse] Upload error:", uErr);
      setError(uErr instanceof Error ? uErr.message : "PDF upload failed.");
      setPdfFile(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    setError(null);
    setInsufficientCredits(false);

    const selectedPersona = TEACHER_PERSONAS.find((t) => t.id === teacherId) || TEACHER_PERSONAS[0];

    const generatedSystemPrompt = `${selectedPersona.stylePrompt}

You are leading an interactive one-on-one live voice lesson.
COURSE: ${title.trim()}
SUBJECT: ${subject.trim()}
TARGET GRADE LEVEL: ${gradeLevel.trim()}

## ABSOLUTE MANDATE: ZERO OFF-TOPIC TOLERANCE
You are strictly an academic tutor for "${title.trim()}" in the subject "${subject.trim()}".
Under NO circumstances are you allowed to explain, discuss, or answer questions that are off-topic or unrelated to "${title.trim()}" and ${subject.trim()}.
If the student asks about anything outside of this curriculum (including casual conversation, pop culture, news, other subjects, or unrelated queries), you must immediately and politely decline:
"I am dedicated to teaching you ${title.trim()} today. Let's stay focused on our ${subject.trim()} lesson. Where were we?"
Never entertain distractions.

## VOICE CONVERSATION RULES:
- Speak naturally and conversationally, exactly like a live phone or audio call.
- Keep each turn to 1-3 spoken sentences maximum (20 to 40 seconds) so the student has space to speak.
- Periodically check in with the student to verify understanding.
- Never read markdown, asterisks, or code formatting aloud. Speak mathematics fluently.`;

    const res = await createCourseAction({
      title,
      description,
      subject,
      gradeLevel,
      systemPrompt: generatedSystemPrompt,
      durationMins,
      priceInRupees: Number(priceInRupees) || 0,
      pdfUrl: pdfUrl || undefined,
      pdfName: pdfName || undefined,
    });

    setSubmitting(false);

    if (!res.success) {
      setError(res.error || "Failed to create course.");
      if (res.insufficientCredits) {
        setInsufficientCredits(true);
      }
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background glow */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Radio className="w-1.5 h-1.5 animate-pulse" />
            CREATOR STUDIO • LIVE VOICE CURRICULUM
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create New AI Live Course</h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Select your autonomous AI teacher persona, attach reference notes/PDFs, and define your marketplace sale price.
          </p>
        </div>

        {/* Balance Warning / Upgrade Card */}
        {!isAdmin && userCredits < 5 && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-300">Insufficient Credits ({userCredits}/5)</p>
                <p className="text-xs text-amber-400/80 mt-0.5">You need at least 5 credits to publish an autonomous voice course.</p>
              </div>
            </div>
            <Link href="/credits">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shrink-0 font-mono text-xs">
                Top Up Credits <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-8 flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {insufficientCredits && (
              <Link href="/credits" className="text-emerald-400 underline underline-offset-4 font-semibold">
                Buy Credits
              </Link>
            )}
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Title & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quantum Chemistry & Atomic Bonds"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Academic Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
              >
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="World History">World History</option>
                <option value="Biology">Biology</option>
                <option value="Economics">Economics</option>
                <option value="Philosophy">Philosophy</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Course Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise curriculum overview and learning outcomes for your students..."
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all resize-none"
            />
          </div>

          {/* Grade Level, Duration & Marketplace Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Target Grade Level
              </label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="e.g. High School, Grade 11, College"
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
                Target Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={durationMins}
                onChange={(e) => setDurationMins(parseInt(e.target.value) || 30)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Sale Price (₹ INR) *
                </label>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {priceInRupees === 0 ? "FREE COURSE" : `₹${priceInRupees} / Student`}
                </span>
              </div>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={priceInRupees}
                  onChange={(e) => setPriceInRupees(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0 (Free) or set any price"
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-sans transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                Set ₹0 for free open access, or any amount to sell in the marketplace.
              </p>
            </div>
          </div>

          {/* AI Teacher Persona Dropdown Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Select AI Teacher Persona *
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">Autonomous Voice Agent</span>
            </div>

            <div className="space-y-3">
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 font-mono cursor-pointer transition-all"
              >
                {TEACHER_PERSONAS.map((teacher) => (
                  <option key={teacher.id} value={teacher.id} className="bg-zinc-950 text-white">
                    {teacher.name} — {teacher.tagline}
                  </option>
                ))}
              </select>

              {/* Selected Persona Highlight Card */}
              {(() => {
                const currentTeacher = TEACHER_PERSONAS.find((t) => t.id === teacherId) || TEACHER_PERSONAS[0];
                return (
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-emerald-500/30 font-mono text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        {currentTeacher.name} ({currentTeacher.tagline})
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Male Voice</span>
                    </div>
                    <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                      {currentTeacher.description}
                    </p>
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Strict Topic Guard: Will strictly teach this course and decline unrelated/off-topic questions.</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* PDF Notes Upload Zone (Creator Feature) */}
          <div className="pt-2">
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase tracking-wider">
              Course Reference Notes / PDF (Optional Creator Attachment)
            </label>

            <div className="border border-dashed border-zinc-800 hover:border-emerald-500/40 rounded-xl p-5 bg-zinc-900/30 transition-colors">
              {pdfUrl ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">{pdfName}</p>
                      <p className="text-[10px] text-emerald-400/80">PDF successfully attached to course</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      setPdfUrl(null);
                      setPdfName(null);
                    }}
                    className="text-xs text-rose-400 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                  <FileUp className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-emerald-400" />
                  <span className="text-xs text-zinc-300 font-medium">
                    {uploadingPdf ? "Uploading PDF document..." : "Click to select and upload course PDF notes"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1">PDF format up to 20MB</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handlePdfChange}
                    disabled={uploadingPdf}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isAdmin ? (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Creation Cost: <strong className="text-emerald-300">5 Credits</strong></span>
                <span className="text-zinc-600">•</span>
                <span>Your Balance: <strong className="text-white">{userCredits} Credits</strong></span>
              </div>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              disabled={submitting || uploadingPdf || (!isAdmin && userCredits < 5)}
              className="w-full sm:w-auto px-8 py-5 font-semibold font-mono text-xs"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deploying Course...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isAdmin ? "Publish Course" : "Publish Course (Deduct 5 Credits)"} <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

