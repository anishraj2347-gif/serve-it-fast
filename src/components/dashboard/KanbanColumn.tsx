import { Order, OrderStatus } from "@/types";
import { useDroppable } from "@dnd-kit/core";
import { OrderCard } from "./OrderCard";
import { cn } from "@/lib/utils";

interface Props {
  status: OrderStatus;
  title: string;
  numeral: string;
  orders: Order[];
}

const ACCENT: Record<OrderStatus, string> = {
  new: "bg-status-new",
  preparing: "bg-status-preparing",
  ready: "bg-status-ready",
  delivered: "bg-status-delivered",
  cancelled: "bg-status-cancelled",
};

export function KanbanColumn({ status, title, numeral, orders }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[460px] flex-col rounded-sm border border-border bg-paper/60 transition-all",
        isOver && "border-primary bg-primary/5 ring-2 ring-primary/30",
      )}
    >
      {/* Column masthead */}
      <div className="flex items-center justify-between border-b-2 border-foreground/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {numeral}
          </span>
          <div className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", ACCENT[status])} />
            <h3 className="font-display text-base font-semibold tracking-tight">
              {title}
            </h3>
          </div>
        </div>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {orders.length.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="flex max-h-[68vh] flex-col gap-3 overflow-y-auto p-3">
        {orders.length === 0 ? (
          <div className="grid flex-1 place-items-center py-10 text-center">
            <div className="font-display text-xs italic text-muted-foreground/60">
              — empty pass —
            </div>
          </div>
        ) : (
          orders.map((o) => <OrderCard key={o.orderId} order={o} />)
        )}
      </div>
    </div>
  );
}
