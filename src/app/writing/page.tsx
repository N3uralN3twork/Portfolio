import type { Metadata } from "next";
import { ContentBrowser } from "@/components/content-browser";
import { getAllContent, getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description: "Technical notes with MDX, KaTeX, code, diagrams, and experiments.",
};

export default async function WritingPage() {
  const entries = await getAllContent("writing");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Writing
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Notes on statistics, Python, machine learning systems, LLM evaluation,
          and the places where implementation details change the conclusion.
        </p>
      </header>
      <ContentBrowser entries={entries} tags={getAllTags(entries)} />
    </div>
  );
}
