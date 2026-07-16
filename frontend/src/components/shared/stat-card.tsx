import { Activity, Pill, Radar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const iconMap = {
  logs: Activity,
  symptoms: Radar,
  medications: Pill,
  severity: TrendingUp,
};

const accentMap = {
  blue:  "text-blue-600 bg-blue-50",
  green: "text-green-600 bg-green-50",
  amber: "text-amber-600 bg-amber-50",
  red:   "text-red-600 bg-red-50",
};

export function StatCard({
  title,
  value,
  detail,
  icon,
  accent = "blue",
}: {
  title: string;
  value: string;
  detail: string;
  icon: keyof typeof iconMap;
  accent?: keyof typeof accentMap;
}) {
  const Icon = iconMap[icon];

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_20px_-6px_rgba(15,23,42,0.10)] transition hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_12px_28px_-6px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="font-display text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("rounded-lg p-2.5", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
