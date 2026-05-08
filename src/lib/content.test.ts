import { describe, expect, test } from "vitest";
import {
  buildSearchIndex,
  getAllContent,
  getContentBannerImage,
  getContentCardImage,
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
        cardImage: "/images/cards/retrieval.png",
        bannerImage: "/images/banners/retrieval.png",
        difficulty: "medium",
      },
      "content/writing/latency-aware-retrieval.mdx",
    );

    expect(meta.title).toBe("Latency-aware retrieval pipelines");
    expect(meta.tags).toEqual(["llms", "systems"]);
    expect(meta.featured).toBe(true);
    expect(meta.cardImage).toBe("/images/cards/retrieval.png");
    expect(meta.bannerImage).toBe("/images/banners/retrieval.png");
    expect(meta.difficulty).toBe("medium");
  });

  test("normalizes legacy image frontmatter and optional metadata defaults", () => {
    const meta = validateContentMeta(
      {
        title: "Being a Researcher",
        date: "2024-05-11T00:00:00Z",
        tags: ["Statistics", "R"],
        cardImg: "/images/blog/ADD-Health-Logo.jpeg",
        bannerImg: "/images/blog/ADD-Health-Logo.jpeg",
        difficulty: "easy",
      },
      "content/writing/ADDHealth.mdx",
      "This is a short reflection on research work.",
    );

    expect(meta.summary).toBe("Being a Researcher");
    expect(meta.date).toBe("2024-05-11");
    expect(meta.type).toBe("writing");
    expect(meta.status).toBe("published");
    expect(meta.readingTime).toBe("1 min read");
    expect(meta.links).toEqual([]);
    expect(meta.cardImage).toBe("/images/blog/ADD-Health-Logo.jpeg");
    expect(meta.bannerImage).toBe("/images/blog/ADD-Health-Logo.jpeg");
    expect(meta.difficulty).toBe("easy");
  });

  test("selects card and banner image fallbacks from normalized metadata", () => {
    const meta = validateContentMeta(
      {
        title: "Image fallbacks",
        date: "2026-04-10",
        tags: ["visuals"],
        type: "writing",
        cardImage: "/images/cards/fallback.png",
      },
      "content/writing/image-fallbacks.md",
    );

    expect(getContentCardImage(meta)).toBe("/images/cards/fallback.png");
    expect(getContentBannerImage(meta)).toBe("/images/cards/fallback.png");
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
    expect(writing.map((entry) => entry.slug)).toContain(
      "bayesian-ab-testing",
    );
    expect(writing.map((entry) => entry.slug)).toContain(
      "random-forests-deep-dive",
    );
    expect(writing.map((entry) => entry.slug)).toContain(
      "low-latency-cpp-techniques",
    );
    expect(writing.map((entry) => entry.slug)).toContain(
      "linear-algebra-cpp-latency",
    );
    expect(work.map((entry) => entry.slug)).toContain(
      "structural-equation-modeling-lavaan",
    );

    const bayesianPost = await getContentBySlug("writing", "bayesian-ab-testing");
    expect(bayesianPost.meta.type).toBe("writing");
    expect(bayesianPost.meta.difficulty).toBe("medium");
    expect(bayesianPost.meta.tags).toEqual(
      expect.arrayContaining([
        "Statistics",
        "Bayesian",
        "A/B Testing",
        "Experimentation",
      ]),
    );

    const randomForestPost = await getContentBySlug(
      "writing",
      "random-forests-deep-dive",
    );
    expect(randomForestPost.meta.difficulty).toBe("hard");
    expect(randomForestPost.body).toMatch(/out-of-bag error/i);
    expect(randomForestPost.body).toMatch(/variance reduction/i);

    const lowLatencyPost = await getContentBySlug(
      "writing",
      "low-latency-cpp-techniques",
    );
    expect(lowLatencyPost.meta.difficulty).toBe("hard");
    expect(lowLatencyPost.body).toMatch(/tail latency/i);
    expect(lowLatencyPost.body).toMatch(/false sharing/i);

    const linearAlgebraPost = await getContentBySlug(
      "writing",
      "linear-algebra-cpp-latency",
    );
    expect(linearAlgebraPost.meta.featured).toBe(true);
    expect(linearAlgebraPost.meta.difficulty).toBe("hard");
    expect(linearAlgebraPost.meta.tags).toEqual(
      expect.arrayContaining([
        "C++",
        "Linear Algebra",
        "Performance",
        "Machine Learning",
        "Low Latency",
      ]),
    );
    expect(linearAlgebraPost.body).toMatch(/dot product/i);
    expect(linearAlgebraPost.body).toMatch(/matrix-vector multiply/i);
    expect(linearAlgebraPost.body).toMatch(/benchmarking pitfalls/i);

    const lavaanLab = await getContentBySlug(
      "work",
      "structural-equation-modeling-lavaan",
    );
    expect(lavaanLab.meta.type).toBe("work");
    expect(lavaanLab.meta.difficulty).toBe("hard");
    expect(lavaanLab.body).toMatch(/PoliticalDemocracy/);
    expect(lavaanLab.body).toMatch(/structural equation modeling/i);
    expect(lavaanLab.body).toMatch(/model-implied/i);
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
          kind: "writing",
          slug: "linear-algebra-cpp-latency",
          href: "/writing/linear-algebra-cpp-latency",
        }),
        expect.objectContaining({
          kind: "work",
          slug: "structural-equation-modeling-lavaan",
          href: "/work/structural-equation-modeling-lavaan",
        }),
      ]),
    );
    expect(index.find((item) => item.slug === "bayesian-drift-detection")?.text)
      .toMatch(/posterior/i);
    expect(index.find((item) => item.slug === "bayesian-ab-testing")?.text)
      .toMatch(/beta-binomial/i);
    expect(index.find((item) => item.slug === "bayesian-ab-testing")?.text)
      .toMatch(/credible interval/i);
    expect(index.find((item) => item.slug === "bayesian-ab-testing")?.text)
      .toMatch(/p b a/i);
    expect(index.find((item) => item.slug === "random-forests-deep-dive")?.text)
      .toMatch(/bootstrap aggregation/i);
    expect(index.find((item) => item.slug === "random-forests-deep-dive")?.text)
      .toMatch(/out of bag/i);
    expect(index.find((item) => item.slug === "low-latency-cpp-techniques")?.text)
      .toMatch(/cache locality/i);
    expect(index.find((item) => item.slug === "low-latency-cpp-techniques")?.text)
      .toMatch(/p99/i);
    expect(index.find((item) => item.slug === "linear-algebra-cpp-latency")?.text)
      .toMatch(/dot product/i);
    expect(index.find((item) => item.slug === "linear-algebra-cpp-latency")?.text)
      .toMatch(/matrix-vector/i);
    expect(
      index.find((item) => item.slug === "structural-equation-modeling-lavaan")
        ?.text,
    ).toMatch(/lavaan/i);
    expect(
      index.find((item) => item.slug === "structural-equation-modeling-lavaan")
        ?.text,
    ).toMatch(/model-implied/i);
  });
});
