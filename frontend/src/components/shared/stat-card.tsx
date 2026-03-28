import { Activity, Pill, Radar, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const iconMap = {
  logs: Activity,
  symptoms: Radar,
  medications: Pill,
  severity: TrendingUp,
};

export function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: keyof typeof iconMap;
}) {
  const Icon = iconMap[icon];

  return (
    <Card className="border-white/70 bg-white/90">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
