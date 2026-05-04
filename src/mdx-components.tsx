import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  Callout,
  Equation,
  LabChart,
  LinkCard,
  ProjectMetric,
} from "@/components/mdx/blocks";
import { MdxPre } from "@/components/mdx/mdx-pre";

export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  },
  pre: MdxPre,
  Callout,
  Equation,
  LabChart,
  LinkCard,
  ProjectMetric,
};

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
