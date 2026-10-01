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

    expect(html.match(/aria-label="Read note:/g)).toHaveLength(3);
    expect(html.match(/data-side="right"/g)).toHaveLength(2);
    expect(html.match(/data-side="left"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Read note: Left note"');
    expect(html).toContain('aria-label="Read note: My note"');
    expect(html).toContain('aria-label="Read note: Author note"');
    expect(html).toContain("<strong>reusing data</strong>");
    expect(html).not.toContain("Think about how often");
    expect(html).not.toContain('role="dialog"');

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
