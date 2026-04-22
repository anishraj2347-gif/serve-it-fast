import { createFileRoute } from "@tanstack/react-router";
import { MenuManager } from "@/components/dashboard/MenuManager";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";
import { useDashboard } from "@/store/useDashboard";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({
    meta: [
      { title: "Menu · Bella Cucina" },
      {
        name: "description",
        content:
          "Manage the menu — add new dishes, adjust prices and prep times, and toggle availability when items run out.",
      },
      { property: "og:title", content: "Menu · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Manage dishes, prices, prep times and availability.",
      },
    ],
  }),
});

function MenuPage() {
  const menu = useDashboard((s) => s.menu);
  const available = menu.filter((m) => m.isAvailable).length;

  return (
    <PageShell>
      <PageHero
        eyebrow="Catalog"
        title="Menu"
        lede="Add, edit, and toggle availability for every dish on the menu. Changes take effect immediately on the live order board."
        meta={`${menu.length} items · ${available} available · ${menu.length - available} out of stock`}
      />
      <div className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <MenuManager />
        </div>
      </div>
    </PageShell>
  );
}
