"use client";

import {
  GitBranchIcon,
  LayersIcon,
  ShuffleIcon,
  TreesIcon,
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

const stages = [
  {
    id: "bootstrap",
    label: "Bootstrap",
    formula: "D_b ~ sample_n(D)",
    note: "Each tree sees a resampled dataset, so some rows repeat and others become out-of-bag checks.",
  },
  {
    id: "splits",
    label: "Feature splits",
    formula: "m_try < p",
    note: "At every split, the tree considers only a random subset of features to decorrelate tree errors.",
  },
  {
    id: "trees",
    label: "Tree ensemble",
    formula: "f_b(x)",
    note: "Deep trees keep low bias while randomness stops them from making identical mistakes.",
  },
  {
    id: "vote",
    label: "Majority vote",
    formula: "mode_b f_b(x)",
    note: "Classification uses the most common tree vote; regression averages the tree predictions.",
  },
  {
    id: "oob",
    label: "OOB error",
    formula: "1/n sum L(y_i, f_-i(x_i))",
    note: "Rows left out of a bootstrap sample estimate generalization without a separate validation split.",
  },
  {
    id: "variance",
    label: "Variance",
    formula: "rho sigma^2 + (1-rho)sigma^2/B",
    note: "More trees shrink independent variance; feature randomness targets the correlated part rho.",
  },
] as const;

const samples = [
  { id: "r1", x: 64, y: 38, className: "bg-[color:var(--lab-accent)]" },
  { id: "r2", x: 138, y: 72, className: "bg-[color:var(--lab-positive)]" },
  { id: "r3", x: 210, y: 44, className: "bg-[color:var(--lab-accent)]" },
  { id: "r4", x: 284, y: 82, className: "bg-[color:var(--lab-positive)]" },
  { id: "r5", x: 356, y: 48, className: "bg-[color:var(--lab-accent)]" },
  { id: "r6", x: 432, y: 74, className: "bg-[color:var(--lab-positive)]" },
] as const;

const treeVotes = [
  { id: "t1", x: 86, y: 212, vote: "A", activeFrom: 2 },
  { id: "t2", x: 166, y: 190, vote: "B", activeFrom: 2 },
  { id: "t3", x: 246, y: 218, vote: "B", activeFrom: 2 },
  { id: "t4", x: 326, y: 196, vote: "B", activeFrom: 2 },
  { id: "t5", x: 406, y: 214, vote: "A", activeFrom: 2 },
] as const;

export function RandomForestDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [stageIndex, setStageIndex] = useState(0);
  const stage = stages[stageIndex];
  const progress = (stageIndex + 1) / stages.length;

  return (
    <Card className="not-prose my-10 overflow-hidden border-border/80 bg-card/95">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <TreesIcon className="size-3.5" aria-hidden />
              Random forest lab
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Watch bootstrap randomness become a lower-variance ensemble.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Step through the same quantities used in the article: bootstrap
              samples, feature subsampling, OOB scoring, majority vote, and the
              variance formula.
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[28rem]">
            {stages.map((item, index) => (
              <Button
                key={item.id}
                aria-pressed={stageIndex === index}
                className="justify-start"
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
        <div className="grid gap-5 rounded-lg border bg-background p-4 xl:grid-cols-[1fr_18rem]">
          <div className="relative overflow-hidden rounded-lg border bg-muted/20">
            <svg
              className="h-auto w-full"
              role="img"
              viewBox="0 0 520 310"
              aria-label="Random forest process from bootstrap data to ensemble vote and variance reduction"
            >
              <Grid />
              <motion.rect
                x="36"
                y="28"
                width="448"
                height="84"
                rx="12"
                fill="var(--background)"
                stroke="var(--border)"
                initial={false}
                animate={{ opacity: stageIndex >= 0 ? 1 : 0.3 }}
              />
              <text x="52" y="56" fill="var(--foreground)" fontSize="13" fontWeight="600">
                Original rows D
              </text>
              {samples.map((sample, index) => {
                const isRepeated = stageIndex >= 0 && index % 2 === 1;
                const isOob = stageIndex >= 4 && index === 4;

                return (
                  <motion.g
                    key={sample.id}
                    initial={false}
                    animate={{
                      opacity: isOob ? 0.42 : 1,
                      scale: isRepeated ? 1.16 : 1,
                    }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
                  >
                    <circle
                      cx={sample.x}
                      cy={sample.y}
                      r="12"
                      fill={index % 2 === 0 ? "var(--lab-accent)" : "var(--lab-positive)"}
                    />
                    {isOob && (
                      <circle
                        cx={sample.x}
                        cy={sample.y}
                        r="18"
                        fill="none"
                        stroke="var(--foreground)"
                        strokeDasharray="4 4"
                      />
                    )}
                  </motion.g>
                );
              })}

              <ArrowMarker />
              <motion.path
                d="M260 118 C260 138 260 140 260 158"
                fill="none"
                markerEnd="url(#rf-arrow)"
                stroke="var(--muted-foreground)"
                strokeWidth="2"
                initial={false}
                animate={{ pathLength: stageIndex >= 1 ? 1 : 0.4, opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
              />

              <motion.rect
                x="36"
                y="160"
                width="448"
                height="112"
                rx="12"
                fill="var(--background)"
                stroke="var(--border)"
                initial={false}
                animate={{ opacity: stageIndex >= 2 ? 1 : 0.55 }}
              />
              <text x="52" y="186" fill="var(--foreground)" fontSize="13" fontWeight="600">
                Decorrelated trees
              </text>

              {treeVotes.map((tree, index) => {
                const active = stageIndex >= tree.activeFrom;
                const voted = stageIndex >= 3;

                return (
                  <motion.g
                    key={tree.id}
                    initial={false}
                    animate={{
                      opacity: active ? 1 : 0.24,
                      y: active ? 0 : 10,
                    }}
                    transition={{
                      delay: shouldReduceMotion ? 0 : index * 0.05,
                      duration: shouldReduceMotion ? 0 : 0.32,
                    }}
                  >
                    <path
                      d={`M${tree.x} ${tree.y - 28} L${tree.x - 24} ${tree.y + 20} L${tree.x + 24} ${tree.y + 20} Z`}
                      fill={tree.vote === "B" ? "var(--lab-positive)" : "var(--lab-accent)"}
                      opacity="0.9"
                    />
                    <line
                      x1={tree.x}
                      x2={tree.x}
                      y1={tree.y + 20}
                      y2={tree.y + 42}
                      stroke="var(--muted-foreground)"
                      strokeWidth="3"
                    />
                    <text
                      x={tree.x}
                      y={tree.y + 6}
                      fill="var(--background)"
                      fontSize="15"
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {voted ? tree.vote : "?"}
                    </text>
                  </motion.g>
                );
              })}

              <AnimatePresence mode="wait">
                <motion.g
                  key={stage.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
                >
                  <rect
                    x="174"
                    y="272"
                    width="172"
                    height="28"
                    rx="14"
                    fill="var(--foreground)"
                  />
                  <text
                    x="260"
                    y="291"
                    fill="var(--background)"
                    fontSize="12"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {stage.formula}
                  </text>
                </motion.g>
              </AnimatePresence>
            </svg>
          </div>

          <div className="grid content-start gap-4">
            <StagePanel stage={stage} stageIndex={stageIndex} />
            <MetricStack stageIndex={stageIndex} />
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
    </Card>
  );
}

function StagePanel({
  stage,
  stageIndex,
}: {
  stage: (typeof stages)[number];
  stageIndex: number;
}) {
  const Icon = stageIndex < 2 ? ShuffleIcon : stageIndex < 4 ? GitBranchIcon : LayersIcon;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <p className="font-medium">{stage.label}</p>
      </div>
      <p className="font-mono text-sm text-foreground">{stage.formula}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.note}</p>
    </div>
  );
}

function MetricStack({ stageIndex }: { stageIndex: number }) {
  const metrics = [
    {
      label: "Tree correlation",
      value: stageIndex >= 1 ? "rho = 0.24" : "rho = 0.68",
      active: stageIndex >= 1,
    },
    {
      label: "OOB rows",
      value: stageIndex >= 4 ? "about 36.8%" : "held out",
      active: stageIndex >= 4,
    },
    {
      label: "Ensemble vote",
      value: stageIndex >= 3 ? "B wins 3-2" : "pending",
      active: stageIndex >= 3,
    },
  ];

  return (
    <div className="grid gap-3">
      {metrics.map((metric) => (
        <motion.div
          key={metric.label}
          className={cn(
            "rounded-lg border bg-background p-3",
            metric.active && "border-foreground/70",
          )}
          layout
        >
          <p className="text-xs uppercase text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-xl font-semibold tracking-normal">{metric.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function Grid() {
  return (
    <g>
      {[80, 160, 240, 320, 400].map((x) => (
        <line
          key={`x-${x}`}
          x1={x}
          x2={x}
          y1="24"
          y2="286"
          stroke="var(--border)"
          strokeDasharray="3 8"
        />
      ))}
      {[80, 160, 240].map((y) => (
        <line
          key={`y-${y}`}
          x1="32"
          x2="488"
          y1={y}
          y2={y}
          stroke="var(--border)"
          strokeDasharray="3 8"
        />
      ))}
    </g>
  );
}

function ArrowMarker() {
  return (
    <defs>
      <marker
        id="rf-arrow"
        markerHeight="8"
        markerWidth="8"
        orient="auto"
        refX="6"
        refY="4"
      >
        <path d="M0 0 L8 4 L0 8 Z" fill="var(--muted-foreground)" />
      </marker>
    </defs>
  );
}
