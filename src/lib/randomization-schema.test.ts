import { describe, expect, test } from "vitest";
import {
  buildRandomizationSchema,
  validateRandomizationSchemaConfig,
} from "./randomization-schema";

describe("randomization schema helper", () => {
  test("generates a reproducible 1:1 schema within each block", () => {
    const schema = buildRandomizationSchema({
      siteCodes: ["AAA"],
      subjectsPerSite: 6,
      blockSize: 6,
      ratio: { treatment: 1, control: 1 },
      seed: 123,
      factors: [],
    });

    expect(schema.valid).toBe(true);
    expect(schema.rows).toHaveLength(6);
    expect(schema.rows.map((row) => row.code)).toHaveLength(
      new Set(schema.rows.map((row) => row.code)).size,
    );
    expect(schema.rows[0]).toMatchObject({
      site: "AAA",
      subject: "01",
      block: "AAA-S1-B1",
    });
    expect(groupCounts(schema.rows.map((row) => row.group))).toEqual({
      C: 3,
      T: 3,
    });

    const repeat = buildRandomizationSchema({
      siteCodes: ["AAA"],
      subjectsPerSite: 6,
      blockSize: 6,
      ratio: { treatment: 1, control: 1 },
      seed: 123,
      factors: [],
    });

    expect(repeat.rows.map((row) => row.group)).toEqual(
      schema.rows.map((row) => row.group),
    );
  });

  test("generates a 3:1 schema across multiple sites and factor strata", () => {
    const schema = buildRandomizationSchema({
      siteCodes: ["AAA", "BBB"],
      subjectsPerSite: 16,
      blockSize: 4,
      ratio: { treatment: 3, control: 1 },
      seed: 2020,
      factors: [{ name: "Risk", levels: ["Low", "High"] }],
    });

    expect(schema.valid).toBe(true);
    expect(schema.rows).toHaveLength(32);
    expect(schema.summary.totalSubjects).toBe(32);
    expect(schema.summary.totalBlocks).toBe(8);
    expect(schema.summary.strataPerSite).toBe(2);

    for (const block of unique(schema.rows.map((row) => row.block))) {
      const groups = schema.rows
        .filter((row) => row.block === block)
        .map((row) => row.group);
      expect(groupCounts(groups)).toEqual({ C: 1, T: 3 });
    }

    expect(
      unique(schema.rows.map((row) => row.factorValues.Risk)).sort(),
    ).toEqual(["High", "Low"]);
  });

  test("rejects incompatible ratio and block combinations", () => {
    const validation = validateRandomizationSchemaConfig({
      siteCodes: ["AAA"],
      subjectsPerSite: 12,
      blockSize: 5,
      ratio: { treatment: 3, control: 1 },
      seed: 1,
      factors: [],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/block size must be divisible/i),
      ]),
    );
  });

  test("rejects duplicate site codes", () => {
    const validation = validateRandomizationSchemaConfig({
      siteCodes: ["AAA", "AAA"],
      subjectsPerSite: 8,
      blockSize: 4,
      ratio: { treatment: 1, control: 1 },
      seed: 1,
      factors: [],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([expect.stringMatching(/unique site codes/i)]),
    );
  });

  test("rejects factor strata that cannot evenly receive subjects", () => {
    const validation = validateRandomizationSchemaConfig({
      siteCodes: ["AAA"],
      subjectsPerSite: 10,
      blockSize: 4,
      ratio: { treatment: 1, control: 1 },
      seed: 1,
      factors: [{ name: "Sex", levels: ["F", "M", "Other"] }],
    });

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/divide evenly across factor strata/i),
      ]),
    );
  });
});

function groupCounts(groups: string[]) {
  return groups.reduce<Record<string, number>>((counts, group) => {
    counts[group] = (counts[group] ?? 0) + 1;
    return counts;
  }, {});
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}
