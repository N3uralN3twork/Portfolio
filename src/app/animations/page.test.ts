import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";

const routeDir = path.join(process.cwd(), "src", "app", "animations");

describe("animations route", () => {
  test("uses the Motion package client island recommended by motion.dev", async () => {
    const [page, client] = await Promise.all([
      readFile(path.join(routeDir, "page.tsx"), "utf8"),
      readFile(path.join(routeDir, "animations-client.tsx"), "utf8"),
    ]);

    expect(page).toContain("AnimationsClient");
    expect(client).toContain('"use client"');
    expect(client).toMatch(/from "motion\/react"/);
    expect(client).toContain("useScroll");
    expect(client).toContain("useReducedMotion");
    expect(client).not.toMatch(/from "framer-motion"/);
  });

  test("removes CSS Animation Timeline usage from the animations route", async () => {
    const [page, client] = await Promise.all([
      readFile(path.join(routeDir, "page.tsx"), "utf8"),
      readFile(path.join(routeDir, "animations-client.tsx"), "utf8"),
    ]);

    expect(`${page}\n${client}`).not.toContain("animation-timeline");
    expect(`${page}\n${client}`).not.toContain(
      "@supports (animation-timeline: view())",
    );
  });

  test("focuses the page on one Bayesian A/B updating animation", async () => {
    const client = await readFile(
      path.join(routeDir, "animations-client.tsx"),
      "utf8",
    );
    const packageJson = JSON.parse(
      await readFile(path.join(process.cwd(), "package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };

    expect(packageJson.dependencies).toHaveProperty("motion");
    expect(packageJson.dependencies).not.toHaveProperty("framer-motion");
    expect(client).toContain("BayesianABScene");
    expect(client).toContain("Bayesian");
    expect(client).toContain("Beta");
    expect(client).toContain("Variant A");
    expect(client).toContain("Variant B");
    expect(client).toContain("AnimatePresence");
    expect(client).toContain("layoutId");
    expect(client).toContain("motion.path");
    expect(client).toContain("whileTap");
    expect(client).not.toContain("PipelineScene");
    expect(client).not.toContain("Ingest");
    expect(client).not.toContain("Score");
    expect(client).not.toContain("Review");
    expect(client).not.toContain("threshold");
    expect(client).not.toContain("MetricRevealDemo");
    expect(client).not.toContain("ContentCardsDemo");
    expect(client).not.toContain("TimelineDemo");
  });

  test("does not render implementation code on the animations page", async () => {
    const client = await readFile(
      path.join(routeDir, "animations-client.tsx"),
      "utf8",
    );

    expect(client).not.toContain("<pre");
    expect(client).not.toContain("<code");
    expect(client).not.toContain("CodePanel");
    expect(client).not.toContain("pipelineSnippet");
    expect(client).not.toContain("installSnippet");
    expect(client).not.toContain("Complete pattern");
  });
});
