"use client";

import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BracesIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  Clock3Icon,
  GaugeIcon,
  ServerCogIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labDemos, type LabDemo } from "@/lib/lab";
import { cn } from "@/lib/utils";

type LatencyScenario = {
  id: "baseline" | "optimized" | "stress";
  label: string;
  budget: number;
  stages: { label: string; ms: number; note: string }[];
};

const latencyScenarios: LatencyScenario[] = [
  {
    id: "baseline",
    label: "Baseline",
    budget: 180,
    stages: [
      { label: "Feature fetch", ms: 58, note: "Remote joins dominate p95." },
      { label: "Model score", ms: 46, note: "Batching is underused." },
      { label: "Policy checks", ms: 35, note: "Rules are serialized." },
      { label: "Response", ms: 24, note: "Payload shaping is stable." },
    ],
  },
  {
    id: "optimized",
    label: "Optimized",
    budget: 180,
    stages: [
      { label: "Feature fetch", ms: 32, note: "Hot features are cached." },
      { label: "Model score", ms: 29, note: "Inference path is pooled." },
      { label: "Policy checks", ms: 22, note: "Independent checks run together." },
      { label: "Response", ms: 18, note: "Only required fields ship." },
    ],
  },
  {
    id: "stress",
    label: "Stress",
    budget: 180,
    stages: [
      { label: "Feature fetch", ms: 84, note: "Freshness retry storm." },
      { label: "Model score", ms: 54, note: "Queue depth is rising." },
      { label: "Policy checks", ms: 41, note: "Fallback path is active." },
      { label: "Response", ms: 31, note: "Trace payload expands." },
    ],
  },
];

const pipelineIncidents = [
  {
    id: "schema",
    label: "Schema drift",
    symptom: "Claims score dropped 18% after a nightly release.",
    rootCause: "A categorical field shipped with a renamed level before the feature contract was updated.",
    fix: "Block publish on schema-contract mismatch and replay the affected feature window.",
    checks: [
      { label: "Freshness", status: "pass" },
      { label: "Volume", status: "pass" },
      { label: "Schema", status: "fail" },
      { label: "Feature parity", status: "warn" },
      { label: "Publish gate", status: "blocked" },
    ],
  },
  {
    id: "freshness",
    label: "Freshness gap",
    symptom: "A streaming feature is stale for one region while batch reports look normal.",
    rootCause: "The regional topic is healthy, but consumer lag crossed the alert threshold during peak load.",
    fix: "Drain the backlog, shift traffic to the snapshot fallback, and split the lag alert by region.",
    checks: [
      { label: "Freshness", status: "fail" },
      { label: "Volume", status: "warn" },
      { label: "Schema", status: "pass" },
      { label: "Feature parity", status: "pass" },
      { label: "Publish gate", status: "blocked" },
    ],
  },
  {
    id: "publish",
    label: "Publish break",
    symptom: "Model outputs are scored correctly but missing from the decision surface.",
    rootCause: "The scoring job succeeded, then failed the downstream write because the sink quota was exhausted.",
    fix: "Queue writes with backpressure, alert on sink saturation, and make replay idempotent.",
    checks: [
      { label: "Freshness", status: "pass" },
      { label: "Volume", status: "pass" },
      { label: "Schema", status: "pass" },
      { label: "Feature parity", status: "pass" },
      { label: "Publish gate", status: "fail" },
    ],
  },
] as const;

const servingModes = [
  {
    id: "batch",
    label: "Batch",
    headline: "Best for audited, stable decisions with forgiving freshness.",
    metrics: [
      { label: "Freshness", value: "Hours" },
      { label: "Cost", value: "Low" },
      { label: "Failure mode", value: "Replay" },
      { label: "Audit trail", value: "Strong" },
    ],
  },
  {
    id: "streaming",
    label: "Streaming",
    headline: "Best when decisions need fresh features without request-time joins.",
    metrics: [
      { label: "Freshness", value: "Seconds" },
      { label: "Cost", value: "Medium" },
      { label: "Failure mode", value: "Lag" },
      { label: "Audit trail", value: "Medium" },
    ],
  },
  {
    id: "realtime",
    label: "Low latency",
    headline: "Best when the decision must happen inline and latency is a product constraint.",
    metrics: [
      { label: "Freshness", value: "Now" },
      { label: "Cost", value: "High" },
      { label: "Failure mode", value: "Timeout" },
      { label: "Audit trail", value: "Designed" },
    ],
  },
] as const;

export function LabClient() {
  return (
    <section className="grid gap-5 lg:grid-cols-3" aria-label="Decision Lab demos">
      {labDemos.map((demo) => (
        <LabDemoCard key={demo.id} demo={demo} />
      ))}
    </section>
  );
}

function LabDemoCard({ demo }: { demo: LabDemo }) {
  const Icon = demo.icon;
  const demoIndex = labDemos.findIndex((item) => item.id === demo.id) + 1;

  return (
    <Card className="h-full">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="secondary" className="gap-1.5">
            <Icon className="size-3.5" aria-hidden />
            {demo.kicker}
          </Badge>
          <span className="font-mono text-xs text-muted-foreground">
            {demoIndex}/{labDemos.length}
          </span>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-xl tracking-normal">{demo.title}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {demo.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {demo.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {demo.id === "latency-budget" ? <LatencyBudgetDemo /> : null}
        {demo.id === "pipeline-failure" ? <PipelineFailureDemo /> : null}
        {demo.id === "model-serving" ? <ModelServingDemo /> : null}
        {demo.id === "lavaan-sem" ? <LavaanSemPreview /> : null}
      </CardContent>

      <CardFooter>
        <Link
          href={demo.relatedHref}
          className="inline-flex items-center gap-2 text-sm font-medium"
        >
          {demo.relatedLabel}
          <ArrowRightIcon aria-hidden className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

function LavaanSemPreview() {
  const operators = [
    { label: "=~", detail: "latent measurement" },
    { label: "~", detail: "structural path" },
    { label: "~~", detail: "residual covariance" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/40">
            <BracesIcon className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="font-medium">PoliticalDemocracy SEM</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Build `ind60`, `dem60`, and `dem65` from indicators before
              reading the structural paths.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {operators.map((operator) => (
            <div
              key={operator.label}
              className="flex items-center justify-between rounded-lg bg-muted/45 px-3 py-2 text-sm"
            >
              <span className="font-mono">{operator.label}</span>
              <span className="text-xs text-muted-foreground">
                {operator.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LatencyBudgetDemo() {
  const [scenarioId, setScenarioId] =
    useState<LatencyScenario["id"]>("baseline");
  const scenario =
    latencyScenarios.find((item) => item.id === scenarioId) ??
    latencyScenarios[0];
  const total = scenario.stages.reduce((sum, stage) => sum + stage.ms, 0);
  const headroom = scenario.budget - total;
  const maxStage = Math.max(...scenario.stages.map((stage) => stage.ms));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {latencyScenarios.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={scenarioId === item.id ? "default" : "outline"}
            aria-pressed={scenarioId === item.id}
            onClick={() => setScenarioId(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-background p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-medium">p95 request path</p>
            <p className="text-sm text-muted-foreground">
              {total}ms total against a {scenario.budget}ms budget
            </p>
          </div>
          <Badge variant={headroom >= 0 ? "secondary" : "destructive"}>
            {headroom >= 0 ? `${headroom}ms spare` : `${Math.abs(headroom)}ms over`}
          </Badge>
        </div>

        <div className="space-y-3">
          {scenario.stages.map((stage) => (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span>{stage.label}</span>
                <span className="font-mono text-muted-foreground">
                  {stage.ms}ms
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    stage.ms === maxStage ? "bg-primary" : "bg-muted-foreground/45",
                  )}
                  style={{ width: `${Math.max(12, (stage.ms / 90) * 100)}%` }}
                />
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {stage.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineFailureDemo() {
  const [incidentId, setIncidentId] = useState<(typeof pipelineIncidents)[number]["id"]>(
    "schema",
  );
  const incident =
    pipelineIncidents.find((item) => item.id === incidentId) ??
    pipelineIncidents[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {pipelineIncidents.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={incidentId === item.id ? "default" : "outline"}
            aria-pressed={incidentId === item.id}
            onClick={() => setIncidentId(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-background p-4">
        <div className="space-y-3">
          <StatusLine icon={AlertTriangleIcon} label="Symptom" value={incident.symptom} />
          <StatusLine icon={CircleDotIcon} label="Root cause" value={incident.rootCause} />
          <StatusLine icon={ShieldCheckIcon} label="Repair" value={incident.fix} />
        </div>

        <div className="mt-4 grid gap-2">
          {incident.checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between rounded-lg bg-muted/45 px-3 py-2 text-sm"
            >
              <span>{check.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono text-xs uppercase",
                  check.status === "pass" && "text-emerald-600 dark:text-emerald-400",
                  check.status === "warn" && "text-amber-600 dark:text-amber-400",
                  (check.status === "fail" || check.status === "blocked") &&
                    "text-destructive",
                )}
              >
                {check.status === "pass" ? (
                  <CheckCircle2Icon className="size-3.5" aria-hidden />
                ) : (
                  <AlertTriangleIcon className="size-3.5" aria-hidden />
                )}
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelServingDemo() {
  const [modeId, setModeId] = useState<(typeof servingModes)[number]["id"]>(
    "streaming",
  );
  const selected =
    servingModes.find((item) => item.id === modeId) ?? servingModes[1];
  const selectedIndex = useMemo(
    () => servingModes.findIndex((item) => item.id === selected.id),
    [selected.id],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {servingModes.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={modeId === item.id ? "default" : "outline"}
            aria-pressed={modeId === item.id}
            onClick={() => setModeId(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/40">
            {selected.id === "batch" ? (
              <Clock3Icon className="size-4 text-muted-foreground" aria-hidden />
            ) : selected.id === "streaming" ? (
              <ServerCogIcon className="size-4 text-muted-foreground" aria-hidden />
            ) : (
              <GaugeIcon className="size-4 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium">{selected.label}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {selected.headline}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {selected.metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg bg-muted/45 p-3">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="mt-1 font-mono text-sm">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
          {servingModes.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "h-1.5 rounded-full",
                index <= selectedIndex ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AlertTriangleIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="text-sm leading-6">{value}</p>
      </div>
    </div>
  );
}
