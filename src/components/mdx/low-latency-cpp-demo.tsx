"use client";

import {
  ActivityIcon,
  CpuIcon,
  GaugeIcon,
  MemoryStickIcon,
  TimerIcon,
  ZapIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";

const stages = [
  {
    id: "budget",
    label: "Budget",
    formula: "T_total = sum T_i",
    note: "Start with a measured path and assign a latency budget to each stage before optimizing.",
    p50: 42,
    p99: 190,
  },
  {
    id: "alloc",
    label: "Allocations",
    formula: "new/delete -> pool",
    note: "Move per-message allocation out of the hot path with arenas, object pools, or fixed buffers.",
    p50: 34,
    p99: 138,
  },
  {
    id: "cache",
    label: "Cache locality",
    formula: "cycles ~= misses x penalty",
    note: "Pack hot fields and stream through memory so the CPU spends less time waiting on cache misses.",
    p50: 27,
    p99: 101,
  },
  {
    id: "branch",
    label: "Branches",
    formula: "E[cost] = p_miss C_miss",
    note: "Shape predictable branches and isolate rare paths so misprediction penalties stop dominating.",
    p50: 23,
    p99: 84,
  },
  {
    id: "sharing",
    label: "False sharing",
    formula: "alignas(64)",
    note: "Separate contended atomics and counters so independent cores do not bounce the same cache line.",
    p50: 21,
    p99: 66,
  },
  {
    id: "syscall",
    label: "Syscalls",
    formula: "batch + busy poll",
    note: "Batch kernel crossings and pick wait strategies deliberately instead of hiding latency in syscalls.",
    p50: 19,
    p99: 51,
  },
  {
    id: "tail",
    label: "Tail latency",
    formula: "p99 >> mean",
    note: "The win is not just a lower average. The optimized path compresses the right tail of the distribution.",
    p50: 18,
    p99: 44,
  },
] as const;

const segments = [
  { id: "parse", label: "Parse", base: 30, optimized: 18, color: "var(--lab-accent)" },
  { id: "alloc", label: "Alloc", base: 42, optimized: 8, color: "var(--destructive)" },
  { id: "compute", label: "Compute", base: 54, optimized: 31, color: "var(--lab-positive)" },
  { id: "queue", label: "Queue", base: 38, optimized: 16, color: "var(--muted-foreground)" },
  { id: "syscall", label: "Syscall", base: 26, optimized: 12, color: "var(--foreground)" },
] as const;

const segmentLayout = segments.map((segment, index) => {
  const x =
    32 +
    segments
      .slice(0, index)
      .reduce((sum, item) => sum + item.base * 2.4 + 6, 0);

  return {
    ...segment,
    baseWidth: segment.base * 2.4,
    optimizedWidth: segment.optimized * 2.4,
    x,
  };
});

const cacheCells = Array.from({ length: 16 }, (_, index) => ({
  id: `cell-${index}`,
  hot: [1, 2, 3, 4, 8, 9].includes(index),
  shared: [6, 7].includes(index),
}));

export function LowLatencyCppDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];
  const optimized = stageIndex >= 1;
  const progress = (stageIndex + 1) / stages.length;

  return (
      <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <GaugeIcon className="size-3.5" aria-hidden />
              Low-latency C++ lab
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Remove work from the hot path and watch the tail compress.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Each step mirrors a technique from the post: measurement,
              allocation removal, cache locality, branch predictability, cache
              line isolation, syscall control, and p99 thinking.
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap gap-2 lg:max-w-[36rem] lg:justify-end">
            {stages.map((item, index) => (
              <Button
                key={item.id}
                aria-pressed={stageIndex === index}
                className="h-auto min-h-7 justify-start whitespace-normal px-3 py-1.5 text-left leading-snug"
                onClick={() => setStageIndex(index)}
                size="sm"
                type="button"
                variant={stageIndex === index ? "default" : "outline"}
              >
                {index + 1}. {item.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 rounded-lg border bg-background p-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <HotPathChart
              optimized={optimized}
              reducedMotion={shouldReduceMotion}
              stageIndex={stageIndex}
            />
            <CachePanel stageIndex={stageIndex} reducedMotion={shouldReduceMotion} />
          </div>

          <div className="grid content-start gap-4">
            <StagePanel stage={stage} stageIndex={stageIndex} />
            <LatencyTiles stage={stage} />
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full origin-left rounded-full bg-[color:var(--lab-positive)]"
            initial={false}
            animate={{ scaleX: progress }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          />
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function HotPathChart({
  optimized,
  reducedMotion,
  stageIndex,
}: {
  optimized: boolean;
  reducedMotion: boolean;
  stageIndex: number;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">Hot-path budget</p>
          <p className="text-sm text-muted-foreground">
            Segment widths shrink as work leaves the critical path.
          </p>
        </div>
        <Badge variant="secondary">nanosecond budget</Badge>
      </div>
      <svg
        className="h-auto w-full"
        role="img"
        viewBox="0 0 720 190"
        aria-label="Latency budget segments shrinking after C++ low latency optimizations"
      >
        <Grid />
        <text x="32" y="30" fill="var(--foreground)" fontSize="13" fontWeight="600">
          Baseline
        </text>
        <text x="32" y="110" fill="var(--foreground)" fontSize="13" fontWeight="600">
          Optimized
        </text>
        {segmentLayout.map((segment) => {
          return (
            <g key={segment.id}>
              <rect
                x={segment.x}
                y="44"
                width={segment.baseWidth}
                height="36"
                rx="8"
                fill={segment.color}
                opacity="0.38"
              />
              <motion.rect
                x={segment.x}
                y="124"
                width={optimized ? segment.optimizedWidth : segment.baseWidth}
                height="36"
                rx="8"
                fill={segment.color}
                initial={false}
                animate={{
                  width: optimized ? segment.optimizedWidth : segment.baseWidth,
                  opacity: stageIndex >= 1 ? 0.92 : 0.45,
                }}
                transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeInOut" }}
              />
              <text
                x={segment.x + 8}
                y="68"
                fill="var(--foreground)"
                fontSize="11"
                fontWeight="600"
              >
                {segment.label}
              </text>
              <text
                x={segment.x + 8}
                y="148"
                fill="var(--background)"
                fontSize="11"
                fontWeight="700"
              >
                {segment.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CachePanel({
  reducedMotion,
  stageIndex,
}: {
  reducedMotion: boolean;
  stageIndex: number;
}) {
  return (
    <div className="grid gap-4 rounded-lg border bg-background p-4 md:grid-cols-[1fr_16rem]">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <MemoryStickIcon className="size-4 text-muted-foreground" aria-hidden />
          <p className="font-medium">Cache-line view</p>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {cacheCells.map((cell, index) => {
            const active =
              (stageIndex >= 2 && cell.hot) || (stageIndex >= 4 && cell.shared);

            return (
              <motion.div
                key={cell.id}
                className={cn(
                  "aspect-square rounded border",
                  cell.hot && "bg-[color:var(--lab-positive)]/70",
                  cell.shared && "bg-[color:var(--lab-accent)]/70",
                  !cell.hot && !cell.shared && "bg-muted",
                )}
                initial={false}
                animate={{ scale: active ? 1.05 : 1, opacity: active ? 1 : 0.55 }}
                transition={{
                  delay: reducedMotion ? 0 : index * 0.012,
                  duration: reducedMotion ? 0 : 0.18,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="grid gap-3">
        <Chip label="L1 miss penalty" value={stageIndex >= 2 ? "lower" : "visible"} />
        <Chip label="Branch misses" value={stageIndex >= 3 ? "rare path" : "mixed"} />
        <Chip label="Cache-line bounce" value={stageIndex >= 4 ? "isolated" : "shared"} />
      </div>
    </div>
  );
}

function StagePanel({
  stage,
  stageIndex,
}: {
  stage: (typeof stages)[number];
  stageIndex: number;
}) {
  const Icon =
    stageIndex < 2
      ? TimerIcon
      : stageIndex < 4
        ? CpuIcon
        : stageIndex < 6
          ? ZapIcon
          : ActivityIcon;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <p className="font-medium">{stage.label}</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <p className="font-mono text-sm text-foreground">{stage.formula}</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.note}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function LatencyTiles({ stage }: { stage: (typeof stages)[number] }) {
  return (
    <div className="grid gap-3">
      <motion.div className="rounded-lg border bg-background p-3" layout>
        <p className="text-xs uppercase text-muted-foreground">p50 latency</p>
        <p className="mt-1 text-2xl font-semibold tracking-normal">{stage.p50} ns</p>
      </motion.div>
      <motion.div className="rounded-lg border bg-background p-3" layout>
        <p className="text-xs uppercase text-muted-foreground">p99 latency</p>
        <p className="mt-1 text-2xl font-semibold tracking-normal">{stage.p99} ns</p>
      </motion.div>
      <motion.div className="rounded-lg border bg-background p-3" layout>
        <p className="text-xs uppercase text-muted-foreground">tail ratio</p>
        <p className="mt-1 text-2xl font-semibold tracking-normal">
          {(stage.p99 / stage.p50).toFixed(1)}x
        </p>
      </motion.div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm">{value}</p>
    </div>
  );
}

function Grid() {
  return (
    <g>
      {[160, 280, 400, 520, 640].map((x) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1="36"
          y2="168"
          stroke="var(--border)"
          strokeDasharray="3 8"
        />
      ))}
    </g>
  );
}
