"use client";

import { ArrowRightIcon, BracesIcon, SigmaIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const vectors = [
  { label: "x", values: [0.8, 0.1, 0.6, 0.3], color: "var(--lab-accent)" },
  { label: "w", values: [0.7, 0.2, 0.5, 0.4], color: "var(--lab-positive)" },
] as const;

const products = vectors[0].values.map((value, index) => ({
  id: `product-${index}`,
  x: value,
  w: vectors[1].values[index],
  product: value * vectors[1].values[index],
}));

const score = products.reduce((sum, item) => sum + item.product, 0);

export function DotProductSimilarityDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <SigmaIcon className="size-3.5" aria-hidden />
              dot product similarity
            </Badge>
            <CardTitle className="max-w-3xl text-2xl tracking-normal">
              Multiply matching coordinates, add them up, and get a score.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              A dot product is a beginner linear algebra idea that shows up
              everywhere in machine learning: regression predictions,
              embedding similarity, projections, and weighted feature scores.
            </CardDescription>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3">
            <p className="font-mono text-xs text-muted-foreground">
              x dot w
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {score.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 rounded-lg border bg-background p-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <VectorPanel vector={vectors[0]} reducedMotion={shouldReduceMotion} />
          <div className="hidden items-center justify-center lg:flex">
            <ArrowRightIcon className="size-6 text-muted-foreground" />
          </div>
          <VectorPanel vector={vectors[1]} reducedMotion={shouldReduceMotion} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="rounded-lg border bg-background p-4">
            <div className="mb-4 flex items-center gap-2">
              <BracesIcon className="size-4 text-muted-foreground" />
              <p className="font-medium">Pairwise products</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {products.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="rounded-lg border bg-muted/35 p-3"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: shouldReduceMotion ? 0 : index * 0.08 }}
                >
                  <p className="font-mono text-xs text-muted-foreground">
                    x{index + 1} * w{index + 1}
                  </p>
                  <p className="mt-2 font-mono text-sm">
                    {item.x.toFixed(1)} * {item.w.toFixed(1)}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">
                    {item.product.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <p className="font-medium">Similarity score</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The sum acts like a weighted match. Larger aligned coordinates
              push the score higher, which is why dot products are common in
              retrieval, regression, and ranking models.
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-[color:var(--lab-positive)]"
                initial={shouldReduceMotion ? false : { scaleX: 0 }}
                whileInView={shouldReduceMotion ? undefined : { scaleX: score / 1.2 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function VectorPanel({
  vector,
  reducedMotion,
}: {
  vector: (typeof vectors)[number];
  reducedMotion: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">Vector {vector.label}</p>
        <Badge variant="outline">4 features</Badge>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {vector.values.map((value, index) => (
          <motion.div
            key={`${vector.label}-${index}`}
            className={cn(
              "rounded-lg border bg-muted/35 p-3 text-center",
              "font-mono text-sm tabular-nums",
            )}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: reducedMotion ? 0 : index * 0.06 }}
          >
            <p className="text-xs text-muted-foreground">
              {vector.label}{index + 1}
            </p>
            <p className="mt-1 text-lg font-semibold">{value.toFixed(1)}</p>
            <div
              className="mx-auto mt-2 h-1.5 rounded-full"
              style={{
                width: `${Math.max(20, value * 100)}%`,
                background: vector.color,
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
