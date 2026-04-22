import { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  lede?: string;
  meta?: string;
  action?: ReactNode;
}

/** Clean professional page header — used at the top of every section route. */
export function PageHero({ eyebrow, title, lede, meta, action }: Props) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </div>
        )}
        <div className="mt-1.5 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            {lede && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {lede}
              </p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-end">{action}</div>}
        </div>
        {meta && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            {meta.split(" · ").map((m, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="size-1 rounded-full bg-border" />}
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
