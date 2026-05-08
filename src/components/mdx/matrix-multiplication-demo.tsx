"use client";

import { ArrowRightIcon, BracesIcon, RotateCcwIcon, SigmaIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  buildMatrixMultiplicationSteps,
  matrixA,
  matrixB,
  matrixBTransposed,
  matrixMethods,
  type MatrixMethod,
  type MatrixMethodId,
  type MatrixMultiplicationStep,
} from "@/lib/matrix-multiplication-demo";

const methodTone: Record<MatrixMethodId, string> = {
  ijk: "var(--lab-accent)",
  transposed: "var(--lab-positive)",
  blocked: "var(--primary)",
};

export function MatrixMultiplicationDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const steps = useMemo(() => buildMatrixMultiplicationSteps(), []);
  const [stepIndex, setStepIndex] = useState(0);
  const [methodId, setMethodId] = useState<MatrixMethodId>("ijk");
  const step = steps[stepIndex];
  const method =
    matrixMethods.find((item) => item.id === methodId) ?? matrixMethods[0];
  const bDisplayMatrix =
    method.id === "transposed" ? matrixBTransposed : matrixB;

  function moveStep(delta: number) {
    setStepIndex((current) => (current + delta + steps.length) % steps.length);
  }

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <SigmaIcon className="size-3.5" aria-hidden />
              matrix multiplication lab
            </Badge>
            <CardTitle className="max-w-3xl text-2xl tracking-normal">
              Step through each dot product and compare the memory layout.
            </CardTitle>
            <CardDescription className="max-w-3xl text-base leading-7">
              Matrix multiplication fills C one cell at a time. Each cell is the
              dot product of one row from A and one column from B, but the loop
              order decides whether the CPU streams or jumps through memory.
            </CardDescription>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[30rem]">
            {matrixMethods.map((item) => (
              <Button
                key={item.id}
                aria-pressed={methodId === item.id}
                className="h-auto min-h-9 justify-start whitespace-normal px-3 py-2 text-left leading-snug"
                onClick={() => setMethodId(item.id)}
                type="button"
                variant={methodId === item.id ? "default" : "outline"}
              >
                <BracesIcon className="size-3.5" aria-hidden />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 rounded-lg border bg-background p-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_0.85fr]">
              <MatrixGrid
                activeColumn={null}
                activeRow={step.rowIndex}
                label="A"
                matrix={matrixA}
                reducedMotion={shouldReduceMotion}
                tone="var(--lab-accent)"
              />
              <ArrowRightIcon className="mx-auto hidden size-5 text-muted-foreground lg:block" />
              <MatrixGrid
                activeColumn={method.id === "transposed" ? null : step.colIndex}
                activeRow={method.id === "transposed" ? step.colIndex : null}
                label={method.id === "transposed" ? "B^T view" : "B"}
                matrix={bDisplayMatrix}
                reducedMotion={shouldReduceMotion}
                tone="var(--lab-positive)"
              />
              <ArrowRightIcon className="mx-auto hidden size-5 text-muted-foreground lg:block" />
              <MatrixGrid
                activeColumn={step.colIndex}
                activeRow={step.rowIndex}
                label="C"
                matrix={stepsToMatrix(steps)}
                mutedUntil={stepIndex}
                reducedMotion={shouldReduceMotion}
                tone="var(--primary)"
              />
            </div>

            <ProductStrip
              method={method}
              reducedMotion={shouldReduceMotion}
              step={step}
            />
            <MemoryTrack
              method={method}
              reducedMotion={shouldReduceMotion}
              step={step}
            />
          </div>

          <aside className="grid content-start gap-4">
            <StepPanel
              method={method}
              reducedMotion={shouldReduceMotion}
              step={step}
              stepIndex={stepIndex}
              stepTotal={steps.length}
            />

            <div className="grid grid-cols-3 gap-2">
              {steps.map((item, index) => (
                <Button
                  key={item.id}
                  aria-label={`Show C row ${item.rowIndex + 1} column ${item.colIndex + 1}`}
                  aria-pressed={stepIndex === index}
                  className="font-mono"
                  onClick={() => setStepIndex(index)}
                  size="sm"
                  type="button"
                  variant={stepIndex === index ? "default" : "outline"}
                >
                  C{item.rowIndex + 1},{item.colIndex + 1}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => moveStep(1)}
                type="button"
              >
                <ArrowRightIcon className="size-4" aria-hidden />
                Next cell
              </Button>
              <Button
                aria-label="Reset matrix multiplication demo"
                onClick={() => setStepIndex(0)}
                size="icon"
                type="button"
                variant="outline"
              >
                <RotateCcwIcon className="size-4" aria-hidden />
              </Button>
            </div>
          </aside>
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function MatrixGrid({
  activeColumn,
  activeRow,
  label,
  matrix,
  mutedUntil,
  reducedMotion,
  tone,
}: {
  activeColumn: number | null;
  activeRow: number | null;
  label: string;
  matrix: readonly (readonly number[])[];
  mutedUntil?: number;
  reducedMotion: boolean;
  tone: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-sm font-semibold">{label}</p>
        <Badge variant="outline">
          {matrix.length} x {matrix[0].length}
        </Badge>
      </div>
      <div
        className="grid gap-2 rounded-lg border bg-muted/25 p-2"
        style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}
      >
        {matrix.flatMap((row, rowIndex) =>
          row.map((value, colIndex) => {
            const cellOrder = rowIndex * matrix[0].length + colIndex;
            const isActive =
              activeRow === rowIndex || activeColumn === colIndex;
            const isMuted =
              typeof mutedUntil === "number" && cellOrder > mutedUntil;

            return (
              <motion.div
                key={`${label}-${rowIndex}-${colIndex}`}
                className={cn(
                  "grid min-h-12 place-items-center rounded-lg border bg-background",
                  "font-mono text-sm font-semibold tabular-nums shadow-sm",
                  isMuted && "text-muted-foreground/45",
                )}
                animate={{
                  borderColor: isActive ? tone : "var(--border)",
                  scale: isActive && !reducedMotion ? 1.04 : 1,
                }}
                initial={false}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                {value}
              </motion.div>
            );
          }),
        )}
      </div>
    </div>
  );
}

function ProductStrip({
  method,
  reducedMotion,
  step,
}: {
  method: MatrixMethod;
  reducedMotion: boolean;
  step: MatrixMultiplicationStep;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            C[{step.rowIndex + 1},{step.colIndex + 1}] dot product
          </p>
          <p className="text-sm text-muted-foreground">
            Multiply matching terms, then add the products.
          </p>
        </div>
        <Badge
          variant="secondary"
          style={{ color: methodTone[method.id] }}
        >
          {method.shortLabel}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {step.products.map((item) => (
          <motion.div
            key={`${step.id}-${item.index}`}
            className="rounded-lg border bg-background p-3"
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reducedMotion ? 0 : item.index * 0.08,
              duration: reducedMotion ? 0 : 0.2,
            }}
          >
            <p className="font-mono text-xs text-muted-foreground">
              k = {item.index + 1}
            </p>
            <p className="mt-2 font-mono text-sm">
              {item.a} * {item.b} = {item.product}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              running sum {item.runningTotal}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MemoryTrack({
  method,
  reducedMotion,
  step,
}: {
  method: MatrixMethod;
  reducedMotion: boolean;
  step: MatrixMultiplicationStep;
}) {
  const bIndexes =
    method.id === "transposed"
      ? step.products.map((item) => step.colIndex * step.products.length + item.index)
      : step.products.map((item) => item.index * matrixB[0].length + step.colIndex);
  const tileIndexes =
    method.id === "blocked" ? [0, 1, 2, 3, 4, 5] : bIndexes;

  return (
    <motion.div className="rounded-lg border bg-muted/20 p-4" layout>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <MemoryStat label="A access" value={method.aAccess} />
        <MemoryStat label="B access" value={method.bAccess} />
        <MemoryStat label="C write" value={method.cAccess} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MemoryCells
          active={step.products.map((item) => step.rowIndex * step.products.length + item.index)}
          label="A row-major buffer"
          reducedMotion={reducedMotion}
          tone="var(--lab-accent)"
          total={6}
        />
        <MemoryCells
          active={method.id === "blocked" ? tileIndexes : bIndexes}
          label={method.id === "transposed" ? "B^T buffer" : "B row-major buffer"}
          reducedMotion={reducedMotion}
          tone={methodTone[method.id]}
          total={6}
        />
      </div>
    </motion.div>
  );
}

function MemoryCells({
  active,
  label,
  reducedMotion,
  tone,
  total,
}: {
  active: number[];
  label: string;
  reducedMotion: boolean;
  tone: string;
  total: number;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: total }, (_, index) => {
          const isActive = active.includes(index);

          return (
            <motion.div
              key={`${label}-${index}`}
              className="grid aspect-square place-items-center rounded border bg-background font-mono text-[0.7rem]"
              animate={{
                backgroundColor: isActive ? tone : "var(--background)",
                color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                scale: isActive && !reducedMotion ? 1.06 : 1,
              }}
              initial={false}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {index}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StepPanel({
  method,
  reducedMotion,
  step,
  stepIndex,
  stepTotal,
}: {
  method: MatrixMethod;
  reducedMotion: boolean;
  step: MatrixMultiplicationStep;
  stepIndex: number;
  stepTotal: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-medium">Active output</p>
        <Badge variant="outline">
          {stepIndex + 1} / {stepTotal}
        </Badge>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step.id}-${method.id}`}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <p className="font-mono text-sm">
            row {step.rowIndex + 1} of A x column {step.colIndex + 1} of B
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {step.sum}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {method.cacheStory}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {method.note}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MemoryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium leading-5">{value}</p>
    </div>
  );
}

function stepsToMatrix(steps: MatrixMultiplicationStep[]) {
  return [
    [steps[0].sum, steps[1].sum],
    [steps[2].sum, steps[3].sum],
  ] as const;
}
