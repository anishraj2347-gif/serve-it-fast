import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Shared panel/card — clean professional card with title bar. */
export function PanelShell({
  title,
  description,
  icon,
  action,
  children,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
