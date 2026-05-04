import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
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
    <Card className="h-full transition-colors hover:bg-muted/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{formatDate(entry.meta.date)}</span>
          <span>{entry.meta.readingTime}</span>
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
