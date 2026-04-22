import { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  lede: string;
  meta?: string;
  action?: ReactNode;
}

/** Shared editorial page hero — used at the top of every section route. */
export function PageHero({ eyebrow, title, lede, meta, action }: Props) {
  return (
    <section className="border-b-2 border-foreground bg-paper">
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8 sm:py-14">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
          {eyebrow}
        </div>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl font-display text-lg italic leading-snug text-muted-foreground sm:text-xl">
              {lede}
            </p>
          </div>
          {action && <div className="flex shrink-0 items-end">{action}</div>}
        </div>
        {meta && (
          <div className="mt-6 flex items-center gap-3 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-px w-8 bg-foreground" />
            {meta}
          </div>
        )}
      </div>
    </section>
  );
}
