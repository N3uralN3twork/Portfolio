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
