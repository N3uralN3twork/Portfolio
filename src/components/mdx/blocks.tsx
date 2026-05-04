import Link from "next/link";
import { ArrowUpRightIcon, BeakerIcon, InfoIcon, SigmaIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Callout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Alert className="my-6">
      <InfoIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

export function ProjectMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <p className="text-3xl font-semibold tracking-normal">{value}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

export function LinkCard({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="my-6 flex items-start justify-between gap-4 rounded-lg border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40"
    >
      <span className="flex flex-col gap-1">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{children}</span>
      </span>
      <ArrowUpRightIcon className="shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

export function LabChart({ mode = "posterior" }: { mode?: "posterior" | "latency" }) {
  const bars =
    mode === "latency"
      ? [34, 42, 58, 49, 76, 61, 44, 37, 31]
      : [12, 20, 37, 64, 88, 71, 46, 25, 13];

  return (
    <div className="my-8 rounded-lg border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BeakerIcon className="text-muted-foreground" aria-hidden />
          {mode === "latency" ? "Latency distribution" : "Posterior mass"}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {mode === "latency" ? "p50 -> p99" : "prior -> posterior"}
        </span>
      </div>
      <div className="flex h-36 items-end gap-2">
        {bars.map((height, index) => (
          <div
            key={`${mode}-${index}`}
            className={cn(
              "min-w-0 flex-1 rounded-t bg-primary/80",
              index === 4 && "bg-[color:var(--lab-accent)]",
            )}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}
