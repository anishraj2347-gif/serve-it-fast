import { ReactNode } from "react";

/** Shared shell for every section route — provides consistent spacing. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="pb-16">
      {children}
      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>© Bella Cucina · Operations Console</span>
          <span className="font-mono text-[11px]">v1.0 · Demo data</span>
        </div>
      </footer>
    </main>
  );
}
