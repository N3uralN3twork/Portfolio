import type { Metadata } from "next";
import { ContentBrowser } from "@/components/content-browser";
import { getAllContent, getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "Project case studies in data engineering, ML, LLMs, and systems.",
};

export default async function WorkPage() {
  const entries = await getAllContent("work");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">
          Work
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          Case studies for streaming data systems, retrieval evaluation, model
          monitoring, and performance-aware production design.
        </p>
      </header>
      <ContentBrowser entries={entries} tags={getAllTags(entries)} />
    </div>
  );
}
