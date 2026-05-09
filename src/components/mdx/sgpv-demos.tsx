"use client";

import {
  ArrowDownUpIcon,
  BracesIcon,
  ChartNoAxesCombinedIcon,
  CircleDotIcon,
  RotateCcwIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
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

const intervalChart = {
  width: 760,
  height: 260,
  paddingX: 54,
  min: -0.7,
  max: 0.7,
} as const;

const intervalPresets = [
  {
    id: "disjoint",
    label: "Disjoint from null",
    center: 0.45,
    halfWidth: 0.1,
    nullHalfWidth: 0.1,
  },
  {
    id: "partial",
    label: "Partial overlap",
    center: 0.15,
    halfWidth: 0.1,
    nullHalfWidth: 0.1,
  },
  {
    id: "inside",
    label: "Inside null",
    center: 0,
    halfWidth: 0.04,
    nullHalfWidth: 0.1,
  },
  {
    id: "wide",
    label: "Wide interval",
    center: 0,
    halfWidth: 0.4,
    nullHalfWidth: 0.1,
  },
] as const;

const appliedResults = [
  { id: "group", label: "Treatment group", lo: Math.log(1.18), hi: Math.log(20.19), pValue: 0.03 },
  { id: "tobacco", label: "Tobacco", lo: Math.log(1.09), hi: Math.log(19.28), pValue: 0.04 },
  { id: "mvo", label: "Microvascular obstruction", lo: Math.log(0.86), hi: Math.log(38.29), pValue: 0.07 },
  { id: "dyslipidemia", label: "Dyslipidemia", lo: Math.log(0.66), hi: Math.log(8.98), pValue: 0.22 },
  { id: "gender", label: "Gender", lo: Math.log(0.36), hi: Math.log(26.92), pValue: 0.3 },
  { id: "age", label: "Age", lo: Math.log(0.95), hi: Math.log(1.11), pValue: 0.56 },
  { id: "hypertension", label: "Hypertension", lo: Math.log(0.09), hi: Math.log(1.59), pValue: 0.19 },
  { id: "screen-a", label: "Screening hit A", lo: 0.52, hi: 0.82, pValue: 0.0008 },
  { id: "screen-b", label: "Screening hit B", lo: 0.09, hi: 0.26, pValue: 0.012 },
  { id: "screen-c", label: "Screening hit C", lo: -0.32, hi: -0.14, pValue: 0.004 },
] as const;

const appliedChart = {
  width: 820,
  rowHeight: 34,
  paddingX: 66,
  paddingY: 30,
  min: -2.8,
  max: 3.1,
} as const;

type AppliedMode = "pvalue" | "sgpv";

export function SgpvIntervalWorkbench() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [center, setCenter] = useState<number>(intervalPresets[1].center);
  const [halfWidth, setHalfWidth] = useState<number>(
    intervalPresets[1].halfWidth,
  );
  const [nullHalfWidth, setNullHalfWidth] = useState<number>(
    intervalPresets[1].nullHalfWidth,
  );

  const estimate = useMemo(
    () => ({ lo: center - halfWidth, hi: center + halfWidth }),
    [center, halfWidth],
  );
  const nullInterval = useMemo(
    () => ({ lo: -nullHalfWidth, hi: nullHalfWidth }),
    [nullHalfWidth],
  );
  const sgpv = useMemo(
    () => computeSgpv({ estimate, nullInterval }),
    [estimate, nullInterval],
  );
  const pValue = useMemo(
    () => normalTheoryComparison({ estimate }).pValue,
    [estimate],
  );
  const classification = classifySgpv(sgpv.pDelta);

  const applyPreset = (preset: (typeof intervalPresets)[number]) => {
    setCenter(preset.center);
    setHalfWidth(preset.halfWidth);
    setNullHalfWidth(preset.nullHalfWidth);
  };

  const reset = () => applyPreset(intervalPresets[1]);

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <BracesIcon className="size-3.5" aria-hidden />
              Interval workbench
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Move an uncertainty interval across an interval null.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              The classical p-value is a tail area under a point null. The
              second-generation p-value, p_delta, is an interval-overlap
              summary: how much of the estimate interval remains compatible
              with null or practically trivial effects.
            </CardDescription>
          </div>
          <Button onClick={reset} size="sm" type="button" variant="outline">
            <RotateCcwIcon aria-hidden />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-background/75 p-3">
            <svg
              aria-label="Animated comparison of a confidence interval and an interval null"
              className="h-auto w-full"
              role="img"
              viewBox={`0 0 ${intervalChart.width} ${intervalChart.height}`}
            >
              <IntervalAxis />
              <motion.rect
                animate={{
                  x: toIntervalX(nullInterval.lo),
                  width: toIntervalX(nullInterval.hi) - toIntervalX(nullInterval.lo),
                }}
                fill="color-mix(in oklch, var(--lab-accent) 32%, transparent)"
                height="54"
                initial={false}
                rx="10"
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                y="72"
              />
              <motion.line
                animate={{
                  x1: toIntervalX(estimate.lo),
                  x2: toIntervalX(estimate.hi),
                }}
                initial={false}
                stroke="var(--lab-positive)"
                strokeLinecap="round"
                strokeWidth="10"
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                y1="160"
                y2="160"
              />
              <motion.circle
                animate={{ cx: toIntervalX(center) }}
                cy="160"
                fill="var(--foreground)"
                initial={false}
                r="8"
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
              />
              <motion.rect
                animate={{
                  opacity: sgpv.overlap > 0 ? 1 : 0,
                  x: toIntervalX(Math.max(estimate.lo, nullInterval.lo)),
                  width:
                    toIntervalX(Math.min(estimate.hi, nullInterval.hi)) -
                    toIntervalX(Math.max(estimate.lo, nullInterval.lo)),
                }}
                fill="oklch(0.79 0.16 78)"
                height="14"
                initial={false}
                rx="7"
                transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                y="182"
              />
              <text fill="var(--foreground)" fontSize="14" x="56" y="64">
                interval null
              </text>
              <text fill="var(--foreground)" fontSize="14" x="56" y="150">
                estimate interval
              </text>
              <text fill="var(--muted-foreground)" fontSize="12" x="56" y="214">
                orange segment = overlap used by p_delta
              </text>
            </svg>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {intervalPresets.map((preset) => (
              <button
                className={cn(
                  "rounded-lg border bg-background p-3 text-left text-sm transition-colors hover:bg-muted/50",
                  center === preset.center &&
                    halfWidth === preset.halfWidth &&
                    nullHalfWidth === preset.nullHalfWidth &&
                    "border-foreground",
                )}
                key={preset.id}
                onClick={() => applyPreset(preset)}
                type="button"
              >
                <span className="font-medium">{preset.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  center {formatCompactNumber(preset.center, 2)}, CI half-width{" "}
                  {formatCompactNumber(preset.halfWidth, 2)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-4">
          <MetricPanel
            label="Second-generation p-value"
            value={formatCompactNumber(sgpv.pDelta, 3)}
            detail={classificationLabel(classification)}
            tone={classification}
          />
          <MetricPanel
            label="Traditional two-sided p-value"
            value={formatCompactNumber(pValue, 4)}
            detail="computed against the point null 0"
            tone="inconclusive"
          />
          <MetricPanel
            label="Overlap length"
            value={formatCompactNumber(sgpv.overlap, 3)}
            detail={`denominator ${formatCompactNumber(sgpv.denominator, 3)}`}
            tone="null-supported"
          />
          <AnimatePresence mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-background p-4 text-sm leading-7 text-muted-foreground"
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              key={classification}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            >
              {classification === "delta-gap" ? (
                <>
                  The interval estimate misses the null region. The delta gap is{" "}
                  {formatCompactNumber(sgpv.deltaGap ?? 0, 2)} null half-widths,
                  so the result is not merely outside the null; it is separated
                  from it.
                </>
              ) : null}
              {classification === "inconclusive" ? (
                <>
                  The estimate overlaps the null region but also extends beyond
                  it. SGPV treats this as incomplete information rather than a
                  forced reject-or-retain decision.
                </>
              ) : null}
              {classification === "null-supported" ? (
                <>
                  The estimate interval is contained in the interval null. The
                  data are compatible only with null or practically trivial
                  effects at this interval resolution.
                </>
              ) : null}
            </motion.div>
          </AnimatePresence>
          <RangeControl
            label="Estimate center"
            max={0.55}
            min={-0.55}
            onChange={setCenter}
            step={0.01}
            value={center}
          />
          <RangeControl
            label="Estimate half-width"
            max={0.45}
            min={0.04}
            onChange={setHalfWidth}
            step={0.01}
            value={halfWidth}
          />
          <RangeControl
            label="Null half-width"
            max={0.3}
            min={0.04}
            onChange={setNullHalfWidth}
            step={0.01}
            value={nullHalfWidth}
          />
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

export function SgpvAppliedResultsPath() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [mode, setMode] = useState<AppliedMode>("pvalue");
  const nullInterval = useMemo(
    () => ({ lo: Math.log(1 / 1.1), hi: Math.log(1.1) }),
    [],
  );
  const rows = useMemo(() => {
    const enriched = appliedResults.map((row) => {
      const estimate: Interval = { lo: row.lo, hi: row.hi };
      const sgpv = computeSgpv({ estimate, nullInterval });
      const classification = classifySgpv(sgpv.pDelta);

      return {
        ...row,
        center: (row.lo + row.hi) / 2,
        sgpv,
        classification,
      };
    });

    return enriched.toSorted((a, b) => {
      if (mode === "pvalue") {
        return a.pValue - b.pValue;
      }

      return a.sgpv.pDelta - b.sgpv.pDelta || a.pValue - b.pValue;
    });
  }, [mode, nullInterval]);
  const height =
    appliedChart.paddingY * 2 + rows.length * appliedChart.rowHeight;

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <ChartNoAxesCombinedIcon className="size-3.5" aria-hidden />
              Applied results path
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Classical ranking and SGPV ranking answer different questions.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              These intervals combine logistic-regression-style odds ratios and
              screening-style effects. Toggle the ordering to see how practical
              relevance changes the story after tail-area sorting.
            </CardDescription>
          </div>
          <div className="flex rounded-lg border bg-background p-1">
            <ModeButton
              active={mode === "pvalue"}
              icon={<ArrowDownUpIcon aria-hidden />}
              label="p-value rank"
              onClick={() => setMode("pvalue")}
            />
            <ModeButton
              active={mode === "sgpv"}
              icon={<CircleDotIcon aria-hidden />}
              label="SGPV status"
              onClick={() => setMode("sgpv")}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-background/75 p-3">
          <svg
            aria-label="Animated applied results path comparing p-value ranking with second-generation p-value status"
            className="h-auto w-full"
            role="img"
            viewBox={`0 0 ${appliedChart.width} ${height}`}
          >
            <AppliedAxis height={height} nullInterval={nullInterval} />
            {rows.map((row, index) => {
              const y = appliedChart.paddingY + index * appliedChart.rowHeight;
              const color = classificationColor(row.classification);

              return (
                <motion.g
                  animate={{ y }}
                  initial={false}
                  key={row.id}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    ease: "easeInOut",
                  }}
                >
                  <text
                    fill="var(--foreground)"
                    fontSize="12"
                    textAnchor="end"
                    x="58"
                    y="5"
                  >
                    {index + 1}
                  </text>
                  <motion.line
                    animate={{
                      x1: toAppliedX(row.lo),
                      x2: toAppliedX(row.hi),
                    }}
                    initial={false}
                    stroke={color}
                    strokeLinecap="round"
                    strokeWidth="8"
                    transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                    y1="0"
                    y2="0"
                  />
                  <circle cx={toAppliedX(row.center)} cy="0" fill="var(--foreground)" r="4" />
                  <text fill="var(--muted-foreground)" fontSize="12" x="690" y="5">
                    {row.label}
                  </text>
                  <text fill="var(--muted-foreground)" fontSize="12" x="690" y="20">
                    p={formatCompactNumber(row.pValue, 4)} · p_delta=
                    {formatCompactNumber(row.sgpv.pDelta, 3)}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <LegendTile
            color="var(--lab-positive)"
            label="p_delta = 0"
            text="Interval estimate excludes the interval null; report delta gap."
          />
          <LegendTile
            color="oklch(0.79 0.16 78)"
            label="0 < p_delta < 1"
            text="Evidence is mixed because the uncertainty interval overlaps the null."
          />
          <LegendTile
            color="oklch(0.62 0.22 28)"
            label="p_delta = 1"
            text="Interval estimate is contained in the null region."
          />
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function IntervalAxis() {
  const ticks = [-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6];

  return (
    <g>
      <line
        stroke="var(--border)"
        strokeWidth="1"
        x1={intervalChart.paddingX}
        x2={intervalChart.width - intervalChart.paddingX}
        y1="214"
        y2="214"
      />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            stroke="var(--border)"
            strokeWidth="1"
            x1={toIntervalX(tick)}
            x2={toIntervalX(tick)}
            y1="48"
            y2="214"
          />
          <text
            fill="var(--muted-foreground)"
            fontSize="12"
            textAnchor="middle"
            x={toIntervalX(tick)}
            y="238"
          >
            {tick.toFixed(1)}
          </text>
        </g>
      ))}
      <line
        stroke="var(--foreground)"
        strokeDasharray="4 6"
        strokeWidth="2"
        x1={toIntervalX(0)}
        x2={toIntervalX(0)}
        y1="48"
        y2="214"
      />
    </g>
  );
}

function AppliedAxis({
  height,
  nullInterval,
}: {
  height: number;
  nullInterval: Interval;
}) {
  const ticks = [-2, -1, 0, 1, 2, 3];

  return (
    <g>
      <rect
        fill="color-mix(in oklch, var(--lab-accent) 24%, transparent)"
        height={height - appliedChart.paddingY}
        rx="8"
        width={toAppliedX(nullInterval.hi) - toAppliedX(nullInterval.lo)}
        x={toAppliedX(nullInterval.lo)}
        y="12"
      />
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            stroke="var(--border)"
            strokeDasharray="2 7"
            x1={toAppliedX(tick)}
            x2={toAppliedX(tick)}
            y1="10"
            y2={height - 8}
          />
          <text
            fill="var(--muted-foreground)"
            fontSize="12"
            textAnchor="middle"
            x={toAppliedX(tick)}
            y={height - 2}
          >
            {tick}
          </text>
        </g>
      ))}
      <text fill="var(--muted-foreground)" fontSize="12" x="66" y="18">
        log effect scale; shaded band is log(0.91) to log(1.10)
      </text>
    </g>
  );
}

function RangeControl({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
}) {
  return (
    <label className="grid gap-2 rounded-lg border bg-background p-3 text-sm">
      <span className="flex items-center justify-between gap-4">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {formatCompactNumber(value, 2)}
        </span>
      </span>
      <input
        className="accent-foreground"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
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

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-foreground text-background" : "text-muted-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function LegendTile({
  color,
  label,
  text,
}: {
  color: string;
  label: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          aria-hidden
          className="size-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function toIntervalX(value: number) {
  return (
    intervalChart.paddingX +
    ((value - intervalChart.min) / (intervalChart.max - intervalChart.min)) *
      (intervalChart.width - intervalChart.paddingX * 2)
  );
}

function toAppliedX(value: number) {
  return (
    appliedChart.paddingX +
    ((value - appliedChart.min) / (appliedChart.max - appliedChart.min)) *
      (appliedChart.width - appliedChart.paddingX * 2 - 160)
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

function classificationColor(classification: SgpvClassification) {
  if (classification === "delta-gap") {
    return "var(--lab-positive)";
  }

  if (classification === "null-supported") {
    return "oklch(0.62 0.22 28)";
  }

  return "oklch(0.79 0.16 78)";
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
