"use client";

// =============================================================================
// VoiceVisualizer — Modern Black & Emerald Audio Workstation (Zero Emojis)
// =============================================================================

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Radio, Volume2, Cpu, AudioLines, CircleDot, LucideIcon } from "lucide-react";

export type AgentState = "idle" | "initializing" | "listening" | "thinking" | "speaking";

interface VoiceVisualizerProps {
  state: AgentState;
  /** Audio level 0–1 */
  audioLevel?: number;
}

interface StateStyle {
  label: string;
  icon: LucideIcon;
  pillColor: string;
  orbBg: string;
  orbBorder: string;
  ringColor: string;
  glowColor: string;
  pulse: boolean;
}

const STATE_CONFIG: Record<AgentState, StateStyle> = {
  idle: {
    label: "STANDBY",
    icon: CircleDot,
    pillColor: "border-zinc-800 bg-zinc-900/60 text-zinc-400",
    orbBg: "bg-zinc-950",
    orbBorder: "border-zinc-800",
    ringColor: "ring-zinc-800/40",
    glowColor: "shadow-none",
    pulse: false,
  },
  initializing: {
    label: "SYNCHRONIZING",
    icon: Radio,
    pillColor: "border-emerald-500/30 bg-emerald-950/30 text-emerald-400",
    orbBg: "bg-emerald-950/40",
    orbBorder: "border-emerald-500/50",
    ringColor: "ring-emerald-500/30",
    glowColor: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    pulse: true,
  },
  listening: {
    label: "LISTENING • SPEAK FREELY",
    icon: AudioLines,
    pillColor: "border-emerald-500/40 bg-emerald-950/40 text-emerald-300",
    orbBg: "bg-emerald-950/60",
    orbBorder: "border-emerald-500/70",
    ringColor: "ring-emerald-400/40",
    glowColor: "shadow-[0_0_40px_rgba(16,185,129,0.4)]",
    pulse: true,
  },
  thinking: {
    label: "PROCESSING",
    icon: Cpu,
    pillColor: "border-emerald-400/30 bg-zinc-900 text-emerald-300",
    orbBg: "bg-zinc-900",
    orbBorder: "border-emerald-400/60",
    ringColor: "ring-emerald-400/30",
    glowColor: "shadow-[0_0_35px_rgba(16,185,129,0.25)]",
    pulse: true,
  },
  speaking: {
    label: "TRANSMITTING • AI ACTIVE",
    icon: Volume2,
    pillColor: "border-emerald-400/60 bg-emerald-500/20 text-emerald-200",
    orbBg: "bg-emerald-950",
    orbBorder: "border-emerald-400",
    ringColor: "ring-emerald-400/60",
    glowColor: "shadow-[0_0_55px_rgba(16,185,129,0.55)]",
    pulse: true,
  },
};

export function VoiceVisualizer({ state, audioLevel = 0 }: VoiceVisualizerProps) {
  const config = STATE_CONFIG[state];
  const IconComponent = config.icon;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  // Audio-reactive visualizer waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BAR_COUNT = 28;
    const MAX_HEIGHT = 44;

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isLive = state === "speaking" || state === "listening";
      phaseRef.current += isLive ? 0.09 : 0.02;

      const barWidth = canvas.width / BAR_COUNT;
      const centerY = canvas.height / 2;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Distance from center for symmetrical soundwave aesthetic
        const distFromCenter = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
        const centerFactor = 1 - distFromCenter * 0.4;

        const wave = Math.sin(phaseRef.current + i * 0.35) * 0.5 + 0.5;
        const normalizedLevel = Math.min(1, Math.max(0, audioLevel));

        const intensity = isLive
          ? (wave * 0.45 + normalizedLevel * 0.55) * centerFactor
          : 0.06;

        const h = Math.max(3, intensity * MAX_HEIGHT);
        const x = i * barWidth + barWidth * 0.18;
        const y = centerY - h / 2;

        if (state === "speaking") {
          // Neon emerald gradient
          const gradient = ctx.createLinearGradient(0, y, 0, y + h);
          gradient.addColorStop(0, "rgba(52, 211, 153, 0.95)"); // emerald-400
          gradient.addColorStop(0.5, "rgba(16, 185, 129, 0.85)"); // emerald-500
          gradient.addColorStop(1, "rgba(5, 150, 105, 0.95)"); // emerald-600
          ctx.fillStyle = gradient;
        } else if (state === "listening") {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + intensity * 0.6})`;
        } else {
          ctx.fillStyle = "rgba(63, 63, 70, 0.4)"; // muted zinc
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth * 0.64, h, 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [state, audioLevel]);

  return (
    <div className="flex flex-col items-center gap-7 select-none">
      {/* Central Interactive Orb with Concentric Radar Rings */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient radar ring 2 */}
        <div
          className={cn(
            "absolute rounded-full border border-emerald-500/20 transition-all duration-700 pointer-events-none",
            config.pulse ? "w-44 h-44 animate-ping opacity-20" : "w-36 h-36 opacity-0"
          )}
        />

        {/* Outer ambient radar ring 1 */}
        <div
          className={cn(
            "absolute rounded-full ring-2 transition-all duration-500 pointer-events-none",
            config.ringColor,
            config.pulse ? "w-36 h-36 opacity-60" : "w-32 h-32 opacity-10"
          )}
        />

        {/* Core glowing orb */}
        <div
          className={cn(
            "relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-xl",
            config.orbBg,
            config.orbBorder,
            config.glowColor
          )}
        >
          <div className="w-20 h-20 rounded-full bg-black/40 border border-emerald-500/20 flex items-center justify-center shadow-inner">
            <IconComponent
              className={cn(
                "w-9 h-9 transition-all duration-300",
                state === "speaking"
                  ? "text-emerald-300 scale-110 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  : state === "listening"
                  ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : state === "initializing"
                  ? "text-emerald-400 animate-pulse"
                  : "text-zinc-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Realtime Waveform Canvas */}
      <div className="px-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-900 backdrop-blur-sm shadow-inner">
        <canvas
          ref={canvasRef}
          width={280}
          height={48}
          className="rounded-lg block"
          aria-label="Real-time voice stream visualizer"
        />
      </div>

      {/* Telemetry Status Badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-wider border shadow-sm backdrop-blur-md transition-all duration-300",
          config.pillColor
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            state === "idle"
              ? "bg-zinc-600"
              : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
            config.pulse && "animate-pulse"
          )}
        />
        <span>{config.label}</span>
      </div>
    </div>
  );
}
