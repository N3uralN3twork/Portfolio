import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  BeakerIcon,
  InfoIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Callout({
  title,
  type = "info",
  children,
}: {
  title: string;
  type?: "info" | "warning";
  children: React.ReactNode;
}) {
  const Icon = type === "warning" ? AlertTriangleIcon : InfoIcon;

  return (
    <Alert
      className={cn(
        "my-6",
        type === "warning" &&
          "border-destructive/40 bg-destructive/10 text-destructive",
      )}
      variant={type === "warning" ? "destructive" : "default"}
    >
      <Icon />
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

type SideBySideComponent = {
  ({ children }: { children: React.ReactNode }): React.ReactElement;
  Panel: typeof SideBySidePanel;
};

function SideBySideRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 grid gap-4 md:grid-cols-2">{children}</div>
  );
}

function SideBySidePanel({
  title,
  imageSrc,
  imageAlt,
  children,
}: {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full overflow-hidden border-border/80 bg-card/95">
      {imageSrc ? (
        <div className="relative aspect-[16/9] bg-muted">
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      {title ? (
        <CardHeader>
          <CardTitle className="text-lg tracking-normal">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-foreground [&_ol]:flex [&_ol]:list-decimal [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-5 [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
        {children}
      </CardContent>
    </Card>
  );
}

export const SideBySide = SideBySideRoot as SideBySideComponent;
SideBySide.Panel = SideBySidePanel;

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
