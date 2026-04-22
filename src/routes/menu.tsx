import { createFileRoute } from "@tanstack/react-router";
import { MenuManager } from "@/components/dashboard/MenuManager";
import { PageHero } from "@/components/dashboard/PageHero";
import { PageShell } from "@/components/dashboard/PageShell";
import { useDashboard } from "@/store/useDashboard";

export const Route = createFileRoute("/menu")({
  component: MenuPage,
  head: () => ({
    meta: [
      { title: "Bill of Fare · Menu · Bella Cucina" },
      {
        name: "description",
        content:
          "Curate the carte — add new dishes, reprice favourites, retire the worn-out, and 86 anything that's run out, all in one editorial menu manager.",
      },
      { property: "og:title", content: "Bill of Fare · Menu · Bella Cucina" },
      {
        property: "og:description",
        content:
          "Curate the carte. Add, retire, reprice — and 86 a dish in one tap.",
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
        eyebrow="Section V · The Carte"
        title="Bill of Fare"
        lede="Tonight's offering, set in serif. Add a dish, retire one that's grown tired, or 86 anything the walk-in has run out of."
        meta={`${menu.length} items · ${available} available · ${menu.length - available} 86'd`}
      />
      <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <MenuManager />
        </div>
      </div>
    </PageShell>
  );
}
