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
});
