"use client";

import {
  ActivityIcon,
  ChartNoAxesCombinedIcon,
  RotateCcwIcon,
  SigmaIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
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
import { cn } from "@/lib/utils";

type DemoPoint = {
  id: string;
  label: string;
  x1: number;
  x2: number;
  outcome: 0 | 1;
};

type Coefficients = {
  intercept: number;
  x1: number;
  x2: number;
  threshold: number;
};

const chart = {
  width: 680,
  height: 420,
  padding: 44,
  max: 100,
} as const;

const defaultCoefficients: Coefficients = {
  intercept: -2.8,
  x1: 0.055,
  x2: 0.035,
  threshold: 0.5,
};

const points: DemoPoint[] = [
  { id: "a1", label: "low signal", x1: 16, x2: 18, outcome: 0 },
  { id: "a2", label: "weak lead", x1: 24, x2: 34, outcome: 0 },
  { id: "a3", label: "thin history", x1: 38, x2: 26, outcome: 0 },
  { id: "a4", label: "borderline", x1: 46, x2: 42, outcome: 0 },
  { id: "a5", label: "noisy miss", x1: 58, x2: 32, outcome: 0 },
  { id: "b1", label: "steady signal", x1: 54, x2: 64, outcome: 1 },
  { id: "b2", label: "strong fit", x1: 66, x2: 58, outcome: 1 },
  { id: "b3", label: "clear win", x1: 74, x2: 76, outcome: 1 },
  { id: "b4", label: "high confidence", x1: 86, x2: 68, outcome: 1 },
  { id: "b5", label: "supporting case", x1: 62, x2: 84, outcome: 1 },
  { id: "b6", label: "noisy hit", x1: 42, x2: 72, outcome: 1 },
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const logit = (p: number) => Math.log(p / (1 - p));
const toSvgX = (value: number) =>
  chart.padding + (value / chart.max) * (chart.width - chart.padding * 2);
const toSvgY = (value: number) =>
  chart.height -
  chart.padding -
  (value / chart.max) * (chart.height - chart.padding * 2);

function predictProbability(point: Pick<DemoPoint, "x1" | "x2">, model: Coefficients) {
  return sigmoid(model.intercept + model.x1 * point.x1 + model.x2 * point.x2);
}

function makeBoundaryPath(model: Coefficients) {
  const target = logit(model.threshold);
  const yAt = (x: number) => (target - model.intercept - model.x1 * x) / model.x2;
  const raw = [
    { x: 0, y: yAt(0) },
    { x: 100, y: yAt(100) },
  ];
  const candidates = [...raw];

  if (model.x1 !== 0) {
    candidates.push({
      x: (target - model.intercept) / model.x1,
      y: 0,
    });
    candidates.push({
      x: (target - model.intercept - model.x2 * 100) / model.x1,
      y: 100,
    });
  }

  const clipped = candidates
    .filter((point) => point.x >= 0 && point.x <= 100 && point.y >= 0 && point.y <= 100)
    .slice(0, 2);

  if (clipped.length < 2) {
    return "";
  }

  return `M ${toSvgX(clipped[0].x)} ${toSvgY(clipped[0].y)} L ${toSvgX(
    clipped[1].x,
  )} ${toSvgY(clipped[1].y)}`;
}

const probabilityCells = Array.from({ length: 100 }, (_, index) => {
  const columns = 10;
  const column = index % columns;
  const row = Math.floor(index / columns);

  return {
    id: `cell-${index}`,
    x1: column * 10 + 5,
    x2: 95 - row * 10,
    x: chart.padding + column * ((chart.width - chart.padding * 2) / columns),
    y: chart.padding + row * ((chart.height - chart.padding * 2) / columns),
    size: (chart.width - chart.padding * 2) / columns,
  };
});

export function LogisticRegressionDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [model, setModel] = useState<Coefficients>(defaultCoefficients);
  const boundaryPath = makeBoundaryPath(model);

  const results = useMemo(() => {
    const scored = points.map((point) => {
      const probability = predictProbability(point, model);
      const prediction = probability >= model.threshold ? 1 : 0;

      return {
        ...point,
        probability,
        prediction,
        correct: prediction === point.outcome,
      };
    });
    const correct = scored.filter((point) => point.correct).length;
    const falsePositives = scored.filter(
      (point) => point.prediction === 1 && point.outcome === 0,
    ).length;
    const falseNegatives = scored.filter(
      (point) => point.prediction === 0 && point.outcome === 1,
    ).length;

    return {
      accuracy: correct / scored.length,
      correct,
      falseNegatives,
      falsePositives,
      scored,
    };
  }, [model]);

  const setCoefficient = (key: keyof Coefficients, value: number) => {
    setModel((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const reset = () => setModel(defaultCoefficients);

  return (
    <MdxDemoCard className="border-border/80 bg-card/95">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <SigmaIcon className="size-3.5" aria-hidden />
              Logistic lab
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Move the coefficients and watch the decision boundary respond.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Logistic regression turns a linear score into a probability. The
              threshold decides where that probability becomes a class label.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcwIcon aria-hidden />
            Reset
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div className="rounded-lg border bg-background/70 p-3">
          <svg
            role="img"
            aria-label="Interactive logistic regression decision boundary"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className="h-auto w-full"
          >
            <defs>
              <linearGradient id="logistic-cold" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--muted)" />
                <stop offset="100%" stopColor="color-mix(in oklch, var(--primary) 22%, transparent)" />
              </linearGradient>
            </defs>
            <rect
              width={chart.width}
              height={chart.height}
              rx="18"
              fill="color-mix(in oklch, var(--muted) 38%, transparent)"
            />
            {probabilityCells.map((cell) => {
              const probability = predictProbability(cell, model);
              const positive = probability >= model.threshold;

              return (
                <motion.rect
                  key={cell.id}
                  x={cell.x}
                  y={cell.y}
                  width={cell.size + 0.5}
                  height={cell.size + 0.5}
                  fill={positive ? "var(--primary)" : "url(#logistic-cold)"}
                  initial={false}
                  animate={{ opacity: positive ? 0.08 + probability * 0.42 : 0.12 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22 }}
                />
              );
            })}
            <line
              x1={chart.padding}
              x2={chart.width - chart.padding}
              y1={chart.height - chart.padding}
              y2={chart.height - chart.padding}
              stroke="var(--border)"
            />
            <line
              x1={chart.padding}
              x2={chart.padding}
              y1={chart.padding}
              y2={chart.height - chart.padding}
              stroke="var(--border)"
            />
            <text x={chart.width / 2} y={chart.height - 10} textAnchor="middle" className="fill-muted-foreground text-[13px]">
              predictor x1
            </text>
            <text
              x={16}
              y={chart.height / 2}
              textAnchor="middle"
              transform={`rotate(-90 16 ${chart.height / 2})`}
              className="fill-muted-foreground text-[13px]"
            >
              predictor x2
            </text>
            <AnimatePresence>
              {boundaryPath ? (
                <motion.path
                  key="decision boundary"
                  d={boundaryPath}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeLinecap="round"
                  strokeWidth="4"
                  initial={false}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28 }}
                />
              ) : null}
            </AnimatePresence>
            {results.scored.map((point) => (
              <motion.g
                key={point.id}
                initial={false}
                animate={{
                  x: toSvgX(point.x1),
                  y: toSvgY(point.x2),
                  scale: point.correct ? 1 : 1.16,
                }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 24 }}
              >
                <circle
                  r="10"
                  className={cn(
                    point.outcome === 1
                      ? "fill-[color:var(--lab-positive)]"
                      : "fill-[color:var(--lab-accent)]",
                  )}
                  opacity={point.correct ? 0.94 : 0.58}
                />
                <circle
                  r="14"
                  fill="none"
                  stroke={point.correct ? "transparent" : "var(--destructive)"}
                  strokeWidth="2"
                />
              </motion.g>
            ))}
          </svg>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[color:var(--lab-accent)]" />
              Class 0 examples
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[color:var(--lab-positive)]" />
              Class 1 examples
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full border-2 border-destructive" />
              Current mistakes
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-background/70 p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <ActivityIcon className="size-4 text-muted-foreground" aria-hidden />
              Model controls
            </div>
            <div className="grid gap-4">
              <CoefficientSlider
                label="Intercept b0"
                min={-7}
                max={1}
                step={0.1}
                value={model.intercept}
                onChange={(value) => setCoefficient("intercept", value)}
              />
              <CoefficientSlider
                label="x1 coefficient b1"
                min={-0.02}
                max={0.09}
                step={0.005}
                value={model.x1}
                onChange={(value) => setCoefficient("x1", value)}
              />
              <CoefficientSlider
                label="x2 coefficient b2"
                min={-0.02}
                max={0.09}
                step={0.005}
                value={model.x2}
                onChange={(value) => setCoefficient("x2", value)}
              />
              <CoefficientSlider
                label="Class threshold"
                min={0.2}
                max={0.8}
                step={0.05}
                value={model.threshold}
                onChange={(value) => setCoefficient("threshold", value)}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-background/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <ChartNoAxesCombinedIcon className="size-4 text-muted-foreground" aria-hidden />
              Current fit
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Accuracy" value={`${Math.round(results.accuracy * 100)}%`} />
              <Metric label="Correct" value={`${results.correct}/${points.length}`} />
              <Metric label="False positives" value={String(results.falsePositives)} />
              <Metric label="False negatives" value={String(results.falseNegatives)} />
            </div>
            <motion.p
              key={`${model.intercept}-${model.x1}-${model.x2}`}
              className="mt-4 rounded-md bg-muted p-3 font-mono text-xs leading-6 text-muted-foreground"
              initial={shouldReduceMotion ? false : { opacity: 0.72 }}
              animate={{ opacity: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18 }}
            >
              logit(p) ={" "}
              <span>{model.intercept.toFixed(1)}</span>{" "}
              + {model.x1.toFixed(3)} x1 + {model.x2.toFixed(3)} x2
            </motion.p>
          </div>
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function CoefficientSlider({
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
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {value.toFixed(step < 0.01 ? 3 : 2)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tracking-normal">{value}</div>
    </div>
  );
}
