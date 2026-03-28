import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
        {badge ? <Badge variant="outline">{badge}</Badge> : null}
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
