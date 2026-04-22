import { useDashboard } from "@/store/useDashboard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { currency, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PanelShell } from "./PanelShell";

export function MenuManager() {
  const menu = useDashboard((s) => s.menu);
  const addMenuItem = useDashboard((s) => s.addMenuItem);
  const updateMenuItem = useDashboard((s) => s.updateMenuItem);
  const deleteMenuItem = useDashboard((s) => s.deleteMenuItem);
  const toggleAvailability = useDashboard((s) => s.toggleAvailability);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Mains",
    prep: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    category: "",
    prep: "",
  });

  const reset = () => setForm({ name: "", price: "", category: "Mains", prep: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;
    addMenuItem({
      name: form.name,
      price: parseFloat(form.price),
      category: form.category || "Mains",
      isAvailable: true,
      prepTimeEstimate: parseInt(form.prep || "300", 10),
    });
    reset();
    setOpen(false);
  };

  const startEdit = (id: string) => {
    const m = menu.find((x) => x.itemId === id);
    if (!m) return;
    setEditingId(id);
    setEditForm({
      name: m.name,
      price: String(m.price),
      category: m.category,
      prep: String(m.prepTimeEstimate),
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMenuItem(editingId, {
      name: editForm.name,
      price: parseFloat(editForm.price) || 0,
      category: editForm.category,
      prepTimeEstimate: parseInt(editForm.prep, 10) || 300,
    });
    setEditingId(null);
  };

  // Group by category for editorial menu layout
  const grouped = menu.reduce<Record<string, typeof menu>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  return (
    <PanelShell
      eyebrow="Section IV · The Carte"
      title="Bill of Fare"
      hint={`${menu.length} items · today's offering`}
      action={
        <Button
          size="sm"
          onClick={() => setOpen((v) => !v)}
          className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90"
        >
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? "Close" : "New dish"}
        </Button>
      }
    >
      {open && (
        <form
          onSubmit={submit}
          className="mb-5 grid animate-slide-in grid-cols-2 gap-2 rounded-sm border border-dashed border-foreground/40 bg-paper p-4"
        >
          <Input
            className="col-span-2 rounded-sm"
            placeholder="Dish name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            className="rounded-sm"
            placeholder="Price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            className="rounded-sm"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            className="col-span-2 rounded-sm"
            placeholder="Prep time (seconds)"
            type="number"
            value={form.prep}
            onChange={(e) => setForm({ ...form, prep: e.target.value })}
          />
          <Button
            type="submit"
            className="col-span-2 h-10 rounded-sm bg-foreground text-background hover:bg-foreground/90"
          >
            Add to the Carte
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="mb-3 flex items-baseline gap-3">
              <h3 className="font-display text-lg font-semibold italic tracking-tight">
                {category}
              </h3>
              <div className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="space-y-1">
              {items.map((m) => (
                <li
                  key={m.itemId}
                  className={cn(
                    "rounded-sm px-2 py-2 transition-colors hover:bg-paper",
                    !m.isAvailable && "opacity-50",
                  )}
                >
                  {editingId === m.itemId ? (
                    <div className="grid grid-cols-2 gap-2 rounded-sm border border-dashed border-foreground/40 bg-paper p-3">
                      <Input
                        className="col-span-2 h-8 rounded-sm"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                      <Input
                        className="h-8 rounded-sm"
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                      />
                      <Input
                        className="h-8 rounded-sm"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                      />
                      <Input
                        className="col-span-2 h-8 rounded-sm"
                        type="number"
                        value={editForm.prep}
                        onChange={(e) =>
                          setEditForm({ ...editForm, prep: e.target.value })
                        }
                      />
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 rounded-sm bg-foreground text-background hover:bg-foreground/90"
                          onClick={saveEdit}
                        >
                          <Check className="size-3.5" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "font-display text-base font-medium tracking-tight",
                              !m.isAvailable && "line-through",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="ink-rule h-px min-w-4 flex-1" />
                          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                            {currency(m.price)}
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {formatDuration(m.prepTimeEstimate)} prep
                          {!m.isAvailable && " · 86'd"}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Switch
                          checked={m.isAvailable}
                          onCheckedChange={() => toggleAvailability(m.itemId)}
                          aria-label="Toggle availability"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-sm"
                          onClick={() => startEdit(m.itemId)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 rounded-sm text-destructive hover:text-destructive"
                          onClick={() => deleteMenuItem(m.itemId)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}
