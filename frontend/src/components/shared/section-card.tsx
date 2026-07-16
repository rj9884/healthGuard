import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPad?: boolean;
}

export function SectionCard({ title, description, children, className, action, noPad }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-white shadow-sm", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            {title && <h3 className="font-semibold text-foreground">{title}</h3>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(noPad ? "" : "p-5")}>{children}</div>
    </div>
  );
}
