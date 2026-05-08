import { deriveContentCategory } from "@/lib/content-category";
import { cn } from "@/lib/utils";

const categoryStyles = {
  "C++ / Systems": {
    short: "C++",
    detail: "systems",
    values: ["cache", "p95", "hot path"],
  },
  Statistics: {
    short: "STAT",
    detail: "inference",
    values: ["prior", "model", "fit"],
  },
  "ML Models": {
    short: "ML",
    detail: "modeling",
    values: ["features", "score", "eval"],
  },
  Evaluation: {
    short: "EVAL",
    detail: "comparison",
    values: ["runs", "cost", "quality"],
  },
  "Data Systems": {
    short: "DATA",
    detail: "pipelines",
    values: ["ingest", "fresh", "serve"],
  },
  Visualization: {
    short: "VIZ",
    detail: "maps",
    values: ["layers", "scale", "read"],
  },
  "Research Notes": {
    short: "NOTE",
    detail: "research",
    values: ["question", "method", "evidence"],
  },
} as const;

export function ContentCategoryThumbnail({
  title,
  tags,
  className,
}: {
  title: string;
  tags: string[];
  className?: string;
}) {
  const category = deriveContentCategory(tags);
  const style = categoryStyles[category];

  return (
    <div
      className={cn(
        "relative aspect-[16/9] overflow-hidden rounded-t-xl border-b bg-muted",
        className,
      )}
      aria-label={`${category} thumbnail for ${title}`}
      role="img"
    >
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 640 360"
        aria-hidden
        focusable="false"
      >
        <rect width="640" height="360" fill="var(--card)" />
        <rect x="0" y="0" width="640" height="96" fill="var(--muted)" />
        <rect x="0" y="264" width="640" height="96" fill="var(--muted)" />
        <path
          d="M24 235 C104 190 164 224 232 172 C294 124 360 150 420 104 C484 56 548 84 616 48"
          fill="none"
          stroke="var(--lab-accent)"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M32 286 H608"
          stroke="var(--border)"
          strokeDasharray="10 12"
          strokeWidth="3"
        />
        {[82, 202, 322, 442, 562].map((x, index) => (
          <rect
            key={x}
            x={x}
            y={index % 2 === 0 ? 136 : 158}
            width="76"
            height="44"
            rx="8"
            fill="var(--background)"
            stroke="var(--border)"
          />
        ))}
        <circle cx="514" cy="174" r="52" fill="var(--background)" />
        <circle
          cx="514"
          cy="174"
          r="52"
          fill="none"
          stroke="var(--lab-positive)"
          strokeDasharray="190 327"
          strokeLinecap="round"
          strokeWidth="8"
          transform="rotate(-90 514 174)"
        />
      </svg>
      <div className="relative flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase text-muted-foreground">
              {style.detail}
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-normal">
              {style.short}
            </p>
          </div>
          <div className="rounded-md border bg-background/80 px-2 py-1 font-mono text-xs">
            {category}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {style.values.map((value) => (
            <div
              key={value}
              className="truncate rounded-md border bg-background/85 px-2 py-1.5 font-mono text-[0.68rem] text-muted-foreground"
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
