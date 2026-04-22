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
    <section className="relative border-b border-border bg-surface">
      {/* Accent rule across every page */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-accent-bold) 0%, var(--color-primary) 60%, transparent 100%)",
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-accent-bold">
            <span className="size-1.5 rounded-full bg-accent-bold" />
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
                {i > 0 && <span className="size-1 rounded-full bg-accent-bold/60" />}
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
