import * as React from "react";
import { describe, expect, test } from "vitest";
import { extractCopyableCode } from "../../lib/mdx-code-copy";

describe("MdxPre code copy", () => {
  test("prefers preserved raw code over rendered highlighted children", () => {
    const highlightedChildren = React.createElement(
      "code",
      null,
      React.createElement("span", { "data-line": "" }, "const first = 1;"),
      "\n",
      React.createElement("span", { "data-line": "" }),
      "\n",
      React.createElement("span", { "data-line": "" }),
    );

    expect(
      extractCopyableCode(
        highlightedChildren,
        "const first = 1;\nconst second = 2;\nconst third = 3;",
      ),
    ).toBe("const first = 1;\nconst second = 2;\nconst third = 3;");
  });

  test("falls back to nested rendered text when raw code is unavailable", () => {
    const highlightedChildren = React.createElement(
      "code",
      null,
      React.createElement("span", { "data-line": "" }, [
        React.createElement("span", { key: "keyword" }, "const"),
        React.createElement("span", { key: "name" }, " value"),
        React.createElement("span", { key: "operator" }, " ="),
        React.createElement("span", { key: "literal" }, " 1;"),
      ]),
      "\n",
      React.createElement("span", { "data-line": "" }, "return value;"),
    );

    expect(extractCopyableCode(highlightedChildren)).toBe(
      "const value = 1;\nreturn value;",
    );
  });
});
