"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { ContentCard } from "@/components/content-card";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ContentEntry } from "@/lib/content";

export function ContentBrowser({
  entries,
  tags,
}: {
  entries: ContentEntry[];
  tags: string[];
}) {
  const [query, setQuery] = React.useState("");
  const [tag, setTag] = React.useState("all");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = entries.filter((entry) => {
    const matchesTag = tag === "all" || entry.meta.tags.includes(tag);
    const haystack = [
      entry.meta.title,
      entry.meta.summary,
      entry.meta.tags.join(" "),
      entry.body,
    ]
      .join(" ")
      .toLowerCase();

    return matchesTag && (!normalizedQuery || haystack.includes(normalizedQuery));
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search content</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by topic, method, or system..."
            className="pl-9"
          />
        </label>
        <ToggleGroup
          spacing={1}
          size="sm"
          variant="outline"
          className="flex-wrap"
          aria-label="Filter by tag"
        >
          {["all", ...tags].map((item) => (
            <ToggleGroupItem
              key={item}
              pressed={tag === item}
              onPressedChange={() => setTag(item)}
            >
              {item}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => (
            <ContentCard key={entry.href} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No entries match this search.
        </div>
      )}
    </div>
  );
}
