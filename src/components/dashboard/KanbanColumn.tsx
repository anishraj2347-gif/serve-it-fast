import { Order, OrderStatus } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { OrderCard } from "./OrderCard";
import { cn } from "@/lib/utils";

interface Props {
  status: OrderStatus;
  title: string;
  orders: Order[];
}

const ACCENT: Record<OrderStatus, string> = {
  new: "bg-status-new",
  preparing: "bg-status-preparing",
  ready: "bg-status-ready",
  delivered: "bg-status-delivered",
  cancelled: "bg-status-cancelled",
};

export function KanbanColumn({ status, title, orders }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[460px] flex-col rounded-xl border border-border bg-surface-2/40 transition-all",
        isOver && "border-primary bg-primary/5 ring-2 ring-primary/20",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", ACCENT[status])} />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground shadow-xs">
          {orders.length}
        </span>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-2.5 overflow-y-auto p-3">
        {orders.length === 0 ? (
          <div className="grid flex-1 place-items-center py-10 text-center text-xs text-muted-foreground/60">
            No orders
          </div>
        ) : (
          orders.map((o) => <OrderCard key={o.orderId} order={o} />)
        )}
      </div>
    </div>
  );
}
