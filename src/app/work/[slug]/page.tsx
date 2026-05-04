import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDifficultyBadge } from "@/components/content-difficulty-badge";
import { ContentImage } from "@/components/content-image";
import { Badge } from "@/components/ui/badge";
import {
  getAllContent,
  getContentBannerImage,
  getContentBySlug,
} from "@/lib/content";
import { renderMdx } from "@/lib/mdx";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const entries = await getAllContent("work");
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getContentBySlug("work", slug).catch(() => undefined);

  if (!entry) {
    return {};
  }

  return {
    title: entry.meta.title,
    description: entry.meta.summary,
  };
}

export default async function WorkDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = await getContentBySlug("work", slug).catch(() => undefined);

  if (!entry) {
    notFound();
  }

  const content = await renderMdx(entry.body);
  const bannerImage = getContentBannerImage(entry.meta);

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {entry.meta.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
          {entry.meta.title}
        </h1>
        <p className="text-lg leading-8 text-muted-foreground">
          {entry.meta.summary}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{entry.meta.date}</span>
          <span>{entry.meta.readingTime}</span>
          <span>{entry.meta.status}</span>
          <ContentDifficultyBadge difficulty={entry.meta.difficulty} />
        </div>
      </header>
      {bannerImage ? (
        <ContentImage
          src={bannerImage}
          alt={entry.meta.imageAlt ?? ""}
          sizes="(min-width: 768px) 768px, 100vw"
          preload
          className="aspect-[16/9] rounded-lg"
        />
      ) : null}
      <div className="prose-lab">{content}</div>
    </article>
  );
}
