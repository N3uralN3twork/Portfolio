import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const contentKinds = ["work", "writing"] as const;
export type ContentKind = (typeof contentKinds)[number];
export const readingDifficulties = ["easy", "medium", "hard"] as const;
export type ReadingDifficulty = (typeof readingDifficulties)[number];

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const contentMetaSchema = z
  .object({
    title: z.string().min(1),
    summary: z.string().min(1).optional(),
    date: z.preprocess(normalizeDate, z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    tags: z.array(z.string().min(1)).min(1),
    type: z.enum(contentKinds).optional(),
    status: z.string().min(1).optional().default("published"),
    readingTime: z.string().min(1).optional(),
    links: z.array(linkSchema).optional().default([]),
    featured: z.boolean().optional().default(false),
    cardImage: z.string().min(1).optional(),
    bannerImage: z.string().min(1).optional(),
    cardImg: z.string().min(1).optional(),
    bannerImg: z.string().min(1).optional(),
    imageAlt: z.string().min(1).optional(),
    difficulty: z.enum(readingDifficulties).optional(),
  })
  .transform((meta) => ({
    title: meta.title,
    summary: meta.summary ?? meta.title,
    date: meta.date,
    tags: meta.tags,
    type: meta.type,
    status: meta.status,
    readingTime: meta.readingTime,
    links: meta.links,
    featured: meta.featured,
    cardImage: meta.cardImage ?? meta.cardImg,
    bannerImage: meta.bannerImage ?? meta.bannerImg,
    imageAlt: meta.imageAlt,
    difficulty: meta.difficulty,
  }));

export type ContentMeta = z.infer<typeof contentMetaSchema>;

export type ContentEntry = {
  kind: ContentKind;
  slug: string;
  href: string;
  meta: ContentMeta;
  body: string;
};

export type SearchIndexItem = {
  kind: ContentKind;
  slug: string;
  href: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  text: string;
};

const contentRoot = path.join(process.cwd(), "content");
const extensionPattern = /\.(md|mdx)$/;

export function validateContentMeta(
  value: unknown,
  filePath: string,
  body = "",
): ContentMeta {
  const result = contentMetaSchema.safeParse(value);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${filePath}: ${message}`);
  }

  const inferredKind = inferContentKind(filePath);

  return {
    ...result.data,
    type: result.data.type ?? inferredKind,
    readingTime: result.data.readingTime ?? estimateReadingTime(body),
  };
}

export async function getAllContent(
  kind?: ContentKind,
): Promise<ContentEntry[]> {
  const kinds = kind ? [kind] : [...contentKinds];
  const groups = await Promise.all(kinds.map(readContentKind));

  return groups.flat().sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export async function getContentBySlug(
  kind: ContentKind,
  slug: string,
): Promise<ContentEntry> {
  const entries = await getAllContent(kind);
  const entry = entries.find((item) => item.slug === slug);

  if (!entry) {
    throw new Error(`Content not found: ${kind}/${slug}`);
  }

  return entry;
}

export async function buildSearchIndex(): Promise<SearchIndexItem[]> {
  const entries = await getAllContent();

  return entries.map((entry) => ({
    kind: entry.kind,
    slug: entry.slug,
    href: entry.href,
    title: entry.meta.title,
    summary: entry.meta.summary,
    tags: entry.meta.tags,
    date: entry.meta.date,
    text: normalizeSearchText(
      [
        entry.meta.title,
        entry.meta.summary,
        entry.meta.tags.join(" "),
        entry.body,
      ].join(" "),
    ),
  }));
}

export function getAllTags(entries: ContentEntry[]): string[] {
  return Array.from(new Set(entries.flatMap((entry) => entry.meta.tags))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getContentCardImage(meta: ContentMeta): string | undefined {
  return meta.cardImage ?? meta.bannerImage;
}

export function getContentBannerImage(meta: ContentMeta): string | undefined {
  return meta.bannerImage ?? meta.cardImage;
}

async function readContentKind(kind: ContentKind): Promise<ContentEntry[]> {
  const directory = path.join(contentRoot, kind);
  const names = await fs.readdir(directory);
  const files = names.filter((name) => extensionPattern.test(name));

  return Promise.all(
    files.map(async (name) => {
      const filePath = path.join(directory, name);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = matter(raw);
      const meta = validateContentMeta(
        parsed.data,
        toContentPath(kind, name),
        parsed.content,
      );
      const slug = name.replace(extensionPattern, "");

      if (meta.type !== kind) {
        throw new Error(
          `Invalid frontmatter in ${toContentPath(
            kind,
            name,
          )}: type must be "${kind}"`,
        );
      }

      return {
        kind,
        slug,
        href: `/${kind}/${slug}`,
        meta,
        body: parsed.content.trim(),
      };
    }),
  );
}

function normalizeSearchText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}[\]()`*_>#~|$\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toContentPath(kind: ContentKind, name: string): string {
  return `content/${kind}/${name}`;
}

function normalizeDate(value: unknown): unknown {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  const dateOnly = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);

  return dateOnly?.[1] ?? trimmed;
}

function inferContentKind(filePath: string): ContentKind {
  return filePath.includes("/work/") || filePath.includes("\\work\\")
    ? "work"
    : "writing";
}

function estimateReadingTime(body: string): string {
  const wordCount = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 225));

  return `${minutes} min read`;
}
