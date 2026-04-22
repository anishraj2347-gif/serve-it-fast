import { useDashboard } from "@/store/useDashboard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  UtensilsCrossed,
} from "lucide-react";
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

  const grouped = menu.reduce<Record<string, typeof menu>>((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {});

  const available = menu.filter((m) => m.isAvailable).length;

  return (
    <PanelShell
      title="Menu items"
      description={`${menu.length} dishes · ${available} available`}
      icon={<UtensilsCrossed className="size-4" strokeWidth={2.25} />}
      action={
        <Button
          size="sm"
          onClick={() => setOpen((v) => !v)}
          variant={open ? "outline" : "default"}
          className="h-8"
        >
          {open ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {open ? "Cancel" : "Add item"}
        </Button>
      }
    >
      {open && (
        <form
          onSubmit={submit}
          className="mb-5 grid animate-slide-in grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2/40 p-4"
        >
          <Input
            className="col-span-2 h-9"
            placeholder="Dish name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            className="h-9"
            placeholder="Price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            className="h-9"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            className="col-span-2 h-9"
            placeholder="Prep time (seconds)"
            type="number"
            value={form.prep}
            onChange={(e) => setForm({ ...form, prep: e.target.value })}
          />
          <Button type="submit" className="col-span-2 h-9">
            Add to menu
          </Button>
        </form>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {category}
              </h3>
              <span className="text-[11px] font-medium text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="divide-y divide-border">
              {items.map((m) => (
                <li
                  key={m.itemId}
                  className={cn(
                    "py-2 transition-opacity",
                    !m.isAvailable && "opacity-55",
                  )}
                >
                  {editingId === m.itemId ? (
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-2/40 p-3">
                      <Input
                        className="col-span-2 h-8"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                      <Input
                        className="h-8"
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                      />
                      <Input
                        className="h-8"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                      />
                      <Input
                        className="col-span-2 h-8"
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
                          className="h-8"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" className="h-8" onClick={saveEdit}>
                          <Check className="size-3.5" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "truncate text-sm font-medium",
                              !m.isAvailable && "line-through",
                            )}
                          >
                            {m.name}
                          </span>
                          {!m.isAvailable && (
                            <span className="rounded-full bg-status-delayed-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-status-delayed">
                              Out
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="tabular-nums font-medium text-foreground">
                            {currency(m.price)}
                          </span>
                          <span className="size-1 rounded-full bg-border" />
                          <span className="tabular-nums">
                            {formatDuration(m.prepTimeEstimate)} prep
                          </span>
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
                          className="size-7"
                          onClick={() => startEdit(m.itemId)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
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
