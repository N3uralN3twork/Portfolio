import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const wideMdxDemoCardClass =
  "not-prose my-10 w-full overflow-hidden border-border/80 bg-card/95 md:relative md:left-1/2 md:w-[min(92vw,68rem)] md:-translate-x-1/2";

export function MdxDemoCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(wideMdxDemoCardClass, className)}
      {...props}
    />
  );
}
