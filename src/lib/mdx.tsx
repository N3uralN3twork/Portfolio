import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { mdxComponents } from "@/mdx-components";
import { normalizeMdxStyleAttributes } from "@/lib/mdx-style";
import { rehypePrettyCodeOptions } from "@/lib/rehype-pretty-code-options";

export async function renderMdx(source: string) {
  const result = await compileMDX({
    source: normalizeMdxStyleAttributes(source),
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          [rehypePrettyCode, rehypePrettyCodeOptions],
          rehypeKatex,
        ],
      },
    },
  });

  return result.content;
}
