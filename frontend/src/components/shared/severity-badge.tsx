import { cn } from "@/lib/utils/cn";

const SEVERITY_MAP: Record<number, { label: string; className: string }> = {
  1:  { label: "Minimal",   className: "bg-green-50 text-green-700 border-green-200" },
  2:  { label: "Minimal",   className: "bg-green-50 text-green-700 border-green-200" },
  3:  { label: "Mild",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  4:  { label: "Mild",      className: "bg-blue-50 text-blue-700 border-blue-200" },
  5:  { label: "Moderate",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  6:  { label: "Moderate",  className: "bg-amber-50 text-amber-700 border-amber-200" },
  7:  { label: "High",      className: "bg-orange-50 text-orange-700 border-orange-200" },
  8:  { label: "High",      className: "bg-orange-50 text-orange-700 border-orange-200" },
  9:  { label: "Severe",    className: "bg-red-50 text-red-700 border-red-200" },
  10: { label: "Critical",  className: "bg-red-50 text-red-800 border-red-300 font-bold" },
};

export function SeverityBadge({ severity }: { severity: number }) {
  const config = SEVERITY_MAP[Math.min(Math.max(Math.round(severity), 1), 10)] ?? SEVERITY_MAP[5];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold", config.className)}>
      {severity}/10 · {config.label}
    </span>
  );
}

export function TriageBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    "Self-Care":       "bg-green-50 text-green-800 border-green-200",
    "Routine Checkup": "bg-blue-50 text-blue-800 border-blue-200",
    "Urgent Doctor":   "bg-amber-50 text-amber-800 border-amber-200",
    "Emergency":       "bg-red-50 text-red-800 border-red-200",
  };
  const cls = map[level] ?? "bg-muted text-foreground border-border";
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", cls)}>
      {level}
    </span>
  );
}
