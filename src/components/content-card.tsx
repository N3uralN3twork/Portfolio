import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { ContentCategoryThumbnail } from "@/components/content-category-thumbnail";
import { ContentDifficultyBadge } from "@/components/content-difficulty-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContentEntry } from "@/lib/content";

export function ContentCard({ entry }: { entry: ContentEntry }) {
  return (
    <Card className="h-full pt-0 transition-colors hover:bg-muted/30">
      <Link href={entry.href} aria-label={entry.meta.title}>
        <ContentCategoryThumbnail title={entry.meta.title} tags={entry.meta.tags} />
      </Link>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-3">
            <span>{formatDate(entry.meta.date)}</span>
            <span>{entry.meta.readingTime}</span>
          </div>
          <ContentDifficultyBadge difficulty={entry.meta.difficulty} />
        </div>
        <CardTitle className="text-xl leading-tight">
          <Link href={entry.href}>{entry.meta.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {entry.meta.summary}
        </p>
        <div className="flex flex-wrap gap-2">
          {entry.meta.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={entry.href}
          className="inline-flex items-center gap-2 text-sm font-medium"
        >
          Read case
          <ArrowUpRightIcon aria-hidden />
        </Link>
      </CardFooter>
    </Card>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
