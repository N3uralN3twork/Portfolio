import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContentCard } from "./content-card";
import type { ContentEntry } from "@/lib/content";

describe("ContentCard", () => {
  it("renders the optional card image when one is provided", () => {
    const entry: ContentEntry = {
      kind: "work",
      slug: "sample-project",
      href: "/work/sample-project",
      meta: {
        title: "Sample project",
        summary: "A compact project summary.",
        date: "2026-05-06",
        tags: ["Statistics"],
        type: "work",
        status: "published",
        readingTime: "4 min read",
        links: [],
        featured: false,
        cardImage: "/images/sample-card.png",
        imageAlt: "Sample chart preview",
      },
      body: "Body copy",
    };

    const html = renderToStaticMarkup(<ContentCard entry={entry} />);

    expect(html).toContain("img");
    expect(html).toContain("sample-card.png");
    expect(html).toContain("Sample chart preview");
  });
});
