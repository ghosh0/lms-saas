"use client";

// =============================================================================
// Voice Room — Modern Black & Emerald Real-Time Voice Studio (Zero Emojis)
// =============================================================================

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Vapi from "@vapi-ai/web";
import {
  ArrowLeft,
  Mic,
  MicOff,
  PhoneOff,
  Phone,
  Radio,
  Volume2,
  Loader2,
  AlertTriangle,
  Zap,
  Activity,
  AudioLines,
  FileText,
  Download,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceVisualizer, type AgentState } from "@/components/VoiceVisualizer";
import { startSessionAction, endSessionAction, SessionInitData } from "@/actions/lessons";

type CallStatus = "pre-call" | "connecting" | "active" | "ended";

interface VoiceRoomProps {
  lessonId: string;
}

export default function VoiceRoom({ lessonId }: VoiceRoomProps) {
  const router = useRouter();

  // Session
  const [sessionData, setSessionData] = useState<SessionInitData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [notesPaneOpen, setNotesPaneOpen] = useState(false);

  // Call
  const [callStatus, setCallStatus] = useState<CallStatus>("pre-call");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callError, setCallError] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // ── Load lesson session ────────────────────────────────────────────────────
  const loadSession = useCallback(async () => {
    setLoadingSession(true);
    setLoadError(null);
    const res = await startSessionAction(lessonId);
    setLoadingSession(false);
    if (!res.success || !res.data) {
      setLoadError(res.error || "Failed to load lesson curriculum");
      return;
    }
    setSessionData(res.data);
    sessionIdRef.current = res.data.sessionId;
  }, [lessonId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // ── Start Vapi call ────────────────────────────────────────────────────────
  const handleStartLesson = async () => {
    if (!sessionData) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey) {
      setCallError("NEXT_PUBLIC_VAPI_PUBLIC_KEY is not defined in environment variables.");
      return;
    }

    setCallStatus("connecting");
    setCallError(null);

    // Tear down any stale instance
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      setCallStatus("active");
    });

    vapi.on("call-end", () => {
      setCallStatus("ended");
      setAiSpeaking(false);
      setVolumeLevel(0);
    });

    vapi.on("speech-start", () => setAiSpeaking(true));
    vapi.on("speech-end", () => setAiSpeaking(false));

    vapi.on("volume-level", (level: number) => setVolumeLevel(level));

    vapi.on("error", (err: Error) => {
      console.error("[Vapi] error:", err);
      setCallError("Voice connection error. Please verify credentials or retry.");
      setCallStatus("pre-call");
    });

    try {
      const { lesson } = sessionData;

      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          temperature: 0.7,
          maxTokens: 160,
          messages: [
            {
              role: "system",
              content:
                `${lesson.systemPrompt}\n\n` +
                `You are teaching: ${lesson.title} (${lesson.subject}, Grade ${lesson.gradeLevel}).\n` +
                `RULES:\n` +
                `- Speak ONE short sentence at a time, then pause for the student.\n` +
                `- Never monologue. Always invite a response or ask a quick question.\n` +
                `- When the student speaks, listen fully before replying.\n` +
                `- Keep energy warm, curious, and encouraging.`,
            },
          ],
        },
        voice: {
          provider: "openai",
          voiceId: "echo",
        },
        firstMessage: `Hey! Welcome to ${lesson.title}. I am ready to teach you today — shall we get started?`,
        firstMessageInterruptionsEnabled: true,
      });
    } catch (err) {
      console.error("[Vapi] start failed:", err);
      setCallError("Unable to initialize WebRTC audio session. Verify your Vapi Public Key.");
      setCallStatus("pre-call");
      vapiRef.current = null;
    }
  };

  // ── End lesson ─────────────────────────────────────────────────────────────
  const handleEndLesson = useCallback(async () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    if (sessionIdRef.current) {
      await endSessionAction(sessionIdRef.current);
      sessionIdRef.current = null;
    }
    router.push("/dashboard");
  }, [router]);

  // Auto-navigate 2s after call ends naturally
  useEffect(() => {
    if (callStatus !== "ended") return;
    const t = setTimeout(() => handleEndLesson(), 2000);
    return () => clearTimeout(t);
  }, [callStatus, handleEndLesson]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current = null;
      }
    };
  }, []);

  // ── Mute toggle ────────────────────────────────────────────────────────────
  const handleToggleMute = () => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  };

  // ── Derive AgentState for the visualizer ──────────────────────────────────
  const voiceState: AgentState = (() => {
    if (callStatus === "connecting") return "initializing";
    if (callStatus === "ended") return "idle";
    if (callStatus === "active" && aiSpeaking) return "speaking";
    if (callStatus === "active") return "listening";
    return "idle";
  })();

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    switch (callStatus) {
      case "connecting":
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            CONNECTING WEBRTC STREAM
          </span>
        );
      case "active":
        if (aiSpeaking)
          return (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Volume2 className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
              AI TEACHER SPEAKING • INTERRUPT FREELY
            </span>
          );
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            MIC OPEN • LISTENING
          </span>
        );
      case "ended":
        return (
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
            <Activity className="w-3.5 h-3.5" />
            SESSION COMPLETED • RETURNING TO DASHBOARD
          </span>
        );
      default:
        return null;
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-zinc-100 gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <Radio className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-zinc-400 text-xs font-mono tracking-wider uppercase">Loading Session Data</p>
      </div>
    );
  }

  // ── Load error state ──────────────────────────────────────────────────────
  if (loadError || !sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-zinc-100 gap-4 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">Unable to Load Lesson</h2>
        <p className="text-zinc-400 text-sm max-w-md">{loadError ?? "The requested curriculum record is not available."}</p>
        <div className="flex gap-3 mt-4">
          <Button onClick={loadSession} variant="outline">
            Retry Connection
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="secondary">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { lesson } = sessionData;

  const renderPdfNotesDrawer = () => (
    <>
      {/* Floating edge tab when closed */}
      {!notesPaneOpen && (
        <button
          onClick={() => setNotesPaneOpen(true)}
          className="fixed top-24 right-0 z-40 px-3 py-2 rounded-l-xl bg-zinc-950/90 border-y border-l border-emerald-500/40 text-emerald-400 hover:bg-zinc-900 shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center gap-1.5 font-mono text-xs cursor-pointer backdrop-blur-md transition-all group"
          title="Open Course Reference Notes"
        >
          <FileText className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Notes</span>
          {lesson.pdfUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
        </button>
      )}

      {/* Collapsible Right-Side Floating Pane */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] z-50 bg-zinc-950/95 border-l border-zinc-800 shadow-2xl backdrop-blur-2xl transition-transform duration-300 flex flex-col ${
          notesPaneOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Pane Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-black/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
              Course Reference Notes
            </h3>
          </div>
          <button
            onClick={() => setNotesPaneOpen(false)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Close Notes Pane"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pane Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
          {lesson.pdfUrl ? (
            <>
              {/* PDF Meta Bar & Actions */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="truncate max-w-[280px]">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{lesson.pdfName || "Course_Notes.pdf"}</p>
                    <p className="text-[10px] text-emerald-400/80">Verified Creator Attachment</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                    PDF
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={lesson.pdfUrl}
                    download={lesson.pdfName || "Course_Notes.pdf"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full text-xs font-mono flex items-center justify-center gap-1.5 border-zinc-700 hover:border-emerald-500/50">
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Download
                    </Button>
                  </a>
                  <a
                    href={lesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full text-xs font-mono flex items-center justify-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Tab
                    </Button>
                  </a>
                </div>
              </div>

              {/* Embedded Document View */}
              <div className="flex-1 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
                <iframe
                  src={lesson.pdfUrl}
                  title={lesson.pdfName || "Course Notes"}
                  className="w-full h-full bg-zinc-100"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20">
              <FileText className="w-12 h-12 text-zinc-600 mb-3" />
              <p className="text-sm font-semibold text-zinc-300">No PDF Notes Attached</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs font-mono">
                The creator has not attached written PDF reference material for this lesson.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );

  // ── Pre-call lobby screen ─────────────────────────────────────────────────
  if (callStatus === "pre-call") {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505] text-zinc-100 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top Navbar */}
        <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black/40 backdrop-blur-md">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-zinc-100 font-mono text-xs"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Curriculum
          </Button>
          <div className="text-center">
            <h1 className="text-sm font-semibold text-zinc-200 max-w-md truncate">
              {lesson.title}
            </h1>
            <p className="text-[11px] text-emerald-400/80 font-mono">
              {lesson.subject} • Grade {lesson.gradeLevel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotesPaneOpen(!notesPaneOpen)}
              className={`font-mono text-xs flex items-center gap-1.5 border-zinc-800 ${
                notesPaneOpen ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "text-zinc-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notes</span>
              {lesson.pdfUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Button>
          </div>
        </header>

        {renderPdfNotesDrawer()}

        {/* Main Lobby Body */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-6 py-12">
          {/* Tech Avatar Node */}
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-zinc-950 border-2 border-emerald-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)] backdrop-blur-xl">
              <AudioLines className="w-14 h-14 text-emerald-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-mono font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(16,185,129,0.5)]">
              READY
            </div>
          </div>

          <div className="text-center space-y-2 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{lesson.title}</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Full duplex, low-latency audio transmission with automatic turn detection. Speak naturally and interrupt anytime.
            </p>
          </div>

          {lesson.pdfUrl && (
            <a
              href={lesson.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 hover:border-emerald-500/40 text-xs font-mono transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Reference Notes Attached: {lesson.pdfName || "Course Notes (PDF)"}</span>
            </a>
          )}

          {callError && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono bg-rose-500/10 border border-rose-500/30 rounded-lg px-4 py-2.5 max-w-md">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{callError}</span>
            </div>
          )}

          <Button
            onClick={handleStartLesson}
            size="lg"
            className="px-8 py-6 text-base font-semibold rounded-xl font-mono text-xs"
          >
            <Phone className="w-5 h-5 mr-2" />
            Initiate Session
          </Button>

          <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono pt-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Sub-second latency
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Instant barge-in
            </span>
          </div>
        </main>
      </div>
    );
  }

  // ── Active / ended call studio screen ─────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-zinc-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-black/40 backdrop-blur-md">
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-zinc-100"
          onClick={handleEndLesson}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Dashboard
        </Button>

        <div className="text-center px-2">
          <h1 className="text-sm font-semibold text-zinc-100 max-w-md truncate">
            {lesson.title}
          </h1>
          <p className="text-[11px] text-emerald-400/90 font-mono">
            {lesson.subject} • Grade {lesson.gradeLevel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotesPaneOpen(!notesPaneOpen)}
            className={`font-mono text-xs flex items-center gap-1.5 border-zinc-800 ${
              notesPaneOpen ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Notes</span>
            {lesson.pdfUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndLesson}
            className="font-mono text-xs"
          >
            <PhoneOff className="w-4 h-4 mr-1.5" />
            Terminate
          </Button>
        </div>
      </header>

      {/* Main active stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-7 px-4 py-8">
        <StatusBadge />

        <div className="my-2">
          <VoiceVisualizer state={voiceState} audioLevel={volumeLevel} />
        </div>

        <div className="max-w-md text-center">
          {aiSpeaking ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Barge-in active: speak anytime to interrupt</span>
            </div>
          ) : callStatus === "active" ? (
            <p className="text-xs text-zinc-400 font-mono">
              Listening for student audio input
            </p>
          ) : null}
        </div>
      </main>

      {/* Controls */}
      <footer className="relative z-10 flex flex-col items-center gap-4 pb-10">
        <div className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 p-2.5 rounded-full shadow-2xl backdrop-blur-md">
          {/* Mic Toggle Button */}
          <button
            onClick={handleToggleMute}
            disabled={callStatus !== "active"}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
              isMuted
                ? "bg-rose-500/20 border-2 border-rose-500 text-rose-400 hover:bg-rose-500/30"
                : "bg-emerald-500 border-2 border-emerald-400 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            }`}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 stroke-[2.2]" />}
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>VAPI WEBRTC ENGINE</span>
          <span>•</span>
          <span>NEON POSTGRESQL</span>
        </div>
      </footer>

      {renderPdfNotesDrawer()}
    </div>
  );
}
