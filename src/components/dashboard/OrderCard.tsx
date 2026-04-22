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

const STATUS_DOT: Record<OrderStatus, string> = {
  new: "bg-status-new",
  preparing: "bg-status-preparing",
  ready: "bg-status-ready",
  delivered: "bg-status-delivered",
  cancelled: "bg-status-cancelled",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Incoming",
  preparing: "On Pass",
  ready: "Plated",
  delivered: "Served",
  cancelled: "Voided",
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
        "group relative animate-slide-in rounded-sm border border-border bg-card p-4 shadow-paper transition-all",
        // Receipt-style notches
        "before:absolute before:-left-[7px] before:top-1/2 before:size-3.5 before:-translate-y-1/2 before:rounded-full before:bg-paper before:shadow-[inset_0_0_0_1px_var(--color-border)]",
        "after:absolute after:-right-[7px] after:top-1/2 after:size-3.5 after:-translate-y-1/2 after:rounded-full after:bg-paper after:shadow-[inset_0_0_0_1px_var(--color-border)]",
        !isCancelled &&
          "cursor-grab hover:-translate-y-0.5 hover:shadow-card active:cursor-grabbing",
        isCancelled && "opacity-60",
        isDelayed &&
          "border-status-delayed/60 ring-1 ring-status-delayed/40 pulse-delay",
      )}
      {...(isCancelled ? {} : attributes)}
      {...(isCancelled ? {} : listeners)}
    >
      {/* Ticket header */}
      <div className="mb-2 flex items-baseline justify-between border-b border-dashed border-border pb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            № 
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {order.orderId.replace("ORD-", "")}
          </span>
          {order.table && (
            <span className="rounded-sm border border-foreground/70 px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-wider">
              {order.table}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-1.5 rounded-full", STATUS_DOT[order.status])} />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            {STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      <div className="mb-2 font-display text-sm italic text-foreground/80">
        for {order.customerName}
      </div>

      <ul className="mb-3 space-y-1">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-baseline justify-between gap-2 text-sm">
            <span
              className={cn(
                "flex items-baseline gap-2 leading-tight",
                isCancelled && "line-through",
              )}
            >
              <span className="font-mono text-xs font-semibold tabular-nums text-primary">
                {it.qty}×
              </span>
              <span className="text-foreground/95">{it.name}</span>
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {currency(it.price * it.qty)}
            </span>
          </li>
        ))}
      </ul>

      {/* Subtotal divider */}
      <div className="mb-2 ink-rule h-px" />

      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-1.5 font-mono text-xs font-medium tabular-nums",
            isDelayed ? "text-status-delayed" : "text-muted-foreground",
          )}
        >
          {isDelayed ? (
            <AlertTriangle className="size-3.5" />
          ) : (
            <Clock className="size-3.5" />
          )}
          {isDelayed
            ? `+${formatDuration(sinceStart - order.expectedPrepTime)}`
            : formatDuration(elapsedSec)}
        </div>
        <div className="font-display text-base font-bold tabular-nums">
          {currency(order.totalAmount)}
        </div>
      </div>

      {isNew && (
        <div
          className="mt-3 grid grid-cols-2 gap-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-sm border-foreground/30 text-xs hover:bg-secondary"
            onClick={() => cancelOrder(order.orderId)}
          >
            <X className="size-3.5" /> Decline
          </Button>
          <Button
            size="sm"
            className="h-8 rounded-sm bg-foreground text-xs text-background hover:bg-foreground/90"
            onClick={() => acceptOrder(order.orderId)}
          >
            <Check className="size-3.5" /> Fire
          </Button>
        </div>
      )}
    </div>
  );
}
