import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  normalizeMdxStyleAttributes,
  parseMdxStyleString,
} from "./lib/mdx-style";

describe("mdx component helpers", () => {
  test("converts legacy HTML style strings into React style objects", () => {
    expect(parseMdxStyleString("width: 21%; background-color: red")).toEqual({
      width: "21%",
      backgroundColor: "red",
    });
  });

  test("normalizes legacy MDX style attributes before compilation", () => {
    expect(normalizeMdxStyleAttributes('<col style="width: 21%" />')).toBe(
      '<col style={{ width: "21%" }} />',
    );
  });

  test("registers the Bayesian A/B Motion demo for MDX posts", async () => {
    const [registry, demo] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "bayesian-ab-demo.tsx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("BayesianABDemo");
    expect(registry).toContain("@/components/mdx/bayesian-ab-demo");
    expect(demo).toContain('"use client"');
    expect(demo).toMatch(/from "motion\/react"/);
    expect(demo).toContain("AnimatePresence");
    expect(demo).toContain("useReducedMotion");
    expect(demo).toContain("motion.path");
    expect(demo).toContain("layoutId");
    expect(demo).not.toMatch(/from "framer-motion"/);
  });

  test("registers the formula-grounded Motion demos for new writing posts", async () => {
    const [registry, randomForestDemo, lowLatencyDemo] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "random-forest-demo.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "low-latency-cpp-demo.tsx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("RandomForestDemo");
    expect(registry).toContain("@/components/mdx/random-forest-demo");
    expect(registry).toContain("LowLatencyCppDemo");
    expect(registry).toContain("@/components/mdx/low-latency-cpp-demo");

    for (const demo of [randomForestDemo, lowLatencyDemo]) {
      expect(demo).toContain('"use client"');
      expect(demo).toMatch(/from "motion\/react"/);
      expect(demo).toContain("useReducedMotion");
      expect(demo).toContain("motion.");
      expect(demo).not.toMatch(/from "framer-motion"/);
    }
  });

  test("registers the randomization schema builder and typed callouts", async () => {
    const [registry, builder, blocks] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "randomization-schema-builder.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(process.cwd(), "src", "components", "mdx", "blocks.tsx"),
        "utf8",
      ),
    ]);

    expect(registry).toContain("RandomizationSchemaBuilder");
    expect(registry).toContain("@/components/mdx/randomization-schema-builder");
    expect(builder).toContain('"use client"');
    expect(builder).toMatch(/from "motion\/react"/);
    expect(builder).toContain("useReducedMotion");
    expect(builder).toContain("buildRandomizationSchema");
    expect(builder).not.toMatch(/from "framer-motion"/);
    expect(blocks).toContain('type = "info"');
    expect(blocks).toContain('"warning"');
  });

  test("registers the lavaan SEM Motion demo for MDX lab entries", async () => {
    const [registry, demo] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "lavaan-sem-demo.tsx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("LavaanSemDemo");
    expect(registry).toContain("@/components/mdx/lavaan-sem-demo");
    expect(demo).toContain('"use client"');
    expect(demo).toMatch(/from "motion\/react"/);
    expect(demo).toContain("AnimatePresence");
    expect(demo).toContain("useReducedMotion");
    expect(demo).toContain("motion.path");
    expect(demo).toContain("PoliticalDemocracy");
    expect(demo).not.toMatch(/from "framer-motion"/);
  });
});
