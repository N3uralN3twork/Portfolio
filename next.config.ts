import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: ["remark-gfm", "remark-math"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-pretty-code", { theme: "github-dark-dimmed" }],
      "rehype-katex",
    ],
  },
});

export default withMDX(nextConfig);
