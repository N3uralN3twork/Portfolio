import { describe, expect, test } from "vitest";
import {
  buildSearchIndex,
  getAllContent,
  getContentBySlug,
  validateContentMeta,
} from "./content";

describe("content contract", () => {
  test("validates complete frontmatter for writing and work content", () => {
    const meta = validateContentMeta(
      {
        title: "Latency-aware retrieval pipelines",
        summary: "A project note about fast embeddings and serving tradeoffs.",
        date: "2026-03-14",
        tags: ["llms", "systems"],
        type: "writing",
        status: "published",
        readingTime: "8 min read",
        links: [{ label: "Code", href: "https://github.com/example/repo" }],
        featured: true,
      },
      "content/writing/latency-aware-retrieval.mdx",
    );

    expect(meta.title).toBe("Latency-aware retrieval pipelines");
    expect(meta.tags).toEqual(["llms", "systems"]);
    expect(meta.featured).toBe(true);
  });

  test("rejects content missing required frontmatter with a clear file path", () => {
    expect(() =>
      validateContentMeta(
        {
          title: "Incomplete note",
          type: "writing",
          tags: [],
        },
        "content/writing/incomplete.mdx",
      ),
    ).toThrow(/content\/writing\/incomplete\.mdx/);
  });

  test("discovers seeded content by kind and slug", async () => {
    const writing = await getAllContent("writing");
    const work = await getAllContent("work");

    expect(writing.map((entry) => entry.slug)).toContain(
      "bayesian-drift-detection",
    );
    expect(work.map((entry) => entry.slug)).toContain(
      "streaming-feature-platform",
    );

    const project = await getContentBySlug("work", "streaming-feature-platform");
    expect(project.meta.type).toBe("work");
    expect(project.body).toMatch(/feature freshness/i);
  });

  test("builds a static search index from metadata and body text", async () => {
    const index = await buildSearchIndex();

    expect(index).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "writing",
          slug: "bayesian-drift-detection",
          href: "/writing/bayesian-drift-detection",
        }),
        expect.objectContaining({
          kind: "work",
          slug: "streaming-feature-platform",
          href: "/work/streaming-feature-platform",
        }),
      ]),
    );
    expect(index.find((item) => item.slug === "bayesian-drift-detection")?.text)
      .toMatch(/posterior/i);
  });
});
