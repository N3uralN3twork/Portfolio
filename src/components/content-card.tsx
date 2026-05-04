import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { ContentDifficultyBadge } from "@/components/content-difficulty-badge";
import { ContentImage } from "@/components/content-image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ContentEntry } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ContentCard({ entry }: { entry: ContentEntry }) {
  const image = entry.meta.cardImage ?? entry.meta.bannerImage;

  return (
    <Card
      className={cn(
        "h-full transition-colors hover:bg-muted/30",
        image && "pt-0",
      )}
    >
      {image ? (
        <Link href={entry.href} aria-label={entry.meta.title}>
          <ContentImage
            src={image}
            alt={entry.meta.imageAlt ?? ""}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="aspect-[16/9] rounded-t-xl"
            imageClassName="transition-transform group-hover/card:scale-[1.02]"
          />
        </Link>
      ) : null}
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
