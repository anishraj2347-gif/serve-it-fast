import { Order, OrderStatus } from "@/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { currency, formatDuration } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import { Clock, AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/store/useDashboard";

interface Props {
  order: Order;
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  new: "bg-status-new-soft text-status-new",
  preparing: "bg-status-preparing-soft text-status-preparing",
  ready: "bg-status-ready-soft text-status-ready",
  delivered: "bg-status-delivered-soft text-status-delivered",
  cancelled: "bg-status-cancelled-soft text-status-cancelled",
};

export function OrderCard({ order }: Props) {
  const now = useNow(1000);
  const acceptOrder = useDashboard((s) => s.acceptOrder);
  const cancelOrder = useDashboard((s) => s.cancelOrder);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order.orderId,
      data: { order },
      disabled: order.status === "cancelled",
    });

  const elapsedSec = Math.max(0, Math.floor((now - order.createdAt) / 1000));
  const sinceStart = order.prepStartTime
    ? Math.floor((now - order.prepStartTime) / 1000)
    : 0;
  const isDelayed =
    order.status === "preparing" && order.prepStartTime
      ? sinceStart > order.expectedPrepTime
      : false;

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const isCancelled = order.status === "cancelled";
  const isNew = order.status === "new";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative animate-slide-in rounded-lg border border-border bg-card p-3.5 shadow-xs transition-all",
        !isCancelled &&
          "cursor-grab hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm active:cursor-grabbing",
        isCancelled && "opacity-60",
        isDelayed && "border-status-delayed/40 ring-1 ring-status-delayed/20 pulse-delay",
      )}
      {...(isCancelled ? {} : attributes)}
      {...(isCancelled ? {} : listeners)}
    >
      {/* Top row */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold tabular-nums text-foreground">
              #{order.orderId.replace("ORD-", "")}
            </span>
            {order.table && (
              <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {order.table}
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {order.customerName}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            STATUS_BADGE[order.status],
          )}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Items */}
      <ul className="mb-3 space-y-1">
        {order.items.map((it, i) => (
          <li
            key={i}
            className="flex items-baseline justify-between gap-2 text-[13px]"
          >
            <span
              className={cn(
                "flex min-w-0 items-baseline gap-1.5",
                isCancelled && "line-through",
              )}
            >
              <span className="text-[11px] font-semibold tabular-nums text-primary">
                {it.qty}×
              </span>
              <span className="truncate text-foreground/95">{it.name}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {currency(it.price * it.qty)}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <div
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium tabular-nums",
            isDelayed ? "text-status-delayed" : "text-muted-foreground",
          )}
        >
          {isDelayed ? (
            <AlertTriangle className="size-3" />
          ) : (
            <Clock className="size-3" />
          )}
          {isDelayed
            ? `+${formatDuration(sinceStart - order.expectedPrepTime)}`
            : formatDuration(elapsedSec)}
        </div>
        <div className="text-sm font-semibold tabular-nums text-foreground">
          {currency(order.totalAmount)}
        </div>
      </div>

      {/* Actions for new orders */}
      {isNew && (
        <div
          className="mt-3 grid grid-cols-2 gap-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => cancelOrder(order.orderId)}
          >
            <X className="size-3.5" /> Decline
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => acceptOrder(order.orderId)}
          >
            <Check className="size-3.5" /> Accept
          </Button>
        </div>
      )}
    </div>
  );
}
