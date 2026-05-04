import {
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReadingDifficulty } from "@/lib/content";

const difficultyConfig: Record<
  ReadingDifficulty,
  { label: string; Icon: LucideIcon }
> = {
  easy: {
    label: "Easy",
    Icon: SignalLowIcon,
  },
  medium: {
    label: "Medium",
    Icon: SignalMediumIcon,
  },
  hard: {
    label: "Hard",
    Icon: SignalHighIcon,
  },
};

export function ContentDifficultyBadge({
  difficulty,
}: {
  difficulty?: ReadingDifficulty;
}) {
  if (!difficulty) {
    return null;
  }

  const { label, Icon } = difficultyConfig[difficulty];
  const accessibleLabel = `${label} reading difficulty`;

  return (
    <Badge variant="outline" aria-label={accessibleLabel} title={accessibleLabel}>
      <Icon data-icon="inline-start" aria-hidden />
      {label}
    </Badge>
  );
}
