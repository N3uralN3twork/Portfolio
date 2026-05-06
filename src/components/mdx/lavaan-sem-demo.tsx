"use client";

import {
  ArrowRightIcon,
  BracesIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StageId = "syntax" | "measurement" | "structure" | "fit";

type SemNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "latent" | "observed";
  parent?: "ind60" | "dem60" | "dem65";
};

type SemEdge = {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind: "measurement" | "structural" | "covariance";
};

const chart = {
  width: 820,
  height: 420,
} as const;

const stages: { id: StageId; label: string; headline: string }[] = [
  {
    id: "syntax",
    label: "Syntax",
    headline: "Start with lavaan model syntax.",
  },
  {
    id: "measurement",
    label: "Measurement",
    headline: "Use =~ to define latent variables from indicators.",
  },
  {
    id: "structure",
    label: "Structure",
    headline: "Use ~ to connect the latent constructs.",
  },
  {
    id: "fit",
    label: "Fit",
    headline: "Read estimates and diagnostics as model evidence.",
  },
];

const syntaxBlocks = [
  {
    id: "measurement",
    label: "measurement model",
    lines: [
      "ind60 =~ x1 + x2 + x3",
      "dem60 =~ y1 + y2 + y3 + y4",
      "dem65 =~ y5 + y6 + y7 + y8",
    ],
  },
  {
    id: "structure",
    label: "regressions",
    lines: ["dem60 ~ ind60", "dem65 ~ ind60 + dem60"],
  },
  {
    id: "covariance",
    label: "residual correlations",
    lines: ["y1 ~~ y5", "y2 ~~ y4 + y6", "y3 ~~ y7"],
  },
] as const;

const nodes: SemNode[] = [
  { id: "ind60", label: "ind60", x: 150, y: 190, kind: "latent" },
  { id: "dem60", label: "dem60", x: 390, y: 115, kind: "latent" },
  { id: "dem65", label: "dem65", x: 635, y: 190, kind: "latent" },
  { id: "x1", label: "x1", x: 80, y: 68, kind: "observed", parent: "ind60" },
  { id: "x2", label: "x2", x: 150, y: 55, kind: "observed", parent: "ind60" },
  { id: "x3", label: "x3", x: 220, y: 68, kind: "observed", parent: "ind60" },
  { id: "y1", label: "y1", x: 300, y: 42, kind: "observed", parent: "dem60" },
  { id: "y2", label: "y2", x: 360, y: 34, kind: "observed", parent: "dem60" },
  { id: "y3", label: "y3", x: 420, y: 34, kind: "observed", parent: "dem60" },
  { id: "y4", label: "y4", x: 480, y: 42, kind: "observed", parent: "dem60" },
  { id: "y5", label: "y5", x: 545, y: 320, kind: "observed", parent: "dem65" },
  { id: "y6", label: "y6", x: 605, y: 338, kind: "observed", parent: "dem65" },
  { id: "y7", label: "y7", x: 665, y: 338, kind: "observed", parent: "dem65" },
  { id: "y8", label: "y8", x: 725, y: 320, kind: "observed", parent: "dem65" },
];

const edges: SemEdge[] = [
  { id: "ind60-x1", from: "ind60", to: "x1", label: ".92", kind: "measurement" },
  { id: "ind60-x2", from: "ind60", to: "x2", label: ".97", kind: "measurement" },
  { id: "ind60-x3", from: "ind60", to: "x3", label: ".87", kind: "measurement" },
  { id: "dem60-y1", from: "dem60", to: "y1", label: ".85", kind: "measurement" },
  { id: "dem60-y2", from: "dem60", to: "y2", label: ".72", kind: "measurement" },
  { id: "dem60-y3", from: "dem60", to: "y3", label: ".72", kind: "measurement" },
  { id: "dem60-y4", from: "dem60", to: "y4", label: ".85", kind: "measurement" },
  { id: "dem65-y5", from: "dem65", to: "y5", label: ".81", kind: "measurement" },
  { id: "dem65-y6", from: "dem65", to: "y6", label: ".75", kind: "measurement" },
  { id: "dem65-y7", from: "dem65", to: "y7", label: ".82", kind: "measurement" },
  { id: "dem65-y8", from: "dem65", to: "y8", label: ".83", kind: "measurement" },
  { id: "ind60-dem60", from: "ind60", to: "dem60", label: ".45", kind: "structural" },
  { id: "ind60-dem65", from: "ind60", to: "dem65", label: ".18", kind: "structural" },
  { id: "dem60-dem65", from: "dem60", to: "dem65", label: ".89", kind: "structural" },
  { id: "y1-y5", from: "y1", to: "y5", label: ".30", kind: "covariance" },
  { id: "y2-y6", from: "y2", to: "y6", label: ".36", kind: "covariance" },
  { id: "y3-y7", from: "y3", to: "y7", label: ".19", kind: "covariance" },
];

const fitMetrics = [
  { label: "Estimator", value: "ML", detail: "maximum likelihood" },
  { label: "Observations", value: "75", detail: "PoliticalDemocracy" },
  { label: "Chi-square", value: "38.125", detail: "df = 35, p = .329" },
];

const stageIndex = {
  syntax: 0,
  measurement: 1,
  structure: 2,
  fit: 3,
} satisfies Record<StageId, number>;

export function LavaanSemDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [stage, setStage] = useState<StageId>("syntax");
  const activeIndex = stageIndex[stage];
  const activeStage = stages[activeIndex];

  const advance = () => {
    const nextIndex = activeIndex === stages.length - 1 ? 0 : activeIndex + 1;
    setStage(stages[nextIndex].id);
  };

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <SparklesIcon className="size-3.5" aria-hidden />
              lavaan SEM workbench
            </Badge>
            <CardTitle className="max-w-3xl text-2xl tracking-normal">
              PoliticalDemocracy syntax becomes a path diagram and a diagnostic
              story.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Step through the same `PoliticalDemocracy` model from the lavaan
              SEM example. Each operator changes the diagram: `=~` measures,
              `~` predicts, and `~~` carries residual covariance.
            </CardDescription>
          </div>
          <Button className="w-full lg:w-auto" onClick={advance} type="button">
            {stage === "fit" ? (
              <>
                Reset syntax
                <RotateCcwIcon data-icon="inline-end" />
              </>
            ) : (
              <>
                Advance model
                <PlayIcon data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          {stages.map((item, index) => (
            <button
              key={item.id}
              aria-pressed={stage === item.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                stage === item.id
                  ? "border-foreground bg-foreground text-background"
                  : "bg-background hover:bg-muted/50",
              )}
              onClick={() => setStage(item.id)}
              type="button"
            >
              <span className="block font-mono text-xs">
                {index + 1}/{stages.length}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[20rem_1fr]">
          <SyntaxPanel activeStage={stage} />
          <div className="rounded-lg border bg-background p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-medium">{activeStage.headline}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Standardized values shown here are selected from the lavaan
                  example output, not recomputed in the browser.
                </p>
              </div>
              <Badge variant={stage === "fit" ? "default" : "secondary"}>
                {stage === "fit" ? "diagnostics" : "diagram build"}
              </Badge>
            </div>
            <SemDiagram activeStage={stage} reducedMotion={shouldReduceMotion} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <InterpretationPanel activeStage={stage} />
          <FitPanel activeStage={stage} />
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function SyntaxPanel({ activeStage }: { activeStage: StageId }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center gap-2">
        <BracesIcon className="size-4 text-muted-foreground" aria-hidden />
        <p className="font-medium">lavaan model</p>
      </div>
      <div className="space-y-3 font-mono text-xs">
        <p className="text-muted-foreground">model &lt;- &apos;</p>
        {syntaxBlocks.map((block) => {
          const highlighted =
            activeStage === "syntax" ||
            (activeStage === "measurement" && block.id === "measurement") ||
            (activeStage === "structure" &&
              (block.id === "measurement" || block.id === "structure")) ||
            activeStage === "fit";

          return (
            <div
              key={block.id}
              className={cn(
                "rounded-md border px-3 py-2 transition-colors",
                highlighted ? "border-foreground/40 bg-muted/45" : "opacity-50",
              )}
            >
              <p className="mb-1 text-muted-foreground"># {block.label}</p>
              {block.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          );
        })}
        <p className="text-muted-foreground">&apos;</p>
        <p>
          fit &lt;- sem(model, data = PoliticalDemocracy)
        </p>
      </div>
    </div>
  );
}

function SemDiagram({
  activeStage,
  reducedMotion,
}: {
  activeStage: StageId;
  reducedMotion: boolean;
}) {
  const showMeasurement = stageIndex[activeStage] >= stageIndex.measurement;
  const showStructure = stageIndex[activeStage] >= stageIndex.structure;
  const showFit = activeStage === "fit";

  return (
    <svg
      className="h-auto w-full"
      role="img"
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      aria-label="Path diagram for the lavaan PoliticalDemocracy structural equation model"
    >
      <defs>
        <marker
          id="sem-arrow"
          markerHeight="8"
          markerWidth="8"
          orient="auto"
          refX="7"
          refY="4"
          viewBox="0 0 8 8"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
        </marker>
      </defs>

      <rect
        fill="var(--muted)"
        fillOpacity="0.18"
        height={chart.height - 2}
        rx="12"
        width={chart.width - 2}
        x="1"
        y="1"
      />

      {edges.map((edge) => {
        const visible =
          (edge.kind === "measurement" && showMeasurement) ||
          (edge.kind === "structural" && showStructure) ||
          (edge.kind === "covariance" && showFit);

        return (
          <DiagramEdge
            key={edge.id}
            edge={edge}
            reducedMotion={reducedMotion}
            visible={visible}
          />
        );
      })}

      {nodes.map((node) => {
        const isLatent = node.kind === "latent";
        const visible =
          isLatent || showMeasurement || stageIndex[activeStage] >= stageIndex.fit;

        return (
          <DiagramNode
            key={node.id}
            node={node}
            reducedMotion={reducedMotion}
            visible={visible}
          />
        );
      })}

      {showFit ? (
        <motion.g
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <rect
            fill="var(--background)"
            height="86"
            rx="10"
            stroke="var(--border)"
            width="208"
            x="36"
            y="292"
          />
          <text fill="var(--foreground)" fontSize="13" fontWeight="600" x="54" y="320">
            Model-implied covariance
          </text>
          <text fill="var(--muted-foreground)" fontSize="12" x="54" y="344">
            Compare Sigma(theta) with S
          </text>
          <text fill="var(--muted-foreground)" fontSize="12" x="54" y="364">
            Fit is diagnostic, not proof.
          </text>
        </motion.g>
      ) : null}
    </svg>
  );
}

function DiagramEdge({
  edge,
  reducedMotion,
  visible,
}: {
  edge: SemEdge;
  reducedMotion: boolean;
  visible: boolean;
}) {
  const from = nodes.find((node) => node.id === edge.from);
  const to = nodes.find((node) => node.id === edge.to);

  if (!from || !to) {
    return null;
  }

  const isCovariance = edge.kind === "covariance";
  const path = isCovariance
    ? makeCurve(from, to, -70)
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const labelX = (from.x + to.x) / 2;
  const labelY = (from.y + to.y) / 2 - (isCovariance ? 20 : 8);

  return (
    <motion.g
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
    >
      <motion.path
        d={path}
        fill="none"
        markerEnd={isCovariance ? undefined : "url(#sem-arrow)"}
        stroke={
          edge.kind === "structural"
            ? "var(--lab-positive)"
            : edge.kind === "covariance"
              ? "var(--lab-accent)"
              : "var(--muted-foreground)"
        }
        strokeDasharray={isCovariance ? "5 7" : undefined}
        strokeLinecap="round"
        strokeWidth={edge.kind === "structural" ? 3 : 2}
        initial={false}
        animate={{ pathLength: visible ? 1 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.55, ease: "easeInOut" }}
      />
      {edge.label ? (
        <motion.text
          fill="var(--foreground)"
          fontSize="12"
          fontWeight="600"
          initial={false}
          textAnchor="middle"
          x={labelX}
          y={labelY}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          {edge.label}
        </motion.text>
      ) : null}
    </motion.g>
  );
}

function DiagramNode({
  node,
  reducedMotion,
  visible,
}: {
  node: SemNode;
  reducedMotion: boolean;
  visible: boolean;
}) {
  const isLatent = node.kind === "latent";

  return (
    <motion.g
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.88,
      }}
      style={{ originX: node.x, originY: node.y }}
      transition={{ duration: reducedMotion ? 0 : 0.25 }}
    >
      {isLatent ? (
        <ellipse
          cx={node.x}
          cy={node.y}
          fill="var(--background)"
          rx="48"
          ry="30"
          stroke="var(--foreground)"
          strokeWidth="2"
        />
      ) : (
        <rect
          fill="var(--background)"
          height="34"
          rx="7"
          stroke="var(--border)"
          strokeWidth="2"
          width="46"
          x={node.x - 23}
          y={node.y - 17}
        />
      )}
      <text
        fill="var(--foreground)"
        fontSize={isLatent ? "14" : "12"}
        fontWeight="600"
        textAnchor="middle"
        x={node.x}
        y={node.y + 4}
      >
        {node.label}
      </text>
    </motion.g>
  );
}

function InterpretationPanel({ activeStage }: { activeStage: StageId }) {
  const copy = {
    syntax:
      "lavaan starts from a compact model string. The same object can carry measurement definitions, regressions, residual covariances, intercepts, labels, and constraints.",
    measurement:
      "The measurement layer asks whether observed indicators behave like evidence for latent constructs. In this example, industrialization and democracy are not single columns.",
    structure:
      "The structural layer asks whether industrialization in 1960 predicts democracy in 1960 and 1965, while 1960 democracy also predicts 1965 democracy.",
    fit:
      "The fitted model compares the sample covariance matrix S with the model-implied Sigma(theta). Fit statistics help diagnose mismatch; they do not prove the theory true.",
  } satisfies Record<StageId, string>;

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <CircleDotIcon className="size-4 text-muted-foreground" aria-hidden />
        <p className="font-medium">What to read</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={activeStage}
          className="text-sm leading-6 text-muted-foreground"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {copy[activeStage]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function FitPanel({ activeStage }: { activeStage: StageId }) {
  const visible = activeStage === "fit";

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2Icon className="size-4 text-muted-foreground" aria-hidden />
          <p className="font-medium">Fit output</p>
        </div>
        <Badge variant={visible ? "default" : "secondary"}>
          {visible ? "ready" : "after sem()"}
        </Badge>
      </div>
      <div className="grid gap-2">
        {fitMetrics.map((metric) => (
          <div key={metric.label} className="rounded-lg bg-muted/45 p-3">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-1 font-mono text-lg font-semibold">
              {visible ? metric.value : "--"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-muted-foreground">
        <ArrowRightIcon className="size-3.5 shrink-0" aria-hidden />
        Strong-looking paths still need theory, identification checks, and
        defensible measurement.
      </p>
    </div>
  );
}

function makeCurve(from: SemNode, to: SemNode, lift: number) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 + lift;

  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}
