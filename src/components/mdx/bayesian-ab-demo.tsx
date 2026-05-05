"use client";

import {
  ArrowRightIcon,
  MousePointerClickIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from "motion/react";
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

const chart = {
  width: 720,
  height: 280,
  paddingX: 36,
  paddingY: 26,
  domainMax: 0.28,
  samples: 72,
} as const;

const prior = {
  label: "Shared prior",
  alpha: 3,
  beta: 17,
  mean: "15.0%",
  color: "var(--muted-foreground)",
};

const variants = [
  {
    id: "a",
    label: "Variant A",
    shortLabel: "A",
    alpha: 55,
    beta: 385,
    conversions: 52,
    visitors: 420,
    mean: "12.5%",
    interval: "9.4%-15.6%",
    probability: "2.4%",
    lift: "baseline",
    color: "var(--lab-accent)",
    description: "The control settles close to the original belief.",
  },
  {
    id: "b",
    label: "Variant B",
    shortLabel: "B",
    alpha: 75,
    beta: 360,
    conversions: 72,
    visitors: 415,
    mean: "17.2%",
    interval: "13.7%-20.8%",
    probability: "97.6%",
    lift: "+4.7pp",
    color: "var(--lab-positive)",
    description: "The treatment shifts the posterior right after stronger evidence.",
  },
] as const;

type VariantId = (typeof variants)[number]["id"];

const allDistributions = [
  { alpha: prior.alpha, beta: prior.beta },
  ...variants.map((variant) => ({
    alpha: variant.alpha,
    beta: variant.beta,
  })),
];
const globalMaxDensity = Math.max(
  ...allDistributions.flatMap((distribution) =>
    sampleBetaDistribution(distribution.alpha, distribution.beta).map(
      (point) => point.y,
    ),
  ),
);
const priorPath = makeBetaPath(prior.alpha, prior.beta);
const posteriorPaths = {
  a: makeBetaPath(variants[0].alpha, variants[0].beta),
  b: makeBetaPath(variants[1].alpha, variants[1].beta),
};

const evidenceTokens = [
  ...Array.from({ length: 18 }, (_, index) => ({
    id: `a-${index}`,
    variant: "a" as VariantId,
    converted: index < 5,
  })),
  ...Array.from({ length: 18 }, (_, index) => ({
    id: `b-${index}`,
    variant: "b" as VariantId,
    converted: index < 7,
  })),
];

export function BayesianABDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [updated, setUpdated] = useState(false);
  const [activeVariant, setActiveVariant] = useState<VariantId>("b");
  const progress = useSpring(updated ? 1 : 0, {
    stiffness: 140,
    damping: 24,
  });
  const active =
    variants.find((variant) => variant.id === activeVariant) ?? variants[1];

  return (
    <Card className="not-prose my-10 overflow-hidden border-border/80 bg-card/95">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <SparklesIcon className="size-3.5" aria-hidden />
              Bayesian update
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              A shared prior absorbs evidence and becomes two posteriors.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Run the update to add conversions and non-conversions to each Beta
              distribution. Hover or tap a variant to inspect its posterior.
            </CardDescription>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setUpdated((value) => !value)}
            type="button"
          >
            {updated ? (
              <>
                Reset prior
                <RotateCcwIcon data-icon="inline-end" />
              </>
            ) : (
              <>
                Run update
                <PlayIcon data-icon="inline-end" />
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 rounded-lg border bg-background p-4 lg:grid-cols-[1fr_15rem]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                Beta(3, 17)
              </span>
              <ArrowRightIcon className="size-4" aria-hidden />
              <span>Beta(55, 385) and Beta(75, 360)</span>
            </div>

            <div className="relative overflow-hidden rounded-lg border bg-muted/20">
              <svg
                className="h-auto w-full"
                role="img"
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                aria-label="Prior and posterior Beta distribution curves for an A/B test"
              >
                <ChartGrid />
                <motion.path
                  d={priorPath}
                  fill="none"
                  stroke={prior.color}
                  strokeDasharray="5 8"
                  strokeLinecap="round"
                  strokeWidth="3"
                  initial={false}
                  animate={{ opacity: updated ? 0.28 : 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                />
                {variants.map((variant) => {
                  const isActive = activeVariant === variant.id;

                  return (
                    <motion.path
                      key={variant.id}
                      d={updated ? posteriorPaths[variant.id] : priorPath}
                      fill="none"
                      layoutId={`posterior-${variant.id}`}
                      stroke={variant.color}
                      strokeLinecap="round"
                      strokeWidth={isActive ? 5 : 3}
                      initial={false}
                      animate={{
                        d: updated ? posteriorPaths[variant.id] : priorPath,
                        opacity: updated ? (isActive ? 1 : 0.45) : 0.35,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.75,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
              </svg>

              <AnimatePresence>
                {updated && (
                  <motion.div
                    className="pointer-events-none absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                  >
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="rounded-md border bg-background/90 px-3 py-2 text-xs shadow-sm"
                      >
                        <span className="font-medium">{variant.label}</span>
                        <span className="ml-2 text-muted-foreground">
                          {variant.conversions}/{variant.visitors}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid content-start gap-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <MousePointerClickIcon className="size-4 text-muted-foreground" />
              Inspect a variant
            </p>
            {variants.map((variant) => (
              <motion.button
                key={variant.id}
                className={cn(
                  "rounded-lg border bg-card p-3 text-left transition-colors",
                  activeVariant === variant.id
                    ? "border-foreground"
                    : "hover:bg-muted/40",
                )}
                onClick={() => setActiveVariant(variant.id)}
                onFocus={() => setActiveVariant(variant.id)}
                onMouseEnter={() => setActiveVariant(variant.id)}
                type="button"
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-medium">{variant.label}</span>
                  {activeVariant === variant.id && (
                    <motion.span
                      className="size-2 rounded-full"
                      layoutId="active-variant-dot"
                      style={{ backgroundColor: variant.color }}
                    />
                  )}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {variant.description}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <EvidenceStream
            activeVariant={activeVariant}
            reducedMotion={shouldReduceMotion}
            updated={updated}
          />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <MetricTile
              label="Posterior mean"
              value={updated ? active.mean : prior.mean}
              detail={updated ? active.lift : "shared prior"}
              highlighted={updated}
            />
            <MetricTile
              label="95% credible interval"
              value={updated ? active.interval : "5.4%-30.0%"}
              detail="posterior mass"
              highlighted={updated}
            />
            <MetricTile
              label={activeVariant === "b" ? "P(B > A)" : "P(A > B)"}
              value={updated ? active.probability : "50.0%"}
              detail={updated ? "posterior comparison" : "before evidence"}
              highlighted={updated}
            />
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full origin-left rounded-full bg-[color:var(--lab-positive)]"
            style={{ scaleX: shouldReduceMotion ? (updated ? 1 : 0) : progress }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartGrid() {
  const xTicks = [0.05, 0.1, 0.15, 0.2, 0.25];

  return (
    <g>
      {xTicks.map((tick) => {
        const x = chart.paddingX + (tick / chart.domainMax) * innerWidth();

        return (
          <g key={tick}>
            <line
              x1={x}
              x2={x}
              y1={chart.paddingY}
              y2={chart.height - chart.paddingY}
              stroke="var(--border)"
              strokeDasharray="3 8"
              strokeWidth="1"
            />
            <text
              fill="var(--muted-foreground)"
              fontSize="12"
              textAnchor="middle"
              x={x}
              y={chart.height - 8}
            >
              {(tick * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
      <line
        x1={chart.paddingX}
        x2={chart.width - chart.paddingX}
        y1={chart.height - chart.paddingY}
        y2={chart.height - chart.paddingY}
        stroke="var(--border)"
        strokeWidth="1"
      />
    </g>
  );
}

function EvidenceStream({
  activeVariant,
  reducedMotion,
  updated,
}: {
  activeVariant: VariantId;
  reducedMotion: boolean;
  updated: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">Evidence stream</p>
          <p className="text-sm text-muted-foreground">
            Visitors and conversions flow into each posterior.
          </p>
        </div>
        <Badge variant="secondary">conversion tokens</Badge>
      </div>

      <div className="grid min-h-28 grid-cols-2 gap-3">
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={cn(
              "rounded-lg border p-3",
              activeVariant === variant.id && "border-foreground",
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{variant.shortLabel}</span>
              <span className="text-muted-foreground">
                {variant.conversions}/{variant.visitors}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              <AnimatePresence>
                {updated &&
                  evidenceTokens
                    .filter((token) => token.variant === variant.id)
                    .map((token, index) => (
                      <motion.span
                        key={token.id}
                        className={cn(
                          "size-3 rounded-full",
                          token.converted ? "bg-[color:var(--lab-positive)]" : "bg-muted-foreground/35",
                        )}
                        initial={
                          reducedMotion
                            ? false
                            : {
                                opacity: 0,
                                scale: 0.4,
                                x: variant.id === "a" ? -18 : 18,
                              }
                        }
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.4 }}
                        transition={{
                          delay: reducedMotion ? 0 : index * 0.018,
                          duration: reducedMotion ? 0 : 0.28,
                          ease: "easeOut",
                        }}
                      />
                    ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricTile({
  detail,
  highlighted,
  label,
  value,
}: {
  detail: string;
  highlighted: boolean;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      className={cn(
        "rounded-lg border bg-card p-4",
        highlighted && "border-foreground/70",
      )}
      layout
      transition={{ duration: 0.2 }}
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-normal">{value}</p>
      <p className="mt-1 text-xs uppercase text-muted-foreground">{detail}</p>
    </motion.div>
  );
}

function makeBetaPath(alpha: number, beta: number): string {
  const points = sampleBetaDistribution(alpha, beta);

  return points
    .map((point, index) => {
      const x = chart.paddingX + (point.x / chart.domainMax) * innerWidth();
      const y =
        chart.height -
        chart.paddingY -
        (point.y / globalMaxDensity) * innerHeight();

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function sampleBetaDistribution(alpha: number, beta: number) {
  return Array.from({ length: chart.samples }, (_, index) => {
    const x = (index / (chart.samples - 1)) * chart.domainMax;
    const safeX = Math.min(Math.max(x, 0.0001), 0.9999);

    return {
      x,
      y: betaPdf(safeX, alpha, beta),
    };
  });
}

function betaPdf(x: number, alpha: number, beta: number): number {
  const logDensity =
    (alpha - 1) * Math.log(x) +
    (beta - 1) * Math.log(1 - x) -
    logBeta(alpha, beta);

  return Math.exp(logDensity);
}

function logBeta(alpha: number, beta: number): number {
  return logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
}

function logGamma(value: number): number {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  let x = 0.9999999999998099;
  const adjusted = value - 1;

  coefficients.forEach((coefficient, index) => {
    x += coefficient / (adjusted + index + 1);
  });

  const t = adjusted + coefficients.length - 0.5;

  return (
    0.5 * Math.log(2 * Math.PI) +
    (adjusted + 0.5) * Math.log(t) -
    t +
    Math.log(x)
  );
}

function innerWidth() {
  return chart.width - chart.paddingX * 2;
}

function innerHeight() {
  return chart.height - chart.paddingY * 2;
}
