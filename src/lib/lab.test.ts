import { describe, expect, test } from "vitest";
import { labDemos } from "./lab";

describe("lab demos", () => {
  test("defines the Decision Lab demos", () => {
    expect(labDemos.map((demo) => demo.title)).toEqual([
      "Latency Budget Simulator",
      "Pipeline Failure Drill",
      "Model Serving Tradeoff",
      "lavaan SEM Workbench",
    ]);
  });

  test("keeps each demo grounded and cross-links to existing sections", () => {
    expect(labDemos).toHaveLength(4);

    for (const demo of labDemos) {
      expect(demo.description.length).toBeGreaterThan(60);
      expect(demo.tags.length).toBeGreaterThanOrEqual(3);
      expect(demo.relatedHref).toMatch(/^\/(work|writing|animations)\//);
      expect(demo.relatedLabel).toMatch(/^(Read|View|Open) /);
    }

    expect(labDemos.find((demo) => demo.id === "lavaan-sem")).toEqual(
      expect.objectContaining({
        relatedHref: "/work/structural-equation-modeling-lavaan",
        tags: expect.arrayContaining(["SEM", "lavaan", "R"]),
      }),
    );
  });
});
