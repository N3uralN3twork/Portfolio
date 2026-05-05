# Framer Motion in MDX Content

This project uses the `motion` package from motion.dev, imported from
`motion/react`. It is the successor path for the Framer Motion API style. When a
post needs animation, keep the animation code in a React component and use that
component from MDX.

## Recommended Pattern

Use this flow for animated content:

1. Create a client component in `src/components/mdx/`.
2. Import Motion APIs from `motion/react` inside that client component.
3. Register the component in `src/mdx-components.tsx`.
4. Use the registered component inside a `.mdx` post.

This keeps content files readable and avoids mixing complex animation logic into
the article body.

## Create a Motion Component

Create a component such as `src/components/mdx/motion-posterior-card.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

type MotionPosteriorCardProps = {
  label?: string;
  prior?: number;
  posterior?: number;
};

export function MotionPosteriorCard({
  label = "Variant B",
  prior = 0.15,
  posterior = 0.17,
}: MotionPosteriorCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const lift = posterior - prior;

  return (
    <motion.figure
      className="not-prose my-8 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <figcaption className="text-sm font-medium text-muted-foreground">
        Bayesian update
      </figcaption>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Prior evidence becomes a sharper posterior estimate.
          </p>
        </div>
        <motion.p
          className="text-3xl font-semibold"
          initial={shouldReduceMotion ? false : { scale: 0.9 }}
          whileInView={shouldReduceMotion ? undefined : { scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          +{(lift * 100).toFixed(1)}pp
        </motion.p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricBar label="Prior mean" value={prior} />
        <MetricBar label="Posterior mean" value={posterior} emphasis />
      </div>
    </motion.figure>
  );
}

function MetricBar({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={emphasis ? "h-full bg-primary" : "h-full bg-muted-foreground"}
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          whileInView={shouldReduceMotion ? undefined : { scaleX: value * 4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{ originX: 0 }}
        />
      </div>
    </div>
  );
}
```

Keep `"use client"` at the top. Motion hooks, viewport animations, gesture
handlers, and browser APIs belong in client components.

## Register the Component

Add the component to `src/mdx-components.tsx`:

```tsx
import { MotionPosteriorCard } from "@/components/mdx/motion-posterior-card";

export const mdxComponents: MDXComponents = {
  // Existing entries stay here.
  pre: MdxPre,
  Callout,
  LabChart,
  LinkCard,
  ProjectMetric,
  MotionPosteriorCard,
};
```

Use the existing structure in `src/mdx-components.tsx`; do not replace the full
object unless you are intentionally changing every MDX component.

## Use It in a Post

Prefer `.mdx` for posts that include React components:

```mdx
---
title: "Bayesian A/B Testing Notes"
description: "How priors, evidence, and posteriors move together."
date: "2026-05-04"
---

Bayesian updating is easiest to understand when the estimate moves as evidence
arrives.

<MotionPosteriorCard label="Variant B" prior={0.15} posterior={0.174} />

The posterior mean is higher because the observed conversion data adds weight to
the original prior belief.
```

Content usually lives under `content/writing/` or `content/work/`. This repo is
configured to compile both `.md` and `.mdx`, but use `.mdx` when the file
contains JSX components. Keep plain `.md` files for plain Markdown.

## Guardrails

- Import Motion from `motion/react`, not `framer-motion`.
- Keep animation logic in reusable client components instead of inline MDX.
- Pass serializable props from MDX: strings, numbers, booleans, arrays, and
  plain objects.
- Do not import server-only helpers, file system modules, or content loading
  utilities into client Motion components.
- Respect reduced motion with `useReducedMotion`.
- Prefer `viewport={{ once: true }}` for article animations so reading does not
  feel busy.
- Use `not-prose` on complex animated blocks when prose styles would interfere
  with layout.
- Avoid raw HTML `style="..."` in MDX. Use React style objects in components or
  normal class names.

## Verification

After adding or changing an MDX Motion component, run:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

The build step matters because MDX prerendering catches issues that may not show
up in unit tests, especially client/server boundary mistakes.

## Troubleshooting

If MDX says the component is not defined, confirm it is imported and registered
in `src/mdx-components.tsx`.

If the build fails with a server-only import error, move the server-only code out
of the client component and pass the needed values through props.

If the animation does not run, confirm the component file starts with
`"use client"` and imports from `motion/react`.

If JSX in a `.md` file behaves unexpectedly, rename the post to `.mdx` so future
developers can immediately see that the file contains components.
