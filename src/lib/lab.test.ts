import { describe, expect, test } from "vitest";
import { labDemos } from "./lab";

describe("lab demos", () => {
  test("defines the three Systems Craft Decision Lab demos", () => {
    expect(labDemos.map((demo) => demo.title)).toEqual([
      "Latency Budget Simulator",
      "Pipeline Failure Drill",
      "Model Serving Tradeoff",
    ]);
  });

  test("keeps each demo grounded in systems craft and cross-links to existing sections", () => {
    expect(labDemos).toHaveLength(3);

    for (const demo of labDemos) {
      expect(demo.description.length).toBeGreaterThan(60);
      expect(demo.tags.length).toBeGreaterThanOrEqual(3);
      expect(demo.relatedHref).toMatch(/^\/(work|writing|animations)\//);
      expect(demo.relatedLabel).toMatch(/^(Read|View|Open) /);
    }
  });
});
