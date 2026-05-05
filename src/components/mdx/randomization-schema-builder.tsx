"use client";

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ClipboardIcon,
  FlaskConicalIcon,
  HelpCircleIcon,
  RotateCcwIcon,
  ShuffleIcon,
  Table2Icon,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useMemo,
  useState,
} from "react";
import { MdxDemoCard } from "@/components/mdx/wide-demo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  buildRandomizationSchema,
  generateRandomizationSchemaRCode,
  type RandomizationFactor,
  type RandomizationSchemaConfig,
  type RandomizationSchemaRow,
} from "@/lib/randomization-schema";
import { cn } from "@/lib/utils";

const defaultFactors: RandomizationFactor[] = [
  { name: "Risk", levels: ["Low", "High"] },
];

const defaultConfig: RandomizationSchemaConfig = {
  siteCodes: ["AAA", "BBB"],
  subjectsPerSite: 16,
  blockSize: 4,
  ratio: { treatment: 3, control: 1 },
  seed: 2020,
  factors: defaultFactors,
};

export function RandomizationSchemaBuilder() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [siteText, setSiteText] = useState(defaultConfig.siteCodes.join(", "));
  const [subjectsPerSite, setSubjectsPerSite] = useState(
    String(defaultConfig.subjectsPerSite),
  );
  const [blockSize, setBlockSize] = useState(String(defaultConfig.blockSize));
  const [treatmentRatio, setTreatmentRatio] = useState(
    String(defaultConfig.ratio.treatment),
  );
  const [controlRatio, setControlRatio] = useState(
    String(defaultConfig.ratio.control),
  );
  const [seed, setSeed] = useState(String(defaultConfig.seed));
  const [factors, setFactors] = useState<RandomizationFactor[]>(defaultFactors);
  const [copied, setCopied] = useState(false);

  const config = useMemo<RandomizationSchemaConfig>(
    () => ({
      siteCodes: splitList(siteText),
      subjectsPerSite: Number(subjectsPerSite),
      blockSize: Number(blockSize),
      ratio: {
        treatment: Number(treatmentRatio),
        control: Number(controlRatio),
      },
      seed: Number(seed),
      factors,
    }),
    [blockSize, controlRatio, factors, seed, siteText, subjectsPerSite, treatmentRatio],
  );

  const schema = useMemo(() => buildRandomizationSchema(config), [config]);
  const rCode = useMemo(() => generateRandomizationSchemaRCode(config), [config]);
  const previewRows = schema.rows.slice(0, 12);
  const balanceScore = schema.valid
    ? Math.round(
        (schema.summary.treatmentPerBlock /
          (schema.summary.treatmentPerBlock + schema.summary.controlPerBlock)) *
          100,
      )
    : 0;

  async function copyRCode() {
    try {
      await navigator.clipboard.writeText(rCode);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = rCode;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function resetDemo() {
    setSiteText(defaultConfig.siteCodes.join(", "));
    setSubjectsPerSite(String(defaultConfig.subjectsPerSite));
    setBlockSize(String(defaultConfig.blockSize));
    setTreatmentRatio(String(defaultConfig.ratio.treatment));
    setControlRatio(String(defaultConfig.ratio.control));
    setSeed(String(defaultConfig.seed));
    setFactors(defaultFactors);
  }

  return (
    <MdxDemoCard>
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <FlaskConicalIcon className="size-3.5" aria-hidden />
              Randomization schema lab
            </Badge>
            <CardTitle className="max-w-2xl text-2xl tracking-normal">
              Design the schema, then inspect the assignment it produces.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-7">
              Tune sites, ratios, blocks, and strata. The validator catches the
              common mistakes before a table is generated.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={resetDemo}>
              Reset
              <RotateCcwIcon data-icon="inline-end" />
            </Button>
            <Button type="button" onClick={copyRCode}>
              {copied ? "Copied R" : "Copy R"}
              {copied ? (
                <ClipboardCheckIcon data-icon="inline-end" />
              ) : (
                <ClipboardIcon data-icon="inline-end" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <ControlPanel
            siteText={siteText}
            setSiteText={setSiteText}
            subjectsPerSite={subjectsPerSite}
            setSubjectsPerSite={setSubjectsPerSite}
            blockSize={blockSize}
            setBlockSize={setBlockSize}
            treatmentRatio={treatmentRatio}
            setTreatmentRatio={setTreatmentRatio}
            controlRatio={controlRatio}
            setControlRatio={setControlRatio}
            seed={seed}
            setSeed={setSeed}
            factors={factors}
            setFactors={setFactors}
          />

          <motion.div
            className="grid gap-5"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <ValidationPanel
              valid={schema.valid}
              errors={schema.errors}
              warnings={schema.warnings}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Subjects" value={String(schema.summary.totalSubjects)} />
              <Metric label="Blocks" value={String(schema.summary.totalBlocks)} />
              <Metric
                label="Strata/site"
                value={String(schema.summary.strataPerSite)}
              />
            </div>

            <div className="rounded-lg border bg-background p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-medium">
                    <ShuffleIcon className="size-4 text-muted-foreground" />
                    Allocation balance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Treatment share inside each valid block.
                  </p>
                </div>
                <Badge variant={schema.valid ? "secondary" : "destructive"}>
                  {schema.valid
                    ? `${schema.summary.treatmentPerBlock}T:${schema.summary.controlPerBlock}C`
                    : "invalid"}
                </Badge>
              </div>
              <Progress value={balanceScore}>
                <ProgressLabel>Treatment share</ProgressLabel>
                <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                  {schema.valid ? `${balanceScore}%` : "0%"}
                </span>
              </Progress>
            </div>

            <SchemaPreview rows={previewRows} totalRows={schema.rows.length} />
            <RCodePanel code={rCode} />
          </motion.div>
        </div>
      </CardContent>
    </MdxDemoCard>
  );
}

function ControlPanel({
  siteText,
  setSiteText,
  subjectsPerSite,
  setSubjectsPerSite,
  blockSize,
  setBlockSize,
  treatmentRatio,
  setTreatmentRatio,
  controlRatio,
  setControlRatio,
  seed,
  setSeed,
  factors,
  setFactors,
}: {
  siteText: string;
  setSiteText: (value: string) => void;
  subjectsPerSite: string;
  setSubjectsPerSite: (value: string) => void;
  blockSize: string;
  setBlockSize: (value: string) => void;
  treatmentRatio: string;
  setTreatmentRatio: (value: string) => void;
  controlRatio: string;
  setControlRatio: (value: string) => void;
  seed: string;
  setSeed: (value: string) => void;
  factors: RandomizationFactor[];
  setFactors: Dispatch<SetStateAction<RandomizationFactor[]>>;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="mb-4">
        <p className="font-medium">Design inputs</p>
        <p className="text-sm text-muted-foreground">
          Every control updates the schema immediately.
        </p>
      </div>

      <div className="space-y-4">
        <FieldLabel
          label="Site codes"
          tooltip="Comma-separated site prefixes. Codes are uppercased and must be unique."
        />
        <Textarea
          value={siteText}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setSiteText(event.target.value)
          }
          className="min-h-16"
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Subjects/site"
            tooltip="Total subjects enrolled at each site before treatment assignment."
            value={subjectsPerSite}
            onChange={setSubjectsPerSite}
          />
          <NumberField
            label="Block size"
            tooltip="Number of subjects randomized together inside each site and stratum."
            value={blockSize}
            onChange={setBlockSize}
          />
          <NumberField
            label="Treatment"
            tooltip="Treatment side of the treatment:control ratio."
            value={treatmentRatio}
            onChange={setTreatmentRatio}
          />
          <NumberField
            label="Control"
            tooltip="Control side of the treatment:control ratio."
            value={controlRatio}
            onChange={setControlRatio}
          />
        </div>

        <NumberField
          label="Seed"
          tooltip="A fixed seed makes the demo assignment reproducible."
          value={seed}
          onChange={setSeed}
        />

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel
              label="Stratification factors"
              tooltip="Use pre-treatment variables only. This demo supports up to two factors."
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={factors.length >= 2}
              onClick={() =>
                setFactors((current) => [
                  ...current,
                  { name: "SiteRisk", levels: ["A", "B"] },
                ])
              }
            >
              Add factor
            </Button>
          </div>

          {factors.length === 0 ? (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No factors selected. The schema will randomize within site only.
            </p>
          ) : (
            factors.map((factor, index) => (
              <div key={`${factor.name}-${index}`} className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="outline">Factor {index + 1}</Badge>
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setFactors((current) =>
                        current.filter((_, factorIndex) => factorIndex !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Input
                    aria-label={`Factor ${index + 1} name`}
                    value={factor.name}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateFactor(setFactors, index, {
                        name: event.target.value,
                      })
                    }
                  />
                  <Input
                    aria-label={`Factor ${index + 1} levels`}
                    value={factor.levels.join(", ")}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      updateFactor(setFactors, index, {
                        levels: splitList(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  tooltip,
  value,
  onChange,
}: {
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel label={label} tooltip={tooltip} />
      <Input
        value={value}
        type="number"
        min={1}
        step={1}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function FieldLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium">
      {label}
      <span className="group/help relative inline-flex">
        <button
          type="button"
          className="rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${label}: ${tooltip}`}
        >
          <HelpCircleIcon className="size-3.5" />
        </button>
        <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-56 -translate-x-1/2 rounded-md border bg-popover px-2.5 py-2 text-xs font-normal leading-5 text-popover-foreground shadow-md group-hover/help:block group-focus-within/help:block">
          {tooltip}
        </span>
      </span>
    </span>
  );
}

function ValidationPanel({
  valid,
  errors,
  warnings,
}: {
  valid: boolean;
  errors: string[];
  warnings: string[];
}) {
  const messages = valid
    ? warnings.length > 0
      ? warnings
      : ["This schema is internally valid for the requested design."]
    : errors;

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        valid
          ? "border-[color:var(--lab-positive)]/35 bg-[color:var(--lab-positive)]/10"
          : "border-destructive/35 bg-destructive/10",
      )}
    >
      <div className="mb-2 flex items-center gap-2 font-medium">
        {valid ? (
          <CheckCircle2Icon className="size-4 text-[color:var(--lab-positive)]" />
        ) : (
          <AlertTriangleIcon className="size-4 text-destructive" />
        )}
        {valid ? "Valid schema" : "Schema needs attention"}
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-normal">{value}</p>
    </div>
  );
}

function SchemaPreview({
  rows,
  totalRows,
}: {
  rows: RandomizationSchemaRow[];
  totalRows: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div>
          <p className="flex items-center gap-2 font-medium">
            <Table2Icon className="size-4 text-muted-foreground" />
            Schema preview
          </p>
          <p className="text-sm text-muted-foreground">
            Showing {rows.length} of {totalRows} generated assignments.
          </p>
        </div>
        <Badge variant="outline">Code Site Subject Block Group</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              {["Code", "Site", "Subject", "Block", "Group", "Factors"].map(
                (header) => (
                  <th key={header} className="px-3 py-2 font-medium">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-5 text-muted-foreground" colSpan={6}>
                  Fix the validation messages to generate a preview.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.code} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                  <td className="px-3 py-2">{row.site}</td>
                  <td className="px-3 py-2">{row.subject}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.block}</td>
                  <td className="px-3 py-2">
                    <Badge variant={row.group === "T" ? "default" : "secondary"}>
                      {row.group}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatFactors(row.factorValues)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RCodePanel({ code }: { code: string }) {
  return (
    <div className="rounded-lg border bg-background">
      <div className="border-b p-4">
        <p className="font-medium">Generated R skeleton</p>
        <p className="text-sm text-muted-foreground">
          Mirrors the active controls with `randomizr::block_ra()`.
        </p>
      </div>
      <pre className="max-h-80 overflow-auto p-4 text-xs leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function updateFactor(
  setFactors: Dispatch<SetStateAction<RandomizationFactor[]>>,
  index: number,
  patch: Partial<RandomizationFactor>,
) {
  setFactors((current) =>
    current.map((factor, factorIndex) =>
      factorIndex === index ? { ...factor, ...patch } : factor,
    ),
  );
}

function splitList(value: string) {
  return value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatFactors(factors: Record<string, string>) {
  const entries = Object.entries(factors);

  if (entries.length === 0) {
    return "site only";
  }

  return entries.map(([name, value]) => `${name}: ${value}`).join(", ");
}
