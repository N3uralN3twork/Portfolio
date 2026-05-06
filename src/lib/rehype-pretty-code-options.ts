import type { ShikiTransformer } from "shiki";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";

const preserveRawCodeForCopy: ShikiTransformer = {
  name: "preserve-raw-code-for-copy",
  pre(pre) {
    pre.properties["data-raw-code"] = this.source;
  },
};

export const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: "github-dark-dimmed",
  transformers: [preserveRawCodeForCopy],
};
