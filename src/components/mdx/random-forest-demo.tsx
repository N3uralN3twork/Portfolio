"use client";

import {
  ChartNoAxesCombinedIcon,
  CircleDotIcon,
  MousePointerClickIcon,
  TreesIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { type MouseEvent, useEffect, useMemo, useState } from "react";
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

type ClassLabel = "stay" | "churn";

type CustomerPoint = {
  id: string;
  label: string;
  usage: number;
  tickets: number;
  outcome: ClassLabel;
};

type QueryPoint = {
  usage: number;
  tickets: number;
};

type TreeRule = {
  id: string;
  name: string;
  sample: string;
  split: {
    feature: "usage" | "tickets";
    value: number;
  };
  predict: (point: QueryPoint) => ClassLabel;
};

const forestSizes = [
  { count: 1, label: "1 tree" },
  { count: 3, label: "3 trees" },
  { count: 7, label: "7 trees" },
  { count: 11, label: "full forest" },
] as const;

const customers: CustomerPoint[] = [
  { id: "s1", label: "steady seat", usage: 82, tickets: 18, outcome: "stay" },
  { id: "s2", label: "power user", usage: 72, tickets: 34, outcome: "stay" },
  { id: "s3", label: "quiet account", usage: 62, tickets: 22, outcome: "stay" },
  { id: "s4", label: "new adopter", usage: 54, tickets: 28, outcome: "stay" },
  { id: "s5", label: "healthy expansion", usage: 88, tickets: 42, outcome: "stay" },
  { id: "s6", label: "low touch", usage: 66, tickets: 12, outcome: "stay" },
  { id: "c1", label: "support-heavy", usage: 24, tickets: 74, outcome: "churn" },
  { id: "c2", label: "stalled rollout", usage: 34, tickets: 58, outcome: "churn" },
  { id: "c3", label: "frustrated admin", usage: 46, tickets: 82, outcome: "churn" },
  { id: "c4", label: "at-risk renewal", usage: 28, tickets: 44, outcome: "churn" },
  { id: "c5", label: "usage cliff", usage: 18, tickets: 30, outcome: "churn" },
  { id: "c6", label: "noisy middle", usage: 52, tickets: 62, outcome: "churn" },
];

const trees: TreeRule[] = [
  {
    id: "t1",
    name: "Tree 01",
    sample: "usage first",
    split: { feature: "usage", value: 50 },
    predict: (point) => (point.usage < 50 && point.tickets > 28 ? "churn" : "stay"),
  },
  {
    id: "t2",
    name: "Tree 02",
    sample: "support first",
    split: { feature: "tickets", value: 55 },
    predict: (point) => (point.tickets > 55 || point.usage < 26 ? "churn" : "stay"),
  },
  {
    id: "t3",
    name: "Tree 03",
    sample: "low-usage view",
    split: { feature: "usage", value: 42 },
    predict: (point) => (point.usage < 42 && point.tickets > 18 ? "churn" : "stay"),
  },
  {
    id: "t4",
    name: "Tree 04",
    sample: "ticket-heavy view",
    split: { feature: "tickets", value: 66 },
    predict: (point) => (point.tickets > 66 && point.usage < 62 ? "churn" : "stay"),
  },
  {
    id: "t5",
    name: "Tree 05",
    sample: "interaction view",
    split: { feature: "usage", value: 58 },
    predict: (point) =>
      point.tickets - point.usage > 10 || (point.usage < 36 && point.tickets > 34)
        ? "churn"
        : "stay",
  },
  {
    id: "t6",
    name: "Tree 06",
    sample: "renewal risk view",
    split: { feature: "tickets", value: 48 },
    predict: (point) => (point.tickets > 48 && point.usage < 70 ? "churn" : "stay"),
  },
  {
    id: "t7",
    name: "Tree 07",
    sample: "adoption view",
    split: { feature: "usage", value: 64 },
    predict: (point) => (point.usage < 64 && point.tickets > 52 ? "churn" : "stay"),
  },
  {
    id: "t8",
    name: "Tree 08",
    sample: "noisy bootstrap",
    split: { feature: "tickets", value: 36 },
    predict: (point) => (point.usage < 30 || (point.tickets > 36 && point.usage < 44) ? "churn" : "stay"),
  },
  {
    id: "t9",
    name: "Tree 09",
    sample: "high-touch view",
    split: { feature: "tickets", value: 70 },
    predict: (point) => (point.tickets > 70 || (point.usage < 48 && point.tickets > 46) ? "churn" : "stay"),
  },
  {
    id: "t10",
    name: "Tree 10",
    sample: "usage cliff view",
    split: { feature: "usage", value: 33 },
    predict: (point) => (point.usage < 33 ? "churn" : point.tickets > 78 ? "churn" : "stay"),
  },
  {
    id: "t11",
    name: "Tree 11",
    sample: "stability view",
    split: { feature: "tickets", value: 60 },
    predict: (point) =>
      point.usage > 68 ? "stay" : point.tickets > 60 || point.usage < 38 ? "churn" : "stay",
  },
];

const boundaryCells = Array.from({ length: 140 }, (_, index) => {
  const columns = 14;
  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    id: `cell-${index}`,
    usage: ((column + 0.5) / columns) * 100,
    tickets: 100 - ((row + 0.5) / 10) * 100,
  };
});

const initialQuery: QueryPoint = { usage: 44, tickets: 64 };

const classify = (point: QueryPoint, count: number) => {
  const activeTrees = trees.slice(0, count);
  const votes = activeTrees.map((tree) => ({
    tree,
    label: tree.predict(point),
  }));
  const churnVotes = votes.filter((vote) => vote.label === "churn").length;
  const stayVotes = votes.length - churnVotes;
  const result: ClassLabel = churnVotes > stayVotes ? "churn" : "stay";
  const winningVotes = Math.max(churnVotes, stayVotes);
  const voteFraction = winningVotes / votes.length;
  const margin = Math.abs(churnVotes - stayVotes);

  return {
    churnVotes,
    margin,
    result,
    stayVotes,
    voteFraction,
    votes,
  };
};

const toSvgX = (usage: number) => 28 + usage * 4.44;
const toSvgY = (tickets: number) => 292 - tickets * 2.48;

export function RandomForestDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [query, setQuery] = useState<QueryPoint>(initialQuery);
  const [treeCount, setTreeCount] = useState(7);
  const queryX = useMotionValue(toSvgX(initialQuery.usage));
  const queryY = useMotionValue(toSvgY(initialQuery.tickets));
  const springX = useSpring(queryX, { damping: 28, stiffness: 260 });
  const springY = useSpring(queryY, { damping: 28, stiffness: 260 });

  useEffect(() => {
    queryX.set(toSvgX(query.usage));
    queryY.set(toSvgY(query.tickets));
  }, [query, queryX, queryY]);

  const classification = useMemo(
    () => classify(query, treeCount),
    [query, treeCount],
  );
  const confidenceLabel =
    classification.margin <= 1
      ? "high disagreement"
      : classification.voteFraction >= 0.75
        ? "stable majority"
        : "soft majority";

  const handlePlotClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const usage = ((event.clientX - rect.left) / rect.width) * 100;
    const tickets = 100 - ((event.clientY - rect.top) / rect.height) * 100;

    setQuery({
      tickets: Math.max(0, Math.min(100, Math.round(tickets))),
      usage: Math.max(0, Math.min(100, Math.round(usage))),
    });
  };

  return (
    <Card className="not-prose my-10 w-full overflow-hidden border-border/80 bg-card/95 md:relative md:left-1/2 md:w-[min(92vw,68rem)] md:-translate-x-1/2">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <TreesIcon className="size-3.5" aria-hidden />
              Random forest boundary painter
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Click a customer profile and watch the forest vote.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Each color tile is a local majority vote from bootstrapped trees.
              Add more trees to see jagged single-tree regions settle into a
              more stable churn classifier.
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-[34rem]">
            {forestSizes.map((size) => (
              <Button
                key={size.count}
                aria-pressed={treeCount === size.count}
                className="justify-start"
                onClick={() => setTreeCount(size.count)}
                size="sm"
                type="button"
                variant={treeCount === size.count ? "default" : "outline"}
              >
                {size.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            <button
              aria-label="Click to classify a customer by usage frequency and support-ticket intensity"
              className="relative block aspect-[1.55] w-full overflow-hidden rounded-lg border bg-background text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={handlePlotClick}
              type="button"
            >
              <BoundaryGrid
                reducedMotion={shouldReduceMotion}
                treeCount={treeCount}
              />
              <svg
                className="absolute inset-0 h-full w-full"
                role="img"
                viewBox="0 0 500 320"
                aria-label="Customer churn classification boundary"
              >
                <PlotGrid />
                <SplitLines reducedMotion={shouldReduceMotion} treeCount={treeCount} />
                {customers.map((customer) => (
                  <TrainingPoint key={customer.id} customer={customer} />
                ))}
                <motion.g
                  initial={false}
                  animate={{
                    opacity: 1,
                    scale: classification.result === "churn" ? 1.04 : 1,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.2,
                    type: "spring",
                  }}
                >
                  <motion.circle
                    cx={springX}
                    cy={springY}
                    r="15"
                    fill={
                      classification.result === "churn"
                        ? "var(--lab-accent)"
                        : "var(--lab-positive)"
                    }
                    opacity="0.22"
                  />
                  <motion.circle
                    cx={springX}
                    cy={springY}
                    r="7"
                    fill={
                      classification.result === "churn"
                        ? "var(--lab-accent)"
                        : "var(--lab-positive)"
                    }
                    stroke="var(--background)"
                    strokeWidth="3"
                  />
                </motion.g>
                <AxisLabels />
              </svg>
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border bg-background/90 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur">
                <MousePointerClickIcon className="size-3.5" aria-hidden />
                Click the feature space
              </div>
            </button>
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <Metric label="Usage frequency" value={`${query.usage}/100`} />
              <Metric label="Support intensity" value={`${query.tickets}/100`} />
              <Metric label="Active trees" value={`${treeCount} votes`} />
            </div>
          </div>

          <motion.div className="grid content-start gap-4" layout>
            <PredictionPanel
              classification={classification}
              confidenceLabel={confidenceLabel}
              reducedMotion={shouldReduceMotion}
            />
            <VotePanel
              classification={classification}
              reducedMotion={shouldReduceMotion}
            />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}

function BoundaryGrid({
  reducedMotion,
  treeCount,
}: {
  reducedMotion: boolean;
  treeCount: number;
}) {
  return (
    <div
      className="absolute inset-0 grid"
      style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
    >
      {boundaryCells.map((cell, index) => {
        const prediction = classify(cell, treeCount);
        const isChurn = prediction.result === "churn";
        const strength = prediction.voteFraction;

        return (
          <motion.div
            key={cell.id}
            className={cn(
              "border-r border-t border-background/20",
              isChurn
                ? "bg-[color:var(--lab-accent)]"
                : "bg-[color:var(--lab-positive)]",
            )}
            initial={false}
            animate={{
              opacity: 0.12 + strength * 0.28,
              scale: prediction.margin <= 1 ? 0.96 : 1,
            }}
            transition={{
              delay: reducedMotion ? 0 : (index % 14) * 0.006,
              duration: reducedMotion ? 0 : 0.26,
              type: "spring",
            }}
          />
        );
      })}
    </div>
  );
}

function SplitLines({
  reducedMotion,
  treeCount,
}: {
  reducedMotion: boolean;
  treeCount: number;
}) {
  return (
    <g>
      {trees.slice(0, treeCount).map((tree, index) => {
        const isUsage = tree.split.feature === "usage";
        const x = toSvgX(tree.split.value);
        const y = toSvgY(tree.split.value);

        return (
          <motion.line
            key={tree.id}
            x1={isUsage ? x : 28}
            x2={isUsage ? x : 472}
            y1={isUsage ? 44 : y}
            y2={isUsage ? 292 : y}
            stroke="var(--foreground)"
            strokeDasharray="3 8"
            strokeLinecap="round"
            strokeWidth="1.25"
            initial={reducedMotion ? false : { opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.16, pathLength: 1 }}
            transition={{
              delay: reducedMotion ? 0 : index * 0.035,
              duration: reducedMotion ? 0 : 0.35,
            }}
          />
        );
      })}
    </g>
  );
}

function PlotGrid() {
  return (
    <g>
      {[20, 40, 60, 80].map((tick) => (
        <g key={tick}>
          <line
            x1={toSvgX(tick)}
            x2={toSvgX(tick)}
            y1="44"
            y2="292"
            stroke="var(--background)"
            strokeOpacity="0.78"
          />
          <line
            x1="28"
            x2="472"
            y1={toSvgY(tick)}
            y2={toSvgY(tick)}
            stroke="var(--background)"
            strokeOpacity="0.78"
          />
        </g>
      ))}
      <rect
        x="28"
        y="44"
        width="444"
        height="248"
        rx="10"
        fill="none"
        stroke="var(--border)"
        strokeWidth="2"
      />
    </g>
  );
}

function TrainingPoint({ customer }: { customer: CustomerPoint }) {
  const isChurn = customer.outcome === "churn";

  return (
    <g>
      <circle
        cx={toSvgX(customer.usage)}
        cy={toSvgY(customer.tickets)}
        r="5"
        fill={isChurn ? "var(--lab-accent)" : "var(--lab-positive)"}
        stroke="var(--background)"
        strokeWidth="2"
      />
      <title>{customer.label}</title>
    </g>
  );
}

function AxisLabels() {
  return (
    <g fill="var(--foreground)" fontSize="12" fontWeight="600">
      <text x="250" y="310" textAnchor="middle">
        Usage frequency
      </text>
      <text
        x="13"
        y="168"
        textAnchor="middle"
        transform="rotate(-90 13 168)"
      >
        Support-ticket intensity
      </text>
    </g>
  );
}

function PredictionPanel({
  classification,
  confidenceLabel,
  reducedMotion,
}: {
  classification: ReturnType<typeof classify>;
  confidenceLabel: string;
  reducedMotion: boolean;
}) {
  const isChurn = classification.result === "churn";

  return (
    <motion.div className="rounded-lg border bg-card p-4" layout>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CircleDotIcon className="size-4 text-muted-foreground" aria-hidden />
          <p className="font-medium">Majority vote</p>
        </div>
        <Badge
          variant={isChurn ? "destructive" : "secondary"}
          className="shrink-0"
        >
          {confidenceLabel}
        </Badge>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={classification.result}
          className="space-y-2"
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <motion.p
            layoutId="rf-result-label"
            className="text-3xl font-semibold tracking-normal"
          >
            {isChurn ? "Likely churns" : "Likely stays"}
          </motion.p>
          <p className="text-sm leading-6 text-muted-foreground">
            {classification.churnVotes} churn votes vs.{" "}
            {classification.stayVotes} stay votes. Treat this as a
            confidence-like vote share, not a calibrated probability.
          </p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            "h-full origin-left rounded-full",
            isChurn
              ? "bg-[color:var(--lab-accent)]"
              : "bg-[color:var(--lab-positive)]",
          )}
          initial={false}
          animate={{ scaleX: classification.voteFraction }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            type: "spring",
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Winning vote share: {Math.round(classification.voteFraction * 100)}%
      </p>
    </motion.div>
  );
}

function VotePanel({
  classification,
  reducedMotion,
}: {
  classification: ReturnType<typeof classify>;
  reducedMotion: boolean;
}) {
  return (
    <motion.div className="rounded-lg border bg-background p-4" layout>
      <div className="mb-3 flex items-center gap-2">
        <ChartNoAxesCombinedIcon className="size-4 text-muted-foreground" aria-hidden />
        <p className="font-medium">Tree votes</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <AnimatePresence mode="popLayout">
          {classification.votes.map((vote, index) => {
            const isChurn = vote.label === "churn";

            return (
              <motion.div
                key={vote.tree.id}
                className={cn(
                  "rounded-lg border p-2 text-xs",
                  isChurn
                    ? "border-[color:var(--lab-accent)]/60 bg-[color:var(--lab-accent)]/15"
                    : "border-[color:var(--lab-positive)]/60 bg-[color:var(--lab-positive)]/15",
                )}
                layout
                layoutId={`rf-vote-${vote.tree.id}`}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
                transition={{
                  delay: reducedMotion ? 0 : index * 0.025,
                  duration: reducedMotion ? 0 : 0.2,
                  type: "spring",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{vote.tree.name}</span>
                  <span className="font-semibold">
                    {isChurn ? "churn" : "stay"}
                  </span>
                </div>
                <p className="mt-1 truncate text-muted-foreground">
                  {vote.tree.sample}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded-md border bg-card p-2">
          <span className="font-medium text-foreground">Rows</span>
          <p className="mt-1">Bootstrapped per tree</p>
        </div>
        <div className="rounded-md border bg-card p-2">
          <span className="font-medium text-foreground">Splits</span>
          <p className="mt-1">Random feature subsets</p>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-normal">{value}</p>
    </div>
  );
}
