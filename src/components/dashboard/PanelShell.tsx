import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  eyebrow: string;
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Shared editorial panel — newspaper-style header with eyebrow + title rule. */
export function PanelShell({ eyebrow, title, hint, action, children, className }: Props) {
  return (
    <section
      className={cn(
        "relative rounded-sm border border-border bg-card p-5 shadow-paper",
        className,
      )}
    >
      <header className="mb-4 border-b-2 border-foreground/90 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </div>
            <h2 className="mt-0.5 font-display text-2xl font-bold leading-none tracking-tight">
              {title}
            </h2>
            {hint && (
              <p className="mt-1 font-display text-xs italic text-muted-foreground">
                {hint}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </header>
      {children}
    </section>
  );
}
