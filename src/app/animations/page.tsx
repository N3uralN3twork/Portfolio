import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRightIcon,
  BracesIcon,
  LineChartIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  SparklesIcon,
  SquareIcon,
} from "lucide-react";
import type { ReactNode } from "react";
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

export const metadata: Metadata = {
  title: "Animations",
  description:
    "Animation examples for polished, recruiter-friendly data and ML portfolio interfaces.",
};

const snippets = {
  fadeSquare: `@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.elem {
  width: 100px;
  height: 100px;
  background: goldenrod;
  animation: fadeIn 1.6s ease-in-out infinite alternate;
}`,
  metricReveal: `.metric {
  animation: metric-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 52%;
}`,
  contentCards: `.content-card {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 34%;
}`,
  timeline: `.timeline::after {
  transform-origin: top;
  animation: fill-line linear both;
  animation-timeline: view();
  animation-range: entry 5% cover 64%;
}`
} as const;

const principles = [
  "Native CSS first",
  "Static fallback",
  "Reduced-motion aware",
  "Recruiter-readable",
];

export default function AnimationsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8">
      <header className="motion-reveal grid gap-8 lg:grid-cols-[0.72fr_0.28fr] lg:items-end">
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
              Animation patterns for data-heavy interfaces that still feel
              calm.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              These examples use scroll-driven CSS to add polish without
              hiding the substance: model metrics, case-study cards, timeline
              evidence, and code readability.
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

        <Card className="motion-card-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <SparklesIcon className="size-4 text-muted-foreground" />
              Motion contract
            </CardTitle>
            <CardDescription>
              The page works as static HTML first. Browsers with
              scroll-driven animation support get the extra detail.
            </CardDescription>
          </CardHeader>
        </Card>
      </header>

      <Separator />

      <div className="grid gap-8">
        <AnimationExample
          eyebrow="Fade-in square"
          title="Start with the smallest possible visible animation."
          description="This mirrors the golden square example, but it loops in place so the motion is immediately visible without needing a custom scroll sandbox."
          icon={<SquareIcon aria-hidden />}
          code={snippets.fadeSquare}
        >
          <FadeSquareDemo />
        </AnimationExample>

        <AnimationExample
          eyebrow="Metric reveal"
          title="Let model health indicators enter with the scroll."
          description="Metrics should feel inspected, not decorated. This pattern makes a dashboard-style block become more legible as it enters the viewport."
          icon={<LineChartIcon aria-hidden />}
          code={snippets.metricReveal}
        >
          <MetricRevealDemo />
        </AnimationExample>

        <AnimationExample
          eyebrow="Content cards"
          title="Make featured work feel sequenced and intentional."
          description="A subtle entrance helps recruiters scan a set of project cards without turning the grid into a performance."
          icon={<PanelsTopLeftIcon aria-hidden />}
          code={snippets.contentCards}
        >
          <ContentCardsDemo />
        </AnimationExample>

        <AnimationExample
          eyebrow="Timeline progress"
          title="Turn experience into evidence with a quiet progress cue."
          description="A filling timeline line can guide the eye through work history while keeping the text itself stable and readable."
          icon={<MousePointerClickIcon aria-hidden />}
          code={snippets.timeline}
        >
          <TimelineDemo />
        </AnimationExample>

      </div>

      <section className="motion-reveal grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 className="text-xl font-semibold tracking-normal">
            Implementation note
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            This page uses the native CSS Animation Timeline API directly. No
            animation dependency is required, and reduced-motion users receive a
            static version of the same content.
          </p>
        </div>
        <a
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "justify-center",
          )}
          href="https://www.joshwcomeau.com/animation/scroll-driven-animations/"
          rel="noreferrer"
          target="_blank"
        >
          Source inspiration
          <ArrowRightIcon data-icon="inline-end" />
        </a>
      </section>
    </div>
  );
}

function AnimationExample({
  eyebrow,
  title,
  description,
  icon,
  code,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  code: string;
  children: ReactNode;
}) {
  return (
    <section className="motion-reveal grid gap-4 lg:grid-cols-[0.58fr_0.42fr]">
      <Card className="motion-card-lift min-h-96">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <span className="grid size-8 place-items-center rounded-lg border bg-background [&_svg]:size-4">
              {icon}
            </span>
            {eyebrow}
          </div>
          <CardTitle className="text-2xl tracking-normal">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      <Card className="min-h-96 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-base">Essential snippet</CardTitle>
          <CardDescription className="text-primary-foreground/70">
            Compact enough to reuse, specific enough to explain the pattern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="motion-code-highlight overflow-x-auto rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-4 font-mono text-sm leading-6 text-primary-foreground">
            <code>{code}</code>
          </pre>
        </CardContent>
      </Card>
    </section>
  );
}

function FadeSquareDemo() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border bg-primary p-6 text-primary-foreground">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium text-primary-foreground/70">
          Same `fadeIn` idea, tuned for a live portfolio preview.
        </p>
        <div
          className="motion-fade-square size-28 rounded-md bg-amber-500 shadow-lg shadow-amber-500/20"
          aria-label="A golden square fading in and out"
          role="img"
        />
      </div>
    </div>
  );
}

function MetricRevealDemo() {
  const metrics = [
    ["drift", "0.018", "stable feature distribution"],
    ["freshness", "99.3%", "pipeline checks current"],
    ["evals", "128", "scenario runs compared"],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map(([label, value, detail], index) => (
        <div
          key={label}
          className="motion-metric-scrub rounded-lg border bg-background p-4"
          data-motion-delay={index}
        >
          <p className="font-mono text-xs text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function ContentCardsDemo() {
  const cards = [
    ["Retrieval evals", "Benchmarking answer quality across noisy contexts."],
    ["Claims triage", "Prioritizing review paths with calibrated likelihoods."],
    ["Latency notes", "Keeping model-serving paths understandable and fast."],
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {cards.map(([title, description], index) => (
        <article
          key={title}
          className="motion-reveal rounded-lg border bg-background p-4"
          data-motion-delay={index}
        >
          <p className="font-medium">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[color:var(--lab-accent)]"
              style={{ width: `${52 + index * 16}%` }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function TimelineDemo() {
  const items = [
    ["Frame", "What decision needs evidence?"],
    ["Model", "Which signal changes the answer?"],
    ["Explain", "Can a stakeholder inspect it?"],
  ];

  return (
    <div className="motion-timeline-track relative flex flex-col gap-4">
      {items.map(([title, description], index) => (
        <article
          key={title}
          className="motion-reveal relative grid gap-1 pl-14"
          data-motion-delay={index}
        >
          <span className="absolute left-0 top-1 grid size-10 place-items-center rounded-full border bg-background text-sm font-semibold">
            {index + 1}
          </span>
          <p className="font-medium">{title}</p>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </article>
      ))}
    </div>
  );
}

