import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const contentKinds = ["work", "writing"] as const;
export type ContentKind = (typeof contentKinds)[number];

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

const contentMetaSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags: z.array(z.string().min(1)).min(1),
  type: z.enum(contentKinds),
  status: z.string().min(1),
  readingTime: z.string().min(1),
  links: z.array(linkSchema),
  featured: z.boolean().optional().default(false),
});

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
): ContentMeta {
  const result = contentMetaSchema.safeParse(value);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${filePath}: ${message}`);
  }

  return result.data;
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

async function readContentKind(kind: ContentKind): Promise<ContentEntry[]> {
  const directory = path.join(contentRoot, kind);
  const names = await fs.readdir(directory);
  const files = names.filter((name) => extensionPattern.test(name));

  return Promise.all(
    files.map(async (name) => {
      const filePath = path.join(directory, name);
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = matter(raw);
      const meta = validateContentMeta(parsed.data, toContentPath(kind, name));
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
