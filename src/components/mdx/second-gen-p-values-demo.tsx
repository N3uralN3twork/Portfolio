"use client";

import {
  CircleDotIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  classifySgpv,
  computeSgpv,
  formatCompactNumber,
  normalTheoryComparison,
  type Interval,
  type SgpvClassification,
} from "@/lib/sgpv";
import { cn } from "@/lib/utils";

type Scene = {
  id: string;
  label: string;
  title: string;
  summary: string;
  estimate: Interval;
  takeaway: string;
};

type SgpvSceneExplorerProps = {
  className?: string;
  sceneDurationMs?: number;
};

const nullInterval: Interval = { lo: -0.1, hi: 0.1 };

const scenes: Scene[] = [
  {
    id: "meaningful-effect",
    label: "Meaningful",
    title: "Clear meaningful effect",
    summary: "The full interval sits outside the practical-null region.",
    estimate: { lo: 0.22, hi: 0.38 },
    takeaway:
      "p_delta is 0, so the supported values exclude effects treated as null-sized.",
  },
  {
    id: "trivial-precise",
    label: "Tiny precise",
    title: "Tiny but precisely estimated",
    summary: "The interval is away from exact zero but still inside the null band.",
    estimate: { lo: 0.03, hi: 0.07 },
    takeaway:
      "p_delta is 1: every supported value is practically null, even if a point-null p-value is small.",
  },
  {
    id: "wide-inconclusive",
    label: "Wide",
    title: "Wide and inconclusive",
    summary: "The estimate spans null-sized and meaningful values.",
    estimate: { lo: -0.35, hi: 0.35 },
    takeaway:
      "The result is inconclusive because precision is too low to separate null-sized from meaningful effects.",
  },
  {
    id: "partial-overlap",
    label: "Partial",
    title: "Suggestive, not resolved",
    summary: "Only part of the interval remains inside the practical-null region.",
    estimate: { lo: 0.07, hi: 0.28 },
    takeaway:
      "A small p-value can coexist with uncertainty about whether the effect clears the practical threshold.",
  },
];

const chart = {
  width: 720,
  height: 300,
  paddingX: 56,
  min: -0.42,
  max: 0.42,
} as const;

export function SgpvSceneExplorer({
  className,
  sceneDurationMs = 5200,
}: SgpvSceneExplorerProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeScene = scenes[activeIndex];

  useEffect(() => {
    if (!isPlaying || shouldReduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % scenes.length);
    }, sceneDurationMs);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, sceneDurationMs, shouldReduceMotion]);

  const result = useMemo(() => {
    const sgpv = computeSgpv({
      estimate: activeScene.estimate,
      nullInterval,
    });
    const comparison = normalTheoryComparison({
      estimate: activeScene.estimate,
    });
    const classification = classifySgpv(sgpv.pDelta);

    return {
      classification,
      comparison,
      sgpv,
    };
  }, [activeScene]);

  const selectScene = (index: number) => {
    setActiveIndex(index);
    setIsPlaying(false);
  };

  const reset = () => {
    setActiveIndex(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying((current) => !current);
  };

  const pValueLabel =
    result.comparison.pValue < 0.001
      ? "< 0.001"
      : formatCompactNumber(result.comparison.pValue, 3);

  return (
    <MdxDemoCard className={cn("border-border/80 bg-card/95", className)}>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <CircleDotIcon className="size-3.5" aria-hidden />
              SGPV scene explorer
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Read evidence as interval overlap, not just point-null surprise.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Choose a case to see how the data-supported interval relates to
              the practical-null band. The p-value stays in the background as
              context; p_delta carries the main interpretation.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={togglePlay} size="sm" type="button" variant="outline">
              {isPlaying ? <PauseIcon aria-hidden /> : <PlayIcon aria-hidden />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={reset} size="icon" type="button" variant="ghost">
              <RotateCcwIcon aria-hidden />
              <span className="sr-only">Reset scene explorer</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-background/75 p-3">
            <svg
              aria-label={`${activeScene.title}: estimate interval compared with a practical null interval`}
              className="h-auto w-full"
              role="img"
              viewBox={`0 0 ${chart.width} ${chart.height}`}
            >
              <IntervalAxis />
              <NullBand shouldReduceMotion={shouldReduceMotion} />
              <EstimateInterval
                estimate={activeScene.estimate}
                shouldReduceMotion={shouldReduceMotion}
              />
              <OverlapSegment
                estimate={activeScene.estimate}
                shouldReduceMotion={shouldReduceMotion}
              />
              <text
                className="fill-foreground text-[14px] font-medium"
                x="56"
                y="66"
              >
                practical-null interval
              </text>
              <text
                className="fill-foreground text-[14px] font-medium"
                x="56"
                y="153"
              >
                data-supported interval
              </text>
              <text
                className="fill-muted-foreground text-[12px]"
                x="56"
                y="228"
              >
                highlighted segment = overlap used by p_delta
              </text>
            </svg>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {scenes.map((scene, index) => (
              <button
                aria-pressed={activeIndex === index}
                className={cn(
                  "rounded-lg border bg-background p-3 text-left text-sm transition-colors hover:bg-muted/50",
                  activeIndex === index && "border-foreground",
                )}
                key={scene.id}
                onClick={() => selectScene(index)}
                type="button"
              >
                <span className="font-medium">{scene.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  {scene.summary}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-background p-4"
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              key={activeScene.id}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <SparklesIcon className="size-4 text-muted-foreground" aria-hidden />
                {activeScene.title}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                {activeScene.takeaway}
              </p>
            </motion.div>
          </AnimatePresence>

          <MetricPanel
            detail={classificationLabel(result.classification)}
            label="Second-generation p-value"
            tone={result.classification}
            value={formatCompactNumber(result.sgpv.pDelta, 3)}
          />
          <MetricPanel
            detail={`overlap ${formatCompactNumber(result.sgpv.overlap, 3)}`}
            label="Overlap denominator"
            tone="inconclusive"
            value={formatCompactNumber(result.sgpv.denominator, 3)}
          />
          <MetricPanel
            detail="traditional point-null context"
            label="Two-sided p-value"
            tone="null-supported"
            value={pValueLabel}
          />

          <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-7 text-muted-foreground">
            Practical null: [{formatCompactNumber(nullInterval.lo, 2)},{" "}
            {formatCompactNumber(nullInterval.hi, 2)}]. Estimate interval: [
            {formatCompactNumber(activeScene.estimate.lo, 2)},{" "}
            {formatCompactNumber(activeScene.estimate.hi, 2)}].
            {result.sgpv.deltaGap !== null ? (
              <>
                {" "}
                Delta gap: {formatCompactNumber(result.sgpv.deltaGap, 2)} null
                half-widths.
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function IntervalAxis() {
  const ticks = [-0.4, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.4];

  return (
    <g>
      <line
        className="stroke-border"
        strokeWidth="1"
        x1={chart.paddingX}
        x2={chart.width - chart.paddingX}
        y1="228"
        y2="228"
      />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            className="stroke-border"
            strokeDasharray={tick === 0 ? undefined : "3 7"}
            strokeWidth={tick === 0 ? 2 : 1}
            x1={toChartX(tick)}
            x2={toChartX(tick)}
            y1="48"
            y2="228"
          />
          <text
            className="fill-muted-foreground text-[12px]"
            textAnchor="middle"
            x={toChartX(tick)}
            y="253"
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      <text
        className="fill-muted-foreground text-[12px]"
        textAnchor="middle"
        x={chart.width / 2}
        y="282"
      >
        effect scale
      </text>
    </g>
  );
}

function NullBand({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <motion.rect
      animate={{
        width: toChartX(nullInterval.hi) - toChartX(nullInterval.lo),
        x: toChartX(nullInterval.lo),
      }}
      className="fill-[color:var(--lab-accent)] opacity-25"
      height="56"
      initial={false}
      rx="10"
      transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
      y="78"
    />
  );
}

function EstimateInterval({
  estimate,
  shouldReduceMotion,
}: {
  estimate: Interval;
  shouldReduceMotion: boolean;
}) {
  const center = (estimate.lo + estimate.hi) / 2;

  return (
    <g>
      <motion.line
        animate={{
          x1: toChartX(estimate.lo),
          x2: toChartX(estimate.hi),
        }}
        className="stroke-[color:var(--lab-positive)]"
        initial={false}
        strokeLinecap="round"
        strokeWidth="12"
        transition={{ duration: shouldReduceMotion ? 0 : 0.32 }}
        y1="166"
        y2="166"
      />
      <motion.circle
        animate={{ cx: toChartX(center) }}
        className="fill-foreground stroke-background"
        cy="166"
        initial={false}
        r="8"
        strokeWidth="3"
        transition={{ duration: shouldReduceMotion ? 0 : 0.32 }}
      />
    </g>
  );
}

function OverlapSegment({
  estimate,
  shouldReduceMotion,
}: {
  estimate: Interval;
  shouldReduceMotion: boolean;
}) {
  const overlapLo = Math.max(estimate.lo, nullInterval.lo);
  const overlapHi = Math.min(estimate.hi, nullInterval.hi);
  const width = Math.max(0, toChartX(overlapHi) - toChartX(overlapLo));

  return (
    <motion.rect
      animate={{
        opacity: width > 0 ? 1 : 0,
        width,
        x: toChartX(overlapLo),
      }}
      fill="oklch(0.79 0.16 78)"
      height="14"
      initial={false}
      rx="7"
      transition={{ duration: shouldReduceMotion ? 0 : 0.32 }}
      y="190"
    />
  );
}

function MetricPanel({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: SgpvClassification;
  value: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-background p-4", toneBorder(tone))}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-normal">{value}</p>
      <p className="mt-1 text-xs uppercase text-muted-foreground">{detail}</p>
    </div>
  );
}

function toChartX(value: number) {
  return (
    chart.paddingX +
    ((value - chart.min) / (chart.max - chart.min)) *
      (chart.width - chart.paddingX * 2)
  );
}

function classificationLabel(classification: SgpvClassification) {
  if (classification === "delta-gap") {
    return "interval excludes the null";
  }

  if (classification === "null-supported") {
    return "interval contained in null";
  }

  return "partial overlap";
}

function toneBorder(classification: SgpvClassification) {
  if (classification === "delta-gap") {
    return "border-[color:var(--lab-positive)]";
  }

  if (classification === "null-supported") {
    return "border-destructive";
  }

  return "border-amber-500";
}

export default SgpvSceneExplorer;
