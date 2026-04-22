import { ReactNode } from "react";

/** Shared shell for every section route — provides consistent spacing. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main>
      {children}
      <footer className="border-t border-foreground/30 py-8 text-center">
        <div className="font-display text-sm italic text-muted-foreground">
          Bella Cucina · Service Desk
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          est. MMXXV — Demonstration mode
        </div>
      </footer>
    </main>
  );
}
