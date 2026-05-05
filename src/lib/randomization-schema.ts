export type TreatmentGroup = "T" | "C";

export type RandomizationFactor = {
  name: string;
  levels: string[];
};

export type RandomizationSchemaConfig = {
  siteCodes: string[];
  subjectsPerSite: number;
  blockSize: number;
  ratio: {
    treatment: number;
    control: number;
  };
  seed: number;
  factors?: RandomizationFactor[];
};

export type RandomizationSchemaRow = {
  code: string;
  site: string;
  subject: string;
  block: string;
  group: TreatmentGroup;
  factorValues: Record<string, string>;
};

export type RandomizationSchemaSummary = {
  totalSubjects: number;
  totalBlocks: number;
  strataPerSite: number;
  treatmentPerBlock: number;
  controlPerBlock: number;
  subjectsPerStratum: number;
};

export type RandomizationSchemaValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config: RandomizationSchemaConfig;
  strata: Array<Record<string, string>>;
};

export type RandomizationSchemaResult = RandomizationSchemaValidation & {
  rows: RandomizationSchemaRow[];
  summary: RandomizationSchemaSummary;
};

const emptySummary: RandomizationSchemaSummary = {
  totalSubjects: 0,
  totalBlocks: 0,
  strataPerSite: 0,
  treatmentPerBlock: 0,
  controlPerBlock: 0,
  subjectsPerStratum: 0,
};

export function validateRandomizationSchemaConfig(
  input: RandomizationSchemaConfig,
): RandomizationSchemaValidation {
  const config = normalizeConfig(input);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.siteCodes.length === 0) {
    errors.push("Enter at least one site code.");
  }

  if (new Set(config.siteCodes).size !== config.siteCodes.length) {
    errors.push("Please enter unique site codes.");
  }

  if (!isPositiveInteger(config.subjectsPerSite)) {
    errors.push("Subjects per site must be a positive integer.");
  }

  if (!isPositiveInteger(config.blockSize)) {
    errors.push("Block size must be a positive integer.");
  }

  if (!isPositiveInteger(config.ratio.treatment)) {
    errors.push("Treatment ratio must be a positive integer.");
  }

  if (!isPositiveInteger(config.ratio.control)) {
    errors.push("Control ratio must be a positive integer.");
  }

  if (!isPositiveInteger(config.seed)) {
    errors.push("Seed must be a positive integer.");
  }

  if (config.factors.length > 2) {
    errors.push("Use no more than two stratification factors in this demo.");
  }

  for (const factor of config.factors) {
    if (!factor.name) {
      errors.push("Every factor needs a name.");
    }

    if (factor.levels.length < 1) {
      errors.push(`Factor ${factor.name || "Unnamed"} needs at least one level.`);
    }

    if (new Set(factor.levels).size !== factor.levels.length) {
      errors.push(`Factor ${factor.name || "Unnamed"} has duplicate levels.`);
    }
  }

  const factorNames = config.factors.map((factor) => factor.name);
  if (new Set(factorNames).size !== factorNames.length) {
    errors.push("Factor names must be unique.");
  }

  const strata = buildStrata(config.factors);
  const strataCount = strata.length;
  const ratioTotal = config.ratio.treatment + config.ratio.control;

  if (strataCount > 0 && config.subjectsPerSite % strataCount !== 0) {
    errors.push("Subjects per site must divide evenly across factor strata.");
  }

  if (config.blockSize % ratioTotal !== 0) {
    errors.push("Block size must be divisible by the treatment/control ratio total.");
  }

  const subjectsPerStratum =
    strataCount > 0 ? config.subjectsPerSite / strataCount : config.subjectsPerSite;

  if (
    Number.isFinite(subjectsPerStratum) &&
    isPositiveInteger(subjectsPerStratum) &&
    config.blockSize > 0 &&
    subjectsPerStratum % config.blockSize !== 0
  ) {
    errors.push("Block size must divide evenly within each site and stratum.");
  }

  if (config.blockSize < ratioTotal) {
    warnings.push(
      "A block smaller than the full ratio cycle cannot represent the requested allocation cleanly.",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    config,
    strata,
  };
}

export function buildRandomizationSchema(
  input: RandomizationSchemaConfig,
): RandomizationSchemaResult {
  const validation = validateRandomizationSchemaConfig(input);

  if (!validation.valid) {
    return {
      ...validation,
      rows: [],
      summary: emptySummary,
    };
  }

  const { config, strata } = validation;
  const ratioTotal = config.ratio.treatment + config.ratio.control;
  const treatmentPerBlock = (config.blockSize / ratioTotal) * config.ratio.treatment;
  const controlPerBlock = (config.blockSize / ratioTotal) * config.ratio.control;
  const subjectsPerStratum = config.subjectsPerSite / strata.length;
  const blocksPerStratum = subjectsPerStratum / config.blockSize;
  const rows: RandomizationSchemaRow[] = [];

  for (const site of config.siteCodes) {
    let subjectIndex = 1;

    strata.forEach((factorValues, stratumIndex) => {
      for (let blockIndex = 1; blockIndex <= blocksPerStratum; blockIndex += 1) {
        const block = `${site}-S${stratumIndex + 1}-B${blockIndex}`;
        const groups = shuffle(
          [
            ...Array<TreatmentGroup>(treatmentPerBlock).fill("T"),
            ...Array<TreatmentGroup>(controlPerBlock).fill("C"),
          ],
          seededRandom(`${config.seed}:${site}:${stratumIndex}:${blockIndex}`),
        );

        for (const group of groups) {
          const subject = String(subjectIndex).padStart(2, "0");
          rows.push({
            code: `${site}${subject}${group}`,
            site,
            subject,
            block,
            group,
            factorValues,
          });
          subjectIndex += 1;
        }
      }
    });
  }

  return {
    ...validation,
    rows,
    summary: {
      totalSubjects: rows.length,
      totalBlocks: config.siteCodes.length * strata.length * blocksPerStratum,
      strataPerSite: strata.length,
      treatmentPerBlock,
      controlPerBlock,
      subjectsPerStratum,
    },
  };
}

export function generateRandomizationSchemaRCode(
  input: RandomizationSchemaConfig,
): string {
  const config = normalizeConfig(input);
  const factorLines = config.factors
    .map(
      (factor) =>
        `  ${sanitizeRName(factor.name)} = c(${factor.levels.map(quoteR).join(", ")})`,
    )
    .join(",\n");

  return [
    "library(dplyr)",
    "library(tidyr)",
    "library(randomizr)",
    "",
    `set.seed(${config.seed})`,
    `sites <- c(${config.siteCodes.map(quoteR).join(", ")})`,
    `subjects_per_site <- ${config.subjectsPerSite}`,
    `block_size <- ${config.blockSize}`,
    `ratio <- c(T = ${config.ratio.treatment}, C = ${config.ratio.control})`,
    factorLines ? `factors <- crossing(\n${factorLines}\n)` : "factors <- tibble(.stratum = 1)",
    "",
    "schema <- sites |> lapply(function(site) {",
    "  strata <- factors",
    "  per_stratum <- subjects_per_site / nrow(strata)",
    "  strata |>",
    "    mutate(.stratum = row_number()) |>",
    "    uncount(per_stratum) |>",
    "    group_by(.stratum) |>",
    "    mutate(",
    "      Site = site,",
    "      Subject = sprintf('%02d', row_number()),",
    "      Block = paste(site, .stratum, ceiling(row_number() / block_size), sep = '-'),",
    "      Group = block_ra(",
    "        blocks = Block,",
    "        conditions = c('T', 'C'),",
    "        block_prob_each = matrix(",
    "          rep(ratio / sum(ratio), n_distinct(Block)),",
    "          ncol = 2,",
    "          byrow = TRUE",
    "        )",
    "      ),",
    "      Code = paste0(Site, Subject, Group)",
    "    ) |>",
    "    ungroup() |>",
    "    select(Code, Site, Subject, Block, Group, everything(), -.stratum)",
    "}) |> bind_rows()",
    "",
    "schema",
  ].join("\n");
}

function normalizeConfig(input: RandomizationSchemaConfig): RandomizationSchemaConfig & {
  factors: RandomizationFactor[];
} {
  return {
    siteCodes: input.siteCodes
      .map((site) => site.trim().toUpperCase())
      .filter(Boolean),
    subjectsPerSite: Number(input.subjectsPerSite),
    blockSize: Number(input.blockSize),
    ratio: {
      treatment: Number(input.ratio.treatment),
      control: Number(input.ratio.control),
    },
    seed: Number(input.seed),
    factors: (input.factors ?? [])
      .slice(0, 2)
      .map((factor) => ({
        name: factor.name.trim(),
        levels: factor.levels.map((level) => level.trim()).filter(Boolean),
      }))
      .filter((factor) => factor.name || factor.levels.length > 0),
  };
}

function buildStrata(factors: RandomizationFactor[]): Array<Record<string, string>> {
  if (factors.length === 0) {
    return [{}];
  }

  return factors.reduce<Array<Record<string, string>>>(
    (strata, factor) =>
      strata.flatMap((stratum) =>
        factor.levels.map((level) => ({
          ...stratum,
          [factor.name]: level,
        })),
      ),
    [{}],
  );
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function seededRandom(seedText: string) {
  let state = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    state ^= seedText.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isPositiveInteger(value: number) {
  return Number.isInteger(value) && value > 0;
}

function quoteR(value: string) {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function sanitizeRName(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9_.]/g, "_");
  return /^[A-Za-z.]/.test(cleaned) ? cleaned : `factor_${cleaned}`;
}
