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

  test("registers the side-by-side content panel and multifactor usage", async () => {
    const [registry, blocks, post] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(process.cwd(), "src", "components", "mdx", "blocks.tsx"),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "content",
          "work",
          "multifactor-model.mdx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("SideBySide");
    expect(registry).toContain("@/components/mdx/blocks");
    expect(blocks).toContain("export const SideBySide");
    expect(blocks).toContain("SideBySide.Panel");
    expect(post).toContain("<SideBySide>");
    expect((post.match(/<SideBySide>/g) ?? []).length).toBe(1);
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

  test("registers the logistic regression Motion playground and post", async () => {
    const [registry, demo, post] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "logistic-regression-demo.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "content",
          "writing",
          "logistic-regression-with-caret-in-r.mdx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("LogisticRegressionDemo");
    expect(registry).toContain("@/components/mdx/logistic-regression-demo");
    expect(demo).toContain('"use client"');
    expect(demo).toMatch(/from "motion\/react"/);
    expect(demo).toContain("AnimatePresence");
    expect(demo).toContain("useReducedMotion");
    expect(demo).toContain("decision boundary");
    expect(demo).not.toMatch(/from "framer-motion"/);
    expect(post).toContain("title: Logistic Regression with caret in R");
    expect(post).toContain("<LogisticRegressionDemo />");
    expect(post).toContain("## Sources");
    expect(post).toContain("https://topepo.github.io/caret/");
    expect(post).toContain("https://motion.dev/docs/react");
  });

  test("registers the matrix multiplication demo and linear algebra C++ post", async () => {
    const [registry, demo, post] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "matrix-multiplication-demo.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "content",
          "writing",
          "linear-algebra-cpp-latency.mdx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("MatrixMultiplicationDemo");
    expect(registry).toContain("@/components/mdx/matrix-multiplication-demo");
    expect(demo).toContain('"use client"');
    expect(demo).toMatch(/from "motion\/react"/);
    expect(demo).toContain("useReducedMotion");
    expect(demo).toContain("motion.");
    expect(demo).toContain("matrix multiplication");
    expect(demo).toContain("B^T view");
    expect(demo).not.toMatch(/from "framer-motion"/);
    expect(post).toContain("title: Linear Algebra in C++");
    expect(post).toContain("<MatrixMultiplicationDemo />");
    expect((post.match(/<MatrixMultiplicationDemo \/>/g) ?? []).length).toBe(1);
    expect(post).not.toContain("<DotProductSimilarityDemo />");
    expect(post).toMatch(/row-major memory layout/i);
    expect(post).toMatch(/transpos/i);
    expect(post).toMatch(/blocking/i);
    expect(post).toMatch(/SIMD/i);
  });

  test("registers the SGPV Motion demos and writing post", async () => {
    const [registry, demo, post] = await Promise.all([
      readFile(path.join(process.cwd(), "src", "mdx-components.tsx"), "utf8"),
      readFile(
        path.join(
          process.cwd(),
          "src",
          "components",
          "mdx",
          "sgpv-demos.tsx",
        ),
        "utf8",
      ),
      readFile(
        path.join(
          process.cwd(),
          "content",
          "writing",
          "second-generation-p-values.mdx",
        ),
        "utf8",
      ),
    ]);

    expect(registry).toContain("SgpvIntervalWorkbench");
    expect(registry).toContain("SgpvAppliedResultsPath");
    expect(registry).toContain("@/components/mdx/sgpv-demos");
    expect(demo).toContain('"use client"');
    expect(demo).toMatch(/from "motion\/react"/);
    expect(demo).toContain("useReducedMotion");
    expect(demo).toContain("motion.");
    expect(demo).toContain("p_delta");
    expect(demo).not.toMatch(/from "framer-motion"/);
    expect(post).toContain("title: Second-Generation p-Values");
    expect(post).toContain("<SgpvIntervalWorkbench />");
    expect(post).toContain("<SgpvAppliedResultsPath />");
    expect(post).toContain("public/sgpv/SGPV_ASA_Full_Day_Part1.Rmd");
    expect(post).toContain("https://motion.dev/docs/studio-install");
  });
});
