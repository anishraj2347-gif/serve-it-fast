import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useDashboard } from "@/store/useDashboard";
import { Order, OrderStatus } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { useMemo } from "react";

const COLUMNS: { status: OrderStatus; title: string; numeral: string }[] = [
  { status: "new", title: "Incoming", numeral: "I" },
  { status: "preparing", title: "On the Pass", numeral: "II" },
  { status: "ready", title: "Plated", numeral: "III" },
  { status: "delivered", title: "Served", numeral: "IV" },
];

export function KanbanBoard() {
  const orders = useDashboard((s) => s.orders);
  const setOrderStatus = useDashboard((s) => s.setOrderStatus);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const grouped = useMemo(() => {
    const map: Record<OrderStatus, Order[]> = {
      new: [],
      preparing: [],
      ready: [],
      delivered: [],
      cancelled: [],
    };
    for (const o of orders) map[o.status].push(o);
    for (const k of Object.keys(map) as OrderStatus[]) {
      map[k].sort((a, b) => b.createdAt - a.createdAt);
    }
    return map;
  }, [orders]);

  function onDragEnd(e: DragEndEvent) {
    const orderId = e.active.id as string;
    const target = e.over?.id as OrderStatus | undefined;
    if (!target) return;
    const order = orders.find((o) => o.orderId === orderId);
    if (!order || order.status === target) return;
    setOrderStatus(orderId, target);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((c) => (
          <KanbanColumn
            key={c.status}
            status={c.status}
            title={c.title}
            numeral={c.numeral}
            orders={grouped[c.status]}
          />
        ))}
      </div>
    </DndContext>
  );
}
