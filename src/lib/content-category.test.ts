import { describe, expect, test } from "vitest";
import { deriveContentCategory } from "./content-category";

describe("content category thumbnails", () => {
  test("maps technical tags into stable category bands", () => {
    expect(deriveContentCategory(["C++", "Low Latency"])).toBe("C++ / Systems");
    expect(deriveContentCategory(["Statistics", "R"])).toBe("Statistics");
    expect(deriveContentCategory(["Machine Learning", "XGBoost"])).toBe(
      "ML Models",
    );
    expect(deriveContentCategory(["llms", "evaluation"])).toBe("Evaluation");
    expect(deriveContentCategory(["data-engineering", "streaming"])).toBe(
      "Data Systems",
    );
    expect(deriveContentCategory(["Maps", "Leaflet"])).toBe("Visualization");
    expect(deriveContentCategory(["Bayesian", "Experimentation"])).toBe(
      "Research Notes",
    );
  });
});
