export function HeroVisual() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border bg-card p-5">
      <div className="absolute inset-x-5 top-5 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
        <span>feature-lab/run-042</span>
        <span>p95 4.8ms</span>
      </div>
      <svg
        viewBox="0 0 520 300"
        className="mt-12 h-auto w-full"
        role="img"
        aria-label="Diagram of data, modeling, and low-latency serving loops"
      >
        <defs>
          <linearGradient id="lab-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--lab-accent)" />
            <stop offset="100%" stopColor="var(--foreground)" />
          </linearGradient>
        </defs>
        <rect x="18" y="42" width="132" height="72" rx="10" fill="var(--muted)" />
        <rect x="194" y="24" width="132" height="72" rx="10" fill="var(--muted)" />
        <rect x="370" y="42" width="132" height="72" rx="10" fill="var(--muted)" />
        <rect x="104" y="178" width="132" height="72" rx="10" fill="var(--muted)" />
        <rect x="284" y="178" width="132" height="72" rx="10" fill="var(--muted)" />
        <path
          d="M150 78 C180 70 171 60 194 60 M326 60 C350 60 342 78 370 78 M260 96 C258 126 192 146 170 178 M260 96 C271 130 340 145 350 178"
          fill="none"
          stroke="url(#lab-line)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {[
          ["ingest", 48, 83],
          ["features", 218, 65],
          ["model", 409, 83],
          ["eval", 147, 219],
          ["serve", 326, 219],
        ].map(([label, x, y]) => (
          <text
            key={label}
            x={x}
            y={y}
            fill="var(--foreground)"
            fontSize="15"
            fontFamily="var(--font-geist-mono)"
          >
            {label}
          </text>
        ))}
        <path
          d="M38 286 C94 260 122 276 165 250 C215 219 244 243 286 209 C330 175 360 190 397 156 C433 124 459 133 501 103"
          fill="none"
          stroke="var(--lab-accent)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded-md bg-muted p-3">
          <p className="font-mono text-muted-foreground">drift</p>
          <p className="mt-1 font-semibold">0.018</p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="font-mono text-muted-foreground">freshness</p>
          <p className="mt-1 font-semibold">99.3%</p>
        </div>
        <div className="rounded-md bg-muted p-3">
          <p className="font-mono text-muted-foreground">evals</p>
          <p className="mt-1 font-semibold">128</p>
        </div>
      </div>
    </div>
  );
}
