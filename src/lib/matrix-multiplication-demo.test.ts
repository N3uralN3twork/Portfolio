import { describe, expect, test } from "vitest";
import {
  buildMatrixMultiplicationSteps,
  matrixBTransposed,
  matrixMethods,
} from "./matrix-multiplication-demo";

describe("matrix multiplication demo model", () => {
  test("builds one step per output cell with pairwise products and sums", () => {
    const steps = buildMatrixMultiplicationSteps();

    expect(steps).toHaveLength(4);
    expect(steps[0]).toMatchObject({
      id: "c-0-0",
      rowIndex: 0,
      colIndex: 0,
      products: [
        { a: 2, b: 1, product: 2 },
        { a: -1, b: 4, product: -4 },
        { a: 3, b: -2, product: -6 },
      ],
      sum: -8,
    });
    expect(steps.map((step) => step.sum)).toEqual([-8, 31, 20, -24]);
  });

  test("describes method tradeoffs for naive, transposed, and blocked layouts", () => {
    expect(matrixMethods.map((method) => method.id)).toEqual([
      "ijk",
      "transposed",
      "blocked",
    ]);
    expect(matrixMethods[0].bAccess).toBe("strided column walk");
    expect(matrixMethods[1].bAccess).toBe("contiguous row walk");
    expect(matrixMethods[2].cacheStory).toContain("tile");
  });

  test("provides a transposed B layout for the visual method comparison", () => {
    expect(matrixBTransposed).toEqual([
      [1, 4, -2],
      [5, -3, 6],
    ]);
  });
});
