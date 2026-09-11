"use client";

import {
  ActivityIcon,
  BracesIcon,
  ChartNoAxesCombinedIcon,
  CpuIcon,
  DatabaseIcon,
  PauseIcon,
  PlayIcon,
  SigmaIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  type FocusEvent,
  type PointerEvent,
  useEffect,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type StageId = "events" | "quality" | "features" | "serving" | "decision";

type PipelineStage = {
  id: StageId;
  title: string;
  label: string;
  metric: string;
  metricLabel: string;
  status: string;
  description: string;
  left: string;
  top: string;
  icon: typeof DatabaseIcon;
};

const stages: readonly PipelineStage[] = [
  {
    id: "events",
    title: "Incoming events",
    label: "Events",
    metric: "52.4k/min",
    metricLabel: "sample event rate",
    status: "stream visible",
    description:
      "Capture operating signals without losing the context that makes a downstream decision useful.",
    left: "12%",
    top: "61%",
    icon: DatabaseIcon,
  },
  {
    id: "quality",
    title: "Quality gate",
    label: "Quality",
    metric: "99.7%",
    metricLabel: "sample contract pass",
    status: "guarded",
    description:
      "Check freshness, shape, and completeness before noisy data changes the model's view of reality.",
    left: "32%",
    top: "28%",
    icon: BracesIcon,
  },
  {
    id: "features",
    title: "Feature plane",
    label: "Features",
    metric: "2.4ms",
    metricLabel: "sample transform time",
    status: "fresh",
    description:
      "Turn validated inputs into a stable, inspectable representation for evaluation and serving.",
    left: "54%",
    top: "28%",
    icon: SigmaIcon,
  },
  {
    id: "serving",
    title: "Model serving",
    label: "Serving",
    metric: "p95 12ms",
    metricLabel: "sample response time",
    status: "within budget",
    description:
      "Keep predictions on a measured path where latency, fallbacks, and behavior stay observable.",
    left: "70%",
    top: "66%",
    icon: CpuIcon,
  },
  {
    id: "decision",
    title: "Decision signal",
    label: "Decision",
    metric: "0.94",
    metricLabel: "sample confidence signal",
    status: "inspectable",
    description:
      "Deliver a decision with context to act on it, question it, and improve the next pass.",
    left: "88%",
    top: "42%",
    icon: ChartNoAxesCombinedIcon,
  },
];

const connections = [
  { from: "events", to: "quality", d: "M 88 166 C 122 164 132 108 166 96" },
  { from: "quality", to: "features", d: "M 228 96 C 250 96 270 96 292 96" },
  { from: "features", to: "serving", d: "M 350 104 C 380 112 378 160 394 171" },
  { from: "serving", to: "decision", d: "M 438 167 C 450 132 464 115 482 111" },
] as const satisfies readonly { from: StageId; to: StageId; d: string }[];

const guidedLoopInterval = 3600;

export function HeroVisual() {
  const reducedMotion = useReducedMotion() ?? false;
  const [activeStageId, setActiveStageId] = useState<StageId>("events");
  const [playing, setPlaying] = useState(true);
  const [exploring, setExploring] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sceneX = useSpring(pointerX, { damping: 26, stiffness: 190 });
  const sceneY = useSpring(pointerY, { damping: 26, stiffness: 190 });
  const rotateX = useTransform(sceneY, [-7, 7], [1.2, -1.2]);
  const rotateY = useTransform(sceneX, [-7, 7], [-1.2, 1.2]);
  const activeStage =
    stages.find((stage) => stage.id === activeStageId) ?? stages[0];

  useEffect(() => {
    if (reducedMotion || !playing || exploring) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveStageId((current) => {
        const index = stages.findIndex((stage) => stage.id === current);
        return stages[(index + 1) % stages.length].id;
      });
    }, guidedLoopInterval);

    return () => window.clearInterval(timer);
  }, [exploring, playing, reducedMotion]);

  const selectStage = (stage: PipelineStage, manuallySelected: boolean) => {
    setActiveStageId(stage.id);

    if (manuallySelected) {
      setPlaying(false);
      setAnnouncement(
        [
          stage.title,
          stage.status,
          stage.metricLabel + ": " + stage.metric,
          stage.description,
        ].join(". "),
      );
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || reducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 8);
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setExploring(false);
    }
  };

  return (
    <section
      aria-label="Interactive illustrative ML quality pipeline"
      className="hero-control-room relative min-h-[440px] overflow-hidden rounded-xl border p-4 shadow-sm sm:p-5"
      onBlurCapture={handleBlur}
      onFocusCapture={() => setExploring(true)}
      onPointerEnter={() => setExploring(true)}
      onPointerLeave={() => {
        pointerX.set(0);
        pointerY.set(0);
        setExploring(false);
      }}
      onPointerMove={handlePointerMove}
    >
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-[color:var(--hero-line)] pb-3 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[color:var(--hero-muted)]">
        <span className="whitespace-nowrap font-mono text-[0.62rem] tracking-[0.1em]">
          model-quality / loop-024
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">illustrative telemetry</span>
          <button
            aria-label={playing ? "Pause guided pipeline animation" : "Play guided pipeline animation"}
            aria-pressed={!playing}
            className="grid size-7 place-items-center rounded-md border border-[color:var(--hero-line)] bg-[color:var(--hero-raised)] text-[color:var(--hero-ink)] transition-colors hover:bg-[color:var(--hero-highlight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lab-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hero-surface)]"
            onClick={() => {
              setPlaying((current) => !current);
              setAnnouncement("");
            }}
            type="button"
          >
            {playing ? (
              <PauseIcon className="size-3.5" aria-hidden />
            ) : (
              <PlayIcon className="size-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-4 [perspective:900px]">
        <motion.div
          className="relative h-[236px] overflow-hidden rounded-lg border border-[color:var(--hero-line)] bg-[color:var(--hero-raised)] sm:h-[248px]"
          style={{ rotateX, rotateY, x: sceneX, y: sceneY }}
        >
          <PipelineMap
            activeStageId={activeStageId}
            playing={playing}
            reducedMotion={reducedMotion}
          />
          <div className="absolute inset-0 sm:hidden" aria-hidden>
            {stages.map((stage) => (
              <PipelineNode active={stage.id === activeStageId} key={stage.id} stage={stage} />
            ))}
          </div>
          <div className="absolute inset-0 hidden sm:block">
            {stages.map((stage) => (
              <PipelineNode
                active={stage.id === activeStageId}
                key={stage.id}
                onFocus={() => selectStage(stage, false)}
                onHover={() => selectStage(stage, false)}
                onSelect={() => selectStage(stage, true)}
                stage={stage}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[color:var(--hero-muted)]">
            <span>{playing ? "guided loop live" : "guided loop paused"}</span>
            <span className="hidden sm:inline">hover a node to inspect</span>
          </div>
        </motion.div>
      </div>

      <div aria-label="Select a pipeline stage" className="relative z-10 mt-3 grid grid-cols-5 gap-1 sm:hidden" role="group">
        {stages.map((stage) => {
          const Icon = stage.icon;
          const active = stage.id === activeStageId;

          return (
            <button
              aria-label={stage.title + " stage: " + stage.status}
              aria-pressed={active}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-md border px-1 text-[0.58rem] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lab-accent)]",
                active
                  ? "border-[color:var(--lab-accent)] bg-[color:var(--lab-accent)]/12 text-[color:var(--hero-ink)]"
                  : "border-[color:var(--hero-line)] bg-[color:var(--hero-raised)] text-[color:var(--hero-muted)]",
              )}
              key={stage.id}
              onClick={() => selectStage(stage, true)}
              type="button"
            >
              <Icon className="size-3.5" aria-hidden />
              <span>{stage.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-3">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3 rounded-lg border border-[color:var(--hero-line)] bg-[color:var(--hero-raised)] p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            key={activeStage.id}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <div>
              <div className="flex items-center gap-2">
                <ActivityIcon className="size-3.5 text-[color:var(--lab-positive)]" aria-hidden />
                <p className="text-xs font-semibold text-[color:var(--hero-ink)]">{activeStage.title}</p>
                <span className="rounded-full bg-[color:var(--lab-positive)]/12 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-[color:var(--hero-ink)]">
                  {activeStage.status}
                </span>
              </div>
              <p className="mt-1 max-w-[32rem] text-xs leading-5 text-[color:var(--hero-muted)]">
                {activeStage.description}
              </p>
            </div>
            <div className="rounded-md border border-[color:var(--hero-line)] bg-[color:var(--hero-highlight)] px-3 py-2 sm:min-w-28">
              <p className="font-mono text-sm font-semibold text-[color:var(--hero-ink)]">{activeStage.metric}</p>
              <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-[color:var(--hero-muted)]">
                {activeStage.metricLabel}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <p aria-live="polite" className="sr-only">{announcement}</p>
    </section>
  );
}

function PipelineMap({
  activeStageId,
  playing,
  reducedMotion,
}: {
  activeStageId: StageId;
  playing: boolean;
  reducedMotion: boolean;
}) {
  return (
    <svg
      aria-label="Illustrative data pipeline from incoming events to a decision signal, with quality feedback returning to the system"
      className="absolute inset-0 h-full w-full"
      role="img"
      viewBox="0 0 520 250"
    >
      <defs>
        <pattern height="20" id="quality-loop-grid" patternUnits="userSpaceOnUse" width="20">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--hero-grid)" strokeWidth="0.7" />
        </pattern>
        <linearGradient id="quality-loop-flow" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--lab-accent)" />
          <stop offset="100%" stopColor="var(--lab-positive)" />
        </linearGradient>
        <radialGradient id="quality-loop-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--lab-accent)" stopOpacity="0.24" />
          <stop offset="100%" stopColor="var(--lab-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect fill="url(#quality-loop-grid)" height="250" width="520" />
      <ellipse cx="344" cy="86" fill="url(#quality-loop-glow)" rx="170" ry="104" />
      {connections.map((connection) => {
        const connected = connection.from === activeStageId || connection.to === activeStageId;

        return (
          <motion.path
            animate={{ opacity: connected ? 1 : 0.38, pathLength: 1 }}
            d={connection.d}
            fill="none"
            initial={false}
            key={connection.from + "-" + connection.to}
            stroke="url(#quality-loop-flow)"
            strokeLinecap="round"
            strokeWidth={connected ? 2.6 : 1.5}
            transition={{ duration: reducedMotion ? 0 : 0.32 }}
          />
        );
      })}
      <motion.path
        animate={{ opacity: activeStageId === "decision" ? 0.92 : 0.46 }}
        d="M 490 127 C 431 232 210 235 170 117"
        fill="none"
        initial={false}
        stroke="var(--lab-accent)"
        strokeDasharray="4 9"
        strokeLinecap="round"
        strokeWidth="1.5"
        transition={{ duration: reducedMotion ? 0 : 0.32 }}
      />
      {reducedMotion ? <circle cx="292" cy="96" fill="var(--lab-positive)" r="3.5" /> : <PacketFlow playing={playing} />}
    </svg>
  );
}

function PacketFlow({ playing }: { playing: boolean }) {
  const packetMotion = (cx: number[], cy: number[], delay: number, color: string) => (
    <motion.circle
      animate={playing ? { cx, cy, opacity: [0, 1, 1, 0] } : { opacity: 0.22 }}
      cx={cx[0]}
      cy={cy[0]}
      fill={color}
      r="3.5"
      transition={{ delay, duration: 2.8, ease: "linear", repeat: playing ? Infinity : 0 }}
    />
  );

  return (
    <g>
      {packetMotion([92, 125, 151, 173], [164, 151, 117, 96], 0, "var(--lab-accent)")}
      {packetMotion([232, 258, 285, 313], [96, 96, 96, 100], 0.75, "var(--lab-positive)")}
      {packetMotion([438, 452, 466, 482], [167, 140, 119, 111], 1.5, "var(--lab-accent)")}
    </g>
  );
}

function PipelineNode({
  active,
  onFocus,
  onHover,
  onSelect,
  stage,
}: {
  active: boolean;
  onFocus?: () => void;
  onHover?: () => void;
  onSelect?: () => void;
  stage: PipelineStage;
}) {
  const Icon = stage.icon;
  const className = cn(
    "hero-pipeline-node absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-lg px-2 py-2 text-center sm:w-24",
    active && "hero-pipeline-node-active",
  );
  const style = { left: stage.left, top: stage.top };
  const contents = (
    <>
      <Icon className="size-3.5" aria-hidden />
      <span className="text-[0.58rem] font-semibold leading-tight sm:text-[0.65rem]">{stage.label}</span>
    </>
  );

  if (!onSelect) {
    return (
      <motion.div
        animate={{ scale: active ? 1.04 : 1, y: active ? -2 : 0 }}
        className={className}
        initial={false}
        style={style}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
      >
        {contents}
      </motion.div>
    );
  }

  return (
    <motion.button
      animate={{ scale: active ? 1.04 : 1, y: active ? -2 : 0 }}
      aria-label={stage.title + " stage: " + stage.status}
      aria-pressed={active}
      className={cn(
        className,
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lab-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--hero-surface)]",
      )}
      initial={false}
      onClick={onSelect}
      onFocus={onFocus}
      onMouseEnter={onHover}
      style={style}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      type="button"
      whileHover={{ scale: 1.04, y: -2 }}
    >
      {contents}
    </motion.button>
  );
}
