import { readFile } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { renderMdx } from "@/lib/mdx";

describe("MDX annotations", () => {
  test("renders registered annotations, rich content, disclosures, and callouts together", async () => {
    const source = await readFile(
      path.join(process.cwd(), "src/components/mdx/fixtures/annotations.mdx"),
      "utf8",
    );
    const html = renderToStaticMarkup(await renderMdx(source));

    expect(html.match(/<aside\b/g)).toHaveLength(3);
    expect(html.match(/data-side="right"/g)).toHaveLength(2);
    expect(html.match(/data-side="left"/g)).toHaveLength(1);
    expect(html.indexOf("This passage stays")).toBeLessThan(html.indexOf('aria-label="Left note"'));
    expect(html).toContain('aria-label="My note"');
    expect(html).toContain('aria-label="Author note"');
    expect(html).toContain("<strong>reusing data</strong>");
    expect(html).toContain("<em>working set</em>");
    expect(html).toContain("<li>Count the loads as well as the arithmetic.</li>");
    expect(html).toContain('href="/writing"');
    expect(html.indexOf("Matrix multiplication")).toBeLessThan(html.indexOf("<aside"));
    expect(html.indexOf("</aside>")).toBeLessThan(html.indexOf("Measure the effect"));

    const disclosure = html.match(/<details\b([^>]*)>([\s\S]*?)<\/details>/);
    expect(disclosure).not.toBeNull();
    expect(disclosure![1]).not.toMatch(/\bopen(?:\s|=|$)/);
    expect(disclosure![2]).toMatch(/^<summary\b[^>]*>Show a worked example<\/summary>/);
    expect(disclosure![2]).toContain("katex-display");
    expect(disclosure![2]).toContain("<pre");
    expect(disclosure![2]).toContain('data-language="js"');
    expect(disclosure![2]).toContain("reduce");
    expect(html).toContain("Reading tip");
    expect(html).toContain("Benchmark caveat");
  });
});
