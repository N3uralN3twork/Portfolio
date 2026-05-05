"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BarChart3Icon,
  BracesIcon,
  CheckCircle2Icon,
  CircleIcon,
  PlayIcon,
  RotateCcwIcon,
  SparklesIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "motion/react";
import type { Variants } from "motion/react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const CHART = {
  width: 760,
  height: 320,
  paddingX: 34,
  paddingY: 28,
  domainMax: 0.3,
  samples: 76,
} as const;

const prior = {
  label: "Prior",
  alpha: 3,
  beta: 17,
  description: "Shared prior belief before the experiment",
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
    color: "var(--lab-accent)",
    bgClass: "bg-[color:var(--lab-accent)]",
    description: "Control keeps a tighter posterior around the original rate.",
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
    color: "var(--lab-positive)",
    bgClass: "bg-[color:var(--lab-positive)]",
    description: "Treatment shifts the posterior right after stronger evidence.",
  },
] as const;

type VariantId = (typeof variants)[number]["id"];

const priorPath = makeBetaPath(prior.alpha, prior.beta);
const posteriorPaths = {
  a: makeBetaPath(variants[0].alpha, variants[0].beta),
  b: makeBetaPath(variants[1].alpha, variants[1].beta),
};

const evidenceTokens = [
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `a-visitor-${index}`,
    variant: "a" as VariantId,
    converted: index < 5,
  })),
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `b-visitor-${index}`,
    variant: "b" as VariantId,
    converted: index < 7,
  })),
];

const principles = [
  "Bayesian updating",
  "Beta-binomial",
  "A/B testing",
  "Motion for React",
];

const revealVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
} satisfies Variants;

export function AnimationsClient() {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 lg:px-8">
      <motion.header
        className="grid gap-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end"
        initial={shouldReduceMotion ? false : "hidden"}
        animate="show"
        variants={revealVariants}
      >
        <div className="flex max-w-3xl flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {principles.map((principle) => (
              <Badge key={principle} variant="secondary">
                {principle}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">
              Bayesian updating for an A/B test.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Watch a shared Beta(3, 17) prior absorb conversion evidence from
              two variants and become two posterior beliefs about the true
              conversion rate.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className={buttonVariants({ size: "lg" })} href="/work">
              View work
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "lg" })}
              href="/writing"
            >
              Read writing
              <BracesIcon data-icon="inline-end" />
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SparklesIcon className="size-4 text-muted-foreground" />
              Posterior lift
            </CardTitle>
            <CardDescription>
              Variant B moves the posterior mean to 17.2%, about +4.7pp above
              Variant A after observing the experiment.
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.header>

      <Separator />

      <motion.section
        initial={shouldReduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-12% 0px" }}
        variants={revealVariants}
      >
        <BayesianABScene reduceMotion={shouldReduceMotion} />
      </motion.section>
    </div>
  );
}

function BayesianABScene({ reduceMotion }: { reduceMotion: boolean }) {
  const [updated, setUpdated] = useState(false);
  const [activeVariant, setActiveVariant] = useState<VariantId>("b");
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start 82%", "end 38%"],
  });
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 115,
    damping: 24,
  });
  const active =
    variants.find((variant) => variant.id === activeVariant) ?? variants[1];

  return (
    <Card ref={sceneRef} className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="grid size-8 place-items-center rounded-lg border bg-background">
            <BarChart3Icon className="size-4" aria-hidden />
          </span>
          Bayesian A/B update
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <CardTitle className="text-2xl tracking-normal">
              Prior belief plus conversion evidence becomes a posterior.
            </CardTitle>
            <CardDescription className="mt-2 max-w-3xl text-base leading-7">
              The same starting belief is applied to both arms. Running the
              update adds conversions and non-conversions to each Beta
              distribution, then the curves separate into Variant A and
              Variant B posteriors.
            </CardDescription>
          </div>
          <motion.button
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-w-36 justify-center",
            )}
            onClick={() => setUpdated((value) => !value)}
            type="button"
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
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
          </motion.button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 rounded-lg border bg-background p-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full origin-left rounded-full bg-[color:var(--lab-accent)]"
              style={{ scaleX: reduceMotion ? 1 : scrollProgress }}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.68fr_0.32fr]">
            <DistributionChart
              activeVariant={activeVariant}
              reduceMotion={reduceMotion}
              setActiveVariant={setActiveVariant}
              updated={updated}
            />

            <div className="grid content-start gap-3">
              <OutcomeCard activeVariant={activeVariant} updated={updated} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-${updated ? "posterior" : "prior"}`}
                  className="rounded-lg border bg-card p-4"
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? undefined
                      : { opacity: 0, y: -8, scale: 0.98 }
                  }
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {updated ? active.label : prior.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal">
                    {updated ? active.mean : "15.0%"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {updated
                      ? active.description
                      : "Before evidence arrives, both variants share the same Beta prior."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <EvidenceStream
            reduceMotion={reduceMotion}
            setActiveVariant={setActiveVariant}
            updated={updated}
          />

          <div className="grid gap-3 md:grid-cols-3">
            {variants.map((variant) => (
              <MetricTile
                key={variant.id}
                active={variant.id === activeVariant}
                reduceMotion={reduceMotion}
                setActiveVariant={setActiveVariant}
                updated={updated}
                variant={variant}
              />
            ))}
            <motion.div
              className="relative overflow-hidden rounded-lg border bg-primary p-4 text-primary-foreground"
              layout
            >
              <AnimatePresence>
                {updated ? (
                  <motion.span
                    className="absolute inset-x-3 top-3 h-1 rounded-full bg-[color:var(--lab-positive)]"
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    style={{ transformOrigin: "left" }}
                  />
                ) : null}
              </AnimatePresence>
              <p className="text-sm text-primary-foreground/70">
                Probability B beats A
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-normal">
                {updated ? "97.6%" : "--"}
              </p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/70">
                {updated
                  ? "Posterior comparison strongly favors the treatment."
                  : "Run the update to compare posterior draws."}
              </p>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributionChart({
  activeVariant,
  reduceMotion,
  setActiveVariant,
  updated,
}: {
  activeVariant: VariantId;
  reduceMotion: boolean;
  setActiveVariant: (variant: VariantId) => void;
  updated: boolean;
}) {
  return (
    <div className="rounded-lg border bg-primary p-4 text-primary-foreground">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary-foreground/70">
            Conversion rate belief
          </p>
          <p className="mt-1 text-lg font-semibold tracking-normal">
            Beta(3, 17) to Beta posteriors
          </p>
        </div>
        <div className="flex gap-2">
          {variants.map((variant) => (
            <motion.button
              key={variant.id}
              className={cn(
                "relative rounded-lg border border-primary-foreground/15 px-3 py-2 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                activeVariant === variant.id
                  ? "text-primary"
                  : "text-primary-foreground/70",
              )}
              onClick={() => setActiveVariant(variant.id)}
              onPointerEnter={() => setActiveVariant(variant.id)}
              type="button"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              {activeVariant === variant.id ? (
                <motion.span
                  className="absolute inset-0 rounded-lg bg-primary-foreground"
                  layoutId="active-variant-pill"
                  transition={{ type: "spring", stiffness: 360, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10">{variant.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <svg
        className="h-auto w-full overflow-visible"
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
        role="img"
        aria-label="Animated Bayesian posterior distributions for Variant A and Variant B"
      >
        <GridLines />
        <motion.path
          d={priorPath}
          fill="none"
          stroke="currentColor"
          strokeDasharray="6 8"
          strokeLinecap="round"
          strokeWidth="3"
          className="text-primary-foreground/35"
          initial={false}
          animate={{ opacity: updated ? 0.22 : 0.9 }}
          transition={{ duration: reduceMotion ? 0 : 0.4 }}
        />
        {variants.map((variant) => (
          <motion.path
            key={variant.id}
            d={updated ? posteriorPaths[variant.id] : priorPath}
            fill="none"
            stroke={variant.color}
            strokeLinecap="round"
            strokeWidth={activeVariant === variant.id ? 6 : 3.5}
            initial={false}
            animate={{
              d: updated ? posteriorPaths[variant.id] : priorPath,
              opacity: !updated || activeVariant === variant.id ? 1 : 0.45,
            }}
            transition={{
              d: { duration: reduceMotion ? 0 : 0.8, ease: "easeInOut" },
              opacity: { duration: reduceMotion ? 0 : 0.2 },
              strokeWidth: { duration: reduceMotion ? 0 : 0.2 },
            }}
          />
        ))}
        <AxisLabels />
      </svg>
    </div>
  );
}

function GridLines() {
  const chartLeft = CHART.paddingX;
  const chartRight = CHART.width - CHART.paddingX;
  const chartBottom = CHART.height - CHART.paddingY;

  return (
    <g>
      {[0.05, 0.1, 0.15, 0.2, 0.25].map((value) => {
        const x = xScale(value);

        return (
          <g key={value}>
            <line
              x1={x}
              x2={x}
              y1={CHART.paddingY}
              y2={chartBottom}
              stroke="currentColor"
              strokeOpacity="0.08"
            />
            <text
              x={x}
              y={CHART.height - 4}
              fill="currentColor"
              opacity="0.56"
              textAnchor="middle"
              className="text-[11px]"
            >
              {Math.round(value * 100)}%
            </text>
          </g>
        );
      })}
      <line
        x1={chartLeft}
        x2={chartRight}
        y1={chartBottom}
        y2={chartBottom}
        stroke="currentColor"
        strokeOpacity="0.18"
      />
    </g>
  );
}

function AxisLabels() {
  return (
    <g>
      <text
        x={CHART.paddingX}
        y={20}
        fill="currentColor"
        opacity="0.6"
        className="text-[11px]"
      >
        density
      </text>
      <text
        x={CHART.width - CHART.paddingX}
        y={20}
        fill="currentColor"
        opacity="0.6"
        textAnchor="end"
        className="text-[11px]"
      >
        conversion rate
      </text>
    </g>
  );
}

function OutcomeCard({
  activeVariant,
  updated,
}: {
  activeVariant: VariantId;
  updated: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-sm font-medium text-muted-foreground">
        {updated ? "Headline result" : "Starting point"}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-normal">
        {updated ? "Variant B leads by +4.7pp" : "Both arms share one prior"}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {updated
          ? `The ${activeVariant === "b" ? "highlighted" : "comparison"} posterior shows the treatment pulling away after 72 conversions.`
          : "Run the update to add observed conversions and non-conversions to the prior."}
      </p>
    </div>
  );
}

function EvidenceStream({
  reduceMotion,
  setActiveVariant,
  updated,
}: {
  reduceMotion: boolean;
  setActiveVariant: (variant: VariantId) => void;
  updated: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[0.2fr_0.8fr] md:items-center">
      <div>
        <p className="text-sm font-medium">Evidence stream</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Visitors land, conversions light up, and each arm updates its Beta
          posterior.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            className="rounded-lg border bg-background p-3 text-left"
            onClick={() => setActiveVariant(variant.id)}
            type="button"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{variant.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {variant.conversions}/{variant.visitors}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {evidenceTokens
                .filter((token) => token.variant === variant.id)
                .map((token, index) => (
                  <motion.span
                    key={token.id}
                    className={cn(
                      "grid size-5 place-items-center rounded-full border",
                      token.converted
                        ? `${variant.bgClass} border-transparent`
                        : "bg-muted",
                    )}
                    initial={reduceMotion ? false : { opacity: 0.25, scale: 0.7 }}
                    animate={{
                      opacity: updated ? 1 : 0.35,
                      scale: updated ? 1 : 0.82,
                    }}
                    transition={{
                      delay: reduceMotion ? 0 : index * 0.025,
                      duration: reduceMotion ? 0 : 0.26,
                    }}
                  >
                    {token.converted ? (
                      <CheckCircle2Icon
                        className="size-3 text-primary"
                        aria-hidden
                      />
                    ) : (
                      <CircleIcon
                        className="size-2 text-muted-foreground"
                        aria-hidden
                      />
                    )}
                  </motion.span>
                ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricTile({
  active,
  reduceMotion,
  setActiveVariant,
  updated,
  variant,
}: {
  active: boolean;
  reduceMotion: boolean;
  setActiveVariant: (variant: VariantId) => void;
  updated: boolean;
  variant: (typeof variants)[number];
}) {
  return (
    <motion.button
      className={cn(
        "relative rounded-lg border bg-card p-4 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        active && "border-foreground",
      )}
      onClick={() => setActiveVariant(variant.id)}
      onPointerEnter={() => setActiveVariant(variant.id)}
      type="button"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      {active ? (
        <motion.span
          className="absolute inset-0 rounded-lg bg-muted/60"
          layoutId="active-metric-tile"
          transition={{ type: "spring", stiffness: 360, damping: 32 }}
        />
      ) : null}
      <span className="relative z-10 block">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">{variant.label}</span>
          <span className={cn("size-2.5 rounded-full", variant.bgClass)} />
        </span>
        <span className="mt-3 block text-3xl font-semibold tracking-normal">
          {updated ? variant.mean : "15.0%"}
        </span>
        <span className="mt-2 block text-sm leading-6 text-muted-foreground">
          {updated
            ? `95% CrI ${variant.interval}`
            : "Prior mean before observed traffic"}
        </span>
      </span>
    </motion.button>
  );
}

function makeBetaPath(alpha: number, beta: number) {
  const points = Array.from({ length: CHART.samples }, (_, index) => {
    const x =
      0.001 +
      (index / (CHART.samples - 1)) * (CHART.domainMax - 0.002);
    return {
      x,
      y: betaDensity(x, alpha, beta),
    };
  });
  const maxDensity = Math.max(
    ...[
      ...sampleDensities(prior.alpha, prior.beta),
      ...sampleDensities(variants[0].alpha, variants[0].beta),
      ...sampleDensities(variants[1].alpha, variants[1].beta),
    ],
  );

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      const x = xScale(point.x);
      const y = yScale(point.y, maxDensity);
      return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function sampleDensities(alpha: number, beta: number) {
  return Array.from({ length: CHART.samples }, (_, index) => {
    const x =
      0.001 +
      (index / (CHART.samples - 1)) * (CHART.domainMax - 0.002);
    return betaDensity(x, alpha, beta);
  });
}

function xScale(value: number): number {
  const width = CHART.width - CHART.paddingX * 2;
  return CHART.paddingX + (value / CHART.domainMax) * width;
}

function yScale(value: number, maxDensity: number): number {
  const height = CHART.height - CHART.paddingY * 2;
  return CHART.height - CHART.paddingY - (value / maxDensity) * height;
}

function betaDensity(x: number, alpha: number, beta: number): number {
  return Math.exp(
    (alpha - 1) * Math.log(x) +
      (beta - 1) * Math.log(1 - x) -
      logBeta(alpha, beta),
  );
}

function logBeta(alpha: number, beta: number): number {
  return logGamma(alpha) + logGamma(beta) - logGamma(alpha + beta);
}

function logGamma(value: number): number {
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.507343278686905, -0.13857109526572012,
    9.984369578019572e-6, 1.5056327351493116e-7,
  ];

  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }

  const adjusted = value - 1;
  const sum = coefficients.reduce(
    (total, coefficient, index) => total + coefficient / (adjusted + index + 1),
    0.9999999999998099,
  );
  const t = adjusted + coefficients.length - 0.5;

  return (
    0.5 * Math.log(2 * Math.PI) +
    (adjusted + 0.5) * Math.log(t) -
    t +
    Math.log(sum)
  );
}
