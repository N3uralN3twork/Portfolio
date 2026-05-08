import { describe, expect, test } from "vitest";
import { howIWorkStages, roleFitItems } from "./home";

describe("homepage narrative content", () => {
  test("describes four hybrid systems data science role-fit areas", () => {
    expect(roleFitItems.map((item) => item.title)).toEqual([
      "Production Data Science",
      "Model Building & Evaluation",
      "Low-Latency Data Systems",
      "Applied Research & Statistics",
    ]);

    expect(roleFitItems.map((item) => item.description).join(" ")).toMatch(
      /learning new domains/i,
    );
  });

  test("frames the work process as a monitored feedback loop", () => {
    expect(howIWorkStages.map((stage) => stage.title)).toEqual([
      "Gather requirements",
      "Learn from SMEs",
      "Design the solution",
      "Implement",
      "Deploy",
      "Monitor",
    ]);

    expect(howIWorkStages.at(-1)?.description).toMatch(/next requirement/i);
  });
});
