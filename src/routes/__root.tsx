import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TopNav } from "@/components/dashboard/TopNav";
import { useOrderSimulation } from "@/hooks/useOrderSimulation";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Service Desk · 404
        </div>
        <h1 className="mt-3 font-display text-7xl font-bold tracking-tight text-foreground">
          Off-menu
        </h1>
        <p className="mt-3 font-display italic text-muted-foreground">
          That page isn't on tonight's carte.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Return to the floor
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bella Cucina · Service Desk" },
      {
        name: "description",
        content:
          "An editorial restaurant operations dashboard — live order pass, demand forecast, revenue ledger and the daily bill of fare.",
      },
      { name: "author", content: "Bella Cucina" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Run the live order simulation across all routes
  useOrderSimulation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <Outlet />
    </div>
  );
}
