import { describe, expect, test } from "vitest";
import {
  classifySgpv,
  computeSgpv,
  normalTheoryComparison,
} from "@/lib/sgpv";

describe("computeSgpv", () => {
  test("returns p_delta 0 and a finite delta gap when intervals are disjoint", () => {
    const result = computeSgpv({
      estimate: { lo: 0.35, hi: 0.55 },
      nullInterval: { lo: -0.1, hi: 0.1 },
    });

    expect(result.overlap).toBe(0);
    expect(result.pDelta).toBe(0);
    expect(result.deltaGap).toBeCloseTo(2.5);
    expect(classifySgpv(result.pDelta)).toBe("delta-gap");
  });

  test("returns p_delta 1 when the estimate interval is fully inside the null interval", () => {
    const result = computeSgpv({
      estimate: { lo: -0.04, hi: 0.04 },
      nullInterval: { lo: -0.1, hi: 0.1 },
    });

    expect(result.overlap).toBeCloseTo(0.08);
    expect(result.pDelta).toBe(1);
    expect(result.deltaGap).toBeNull();
    expect(classifySgpv(result.pDelta)).toBe("null-supported");
  });

  test("returns a fractional p_delta for partial overlap", () => {
    const result = computeSgpv({
      estimate: { lo: 0.05, hi: 0.25 },
      nullInterval: { lo: -0.1, hi: 0.1 },
    });

    expect(result.overlap).toBeCloseTo(0.05);
    expect(result.denominator).toBeCloseTo(0.2);
    expect(result.pDelta).toBeCloseTo(0.25);
    expect(result.deltaGap).toBeNull();
    expect(classifySgpv(result.pDelta)).toBe("inconclusive");
  });

  test("returns p_delta 0.5 when the null interval is contained in a wider estimate interval", () => {
    const result = computeSgpv({
      estimate: { lo: -0.4, hi: 0.4 },
      nullInterval: { lo: -0.1, hi: 0.1 },
    });

    expect(result.overlap).toBeCloseTo(0.2);
    expect(result.denominator).toBeCloseTo(0.4);
    expect(result.pDelta).toBeCloseTo(0.5);
  });
});

describe("normalTheoryComparison", () => {
  test("computes a smaller two-sided p-value as the interval center moves away from the point null", () => {
    const near = normalTheoryComparison({
      estimate: { lo: -0.03, hi: 0.17 },
      pointNull: 0,
    });
    const far = normalTheoryComparison({
      estimate: { lo: 0.35, hi: 0.55 },
      pointNull: 0,
    });

    expect(near.pValue).toBeGreaterThan(far.pValue);
    expect(far.pValue).toBeLessThan(0.001);
  });
});
