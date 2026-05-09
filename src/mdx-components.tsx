import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  Callout,
  LabChart,
  LinkCard,
  ProjectMetric,
  SideBySide,
} from "@/components/mdx/blocks";
import { BayesianABDemo } from "@/components/mdx/bayesian-ab-demo";
import { DotProductSimilarityDemo } from "@/components/mdx/dot-product-similarity-demo";
import { LavaanSemDemo } from "@/components/mdx/lavaan-sem-demo";
import { JapanLeafletChoroplethDemo } from "@/components/mdx/japan-leaflet-choropleth-demo";
import { LogisticRegressionDemo } from "@/components/mdx/logistic-regression-demo";
import { LowLatencyCppDemo } from "@/components/mdx/low-latency-cpp-demo";
import { MatrixMultiplicationDemo } from "@/components/mdx/matrix-multiplication-demo";
import { MdxPre } from "@/components/mdx/mdx-pre";
import { RandomForestDemo } from "@/components/mdx/random-forest-demo";
import { RandomizationSchemaBuilder } from "@/components/mdx/randomization-schema-builder";
import {
  SgpvAppliedResultsPath,
  SgpvIntervalWorkbench,
} from "@/components/mdx/sgpv-demos";
import { parseMdxStyleString } from "@/lib/mdx-style";

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
  col: ({ style, ...props }) => (
    <col
      style={
        typeof style === "string" ? parseMdxStyleString(style) : style
      }
      {...props}
    />
  ),
  pre: MdxPre,
  Callout,
  LabChart,
  LinkCard,
  ProjectMetric,
  SideBySide,
  BayesianABDemo,
  DotProductSimilarityDemo,
  LavaanSemDemo,
  JapanLeafletChoroplethDemo,
  LogisticRegressionDemo,
  LowLatencyCppDemo,
  MatrixMultiplicationDemo,
  RandomForestDemo,
  RandomizationSchemaBuilder,
  SgpvAppliedResultsPath,
  SgpvIntervalWorkbench,
};

export function useMDXComponents(): MDXComponents {
  return mdxComponents;
}
