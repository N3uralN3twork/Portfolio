import type { StaticImageData } from "next/image";
import awsLogo from "../../public/images/AWS-Logo.jpg";
import gitLogo from "../../public/images/GitS.jpg";
import pythonLogo from "../../public/images/Python-Logo-Modern.png";
import rLogo from "../../public/images/R-Logo.png";
import sqlLogo from "../../public/images/SQL-Logo.png";
import xgboostLogo from "../../public/images/XGBoost_logo.png";
import tableauLogo from "../../public/images/Tableau-Logo.webp";
import powerBILogo from "../../public/images/PowerBI-Logo.jpg";
import cppLogo from "../../public/images/C++Logo.png";
import { profile } from "@/lib/profile";

export type ContactLink = {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "mail" | "resume";
};

export type ExperienceItem = {
  role: string;
  organization: string;
  location: string;
  dateRange: string;
  icon: "briefcase" | "graduation";
  summary: string;
  highlights: string[];
};

export type SkillItem = {
  name: string;
  category: "Languages" | "Data & ML" | "Systems" | "Cloud & Tools";
  strength: string;
  iconSrc?: StaticImageData | string;
};

export type AccomplishmentItem = {
  title: string;
  source: string;
  description: string;
  tags: string[];
};

export const aboutIntro = {
  eyebrow: profile.title,
  headline: "I build data systems and ML workflows that make careful decisions easier to trust.",
  body:
    "I am a data scientist focused on production modeling, applied statistics, and practical software systems. My work sits where measurement, model behavior, and operational decisions need to line up clearly.",
} as const;

export const contactLinks: ContactLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/N3uralN3twork",
    icon: "github",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/matthiasquinn/",
    icon: "linkedin",
  },
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
  {
    label: "Resume",
    href: profile.resumePath,
    icon: "resume",
  },
];

export const experience: ExperienceItem[] = [
  {
    role: "Senior Data Scientist",
    organization: "Progressive Insurance",
    location: "Mayfield, OH",
    dateRange: "Feb. 2023 - Present",
    icon: "briefcase",
    summary:
      "Lead production modeling work for underwriting and claims-focused decision systems.",
    highlights: [
      "Architected multiple production models used to explain and support underwriting decisions.",
      "Built fraud-likelihood modeling workflows for claim triage and investigation support.",
      "Guided modeling projects from early framing through deployment and stakeholder communication.",
    ],
  },
  {
    role: "Data Analyst",
    organization: "Progressive Insurance",
    location: "Mayfield, OH",
    dateRange: "2021 - Feb. 2023",
    icon: "briefcase",
    summary:
      "Translated claims data into statistical findings, operational measures, and reusable analysis workflows.",
    highlights: [
      "Applied statistics to quantify project-specific effects across claims operations.",
      "Reviewed large data sources to identify operational impacts and recommend actions.",
      "Developed internal metrics with SQL, Python, Tableau, and Power BI.",
    ],
  },
  {
    role: "Graduate Assistant",
    organization: "Cleveland State University",
    location: "Cleveland, OH",
    dateRange: "Aug. 2019 - Jul. 2021",
    icon: "graduation",
    summary:
      "Supported statistics students through direct tutoring, teaching strategy, and applied quantitative guidance.",
    highlights: [
      "Provided walk-in tutoring for statistics courses across multiple levels.",
      "Adapted teaching strategies to help students understand statistical reasoning and analysis.",
    ],
  },
];

export const skills: SkillItem[] = [
  {
    name: "Python",
    category: "Languages",
    strength: "Strong",
    iconSrc: pythonLogo,
  },
  {
    name: "R",
    category: "Languages",
    strength: "Strong",
    iconSrc: rLogo,
  },
  {
    name: "SQL",
    category: "Languages",
    strength: "Strong",
    iconSrc: sqlLogo,
  },
  {
    name: "C++",
    category: "Systems",
    strength: "Low-latency systems",
    iconSrc: cppLogo,
  },
  {
    name: "Machine Learning",
    category: "Data & ML",
    strength: "Production modeling",
  },
  {
    name: "XGBoost",
    category: "Data & ML",
    strength: "Modeling toolkit",
    iconSrc: xgboostLogo,
  },
  {
    name: "Statistics",
    category: "Data & ML",
    strength: "Applied analysis",
  },
  {
    name: "LLM Evaluation",
    category: "Data & ML",
    strength: "Evaluation design",
  },
  {
    name: "AWS",
    category: "Cloud & Tools",
    strength: "Cloud workflows",
    iconSrc: awsLogo,
  },
  {
    name: "Git",
    category: "Cloud & Tools",
    strength: "Version control",
    iconSrc: gitLogo,
  },
  {
    name: "Tableau",
    category: "Cloud & Tools",
    strength: "Analytics reporting",
    iconSrc: tableauLogo,
  },
  {
    name: "Power BI",
    category: "Cloud & Tools",
    strength: "Business intelligence",
    iconSrc: powerBILogo,
  },
];

export const skillCategories: SkillItem["category"][] = [
  "Languages",
  "Data & ML",
  "Systems",
  "Cloud & Tools",
];

export const accomplishments: AccomplishmentItem[] = [
  {
    title: "Production underwriting model leadership",
    source: "Senior Data Scientist",
    description:
      "Led architecture for multiple production models designed to make underwriting decisions more explainable, inspectable, and operationally useful.",
    tags: ["Production ML", "Underwriting", "Model explainability"],
  },
  {
    title: "Fraud likelihood modeling",
    source: "Senior Data Scientist",
    description:
      "Developed modeling workflows that estimate the likelihood of fraudulent claims and help prioritize investigation effort.",
    tags: ["Claims", "Risk modeling", "Python"],
  },
  {
    title: "Claims operations analysis",
    source: "Data Analyst",
    description:
      "Applied statistical analysis across large claims data sources to quantify operational effects and turn findings into recommended actions.",
    tags: ["Statistics", "Operations", "Decision support"],
  },
  {
    title: "Internal metrics and reporting systems",
    source: "Data Analyst",
    description:
      "Built and modeled internal metrics using SQL, Python, Tableau, and Power BI so teams could monitor performance with clearer measurement.",
    tags: ["SQL", "Python", "Reporting"],
  },
];
