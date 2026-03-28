import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-white/80">
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-full bg-primary/10 p-4 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">{title}</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
