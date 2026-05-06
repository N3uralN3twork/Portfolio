import {
  ActivityIcon,
  BracesIcon,
  GitBranchIcon,
  RadioTowerIcon,
  type LucideIcon,
} from "lucide-react";

export type LabDemoId =
  | "latency-budget"
  | "pipeline-failure"
  | "model-serving"
  | "lavaan-sem";

export type LabDemo = {
  id: LabDemoId;
  title: string;
  kicker: string;
  description: string;
  tags: string[];
  relatedHref: string;
  relatedLabel: string;
  icon: LucideIcon;
};

export const labDemos: LabDemo[] = [
  {
    id: "latency-budget",
    title: "Latency Budget Simulator",
    kicker: "Hot-path accounting",
    description:
      "Allocate a request budget across feature fetch, scoring, policy checks, and response shaping to see where tail latency quietly steals reliability.",
    tags: ["Latency", "C++", "p99", "Profiling"],
    relatedHref: "/writing/low-latency-cpp-techniques",
    relatedLabel: "Read low-latency notes",
    icon: ActivityIcon,
  },
  {
    id: "pipeline-failure",
    title: "Pipeline Failure Drill",
    kicker: "Incident reasoning",
    description:
      "Walk a production data symptom backward through freshness, schema, feature, and publishing checks until the operational root cause is visible.",
    tags: ["Data quality", "Monitoring", "Root cause", "SLOs"],
    relatedHref: "/work/streaming-feature-platform",
    relatedLabel: "View streaming platform",
    icon: GitBranchIcon,
  },
  {
    id: "model-serving",
    title: "Model Serving Tradeoff",
    kicker: "Architecture choice",
    description:
      "Compare batch, streaming, and low-latency serving modes by freshness, cost, auditability, and failure tolerance before picking an implementation.",
    tags: ["Serving", "ML systems", "Tradeoffs", "Reliability"],
    relatedHref: "/work/retrieval-evaluation-lab",
    relatedLabel: "View evaluation lab",
    icon: RadioTowerIcon,
  },
  {
    id: "lavaan-sem",
    title: "lavaan SEM Workbench",
    kicker: "Model syntax",
    description:
      "Translate lavaan syntax into a path diagram, then inspect how measurement loadings, structural paths, and fit diagnostics support an SEM workflow.",
    tags: ["SEM", "lavaan", "R", "Fit indices"],
    relatedHref: "/work/structural-equation-modeling-lavaan",
    relatedLabel: "Open SEM lab",
    icon: BracesIcon,
  },
];
