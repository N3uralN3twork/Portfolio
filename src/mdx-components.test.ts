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
});
