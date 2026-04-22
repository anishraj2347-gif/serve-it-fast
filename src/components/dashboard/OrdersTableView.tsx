import { useMemo, useState } from "react";
import { Order, OrderStatus } from "@/types";
import { currency, formatDuration } from "@/lib/format";
import { useNow } from "@/hooks/useNow";
import { useDashboard } from "@/store/useDashboard";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowUpDown } from "lucide-react";

interface Props {
  orders: Order[];
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

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "preparing",
  preparing: "ready",
  ready: "delivered",
};

type SortKey = "id" | "status" | "items" | "total" | "elapsed";

export function OrdersTableView({ orders }: Props) {
  const now = useNow(1000);
  const setOrderStatus = useDashboard((s) => s.setOrderStatus);
  const acceptOrder = useDashboard((s) => s.acceptOrder);
  const cancelOrder = useDashboard((s) => s.cancelOrder);

  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("elapsed");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const subset =
      filter === "all" ? orders : orders.filter((o) => o.status === filter);
    const sorted = [...subset].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "id":
          cmp = a.orderId.localeCompare(b.orderId);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "items":
          cmp = a.items.length - b.items.length;
          break;
        case "total":
          cmp = a.totalAmount - b.totalAmount;
          break;
        case "elapsed":
          cmp = a.createdAt - b.createdAt;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [orders, filter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filters: Array<{ key: OrderStatus | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "preparing", label: "Preparing" },
    { key: "ready", label: "Ready" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-3">
        {filters.map((f) => {
          const count =
            f.key === "all"
              ? orders.length
              : orders.filter((o) => o.status === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground hover:bg-surface-2/70 hover:text-foreground",
              )}
            >
              {f.label}{" "}
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortableHead
                label="Ticket"
                active={sortKey === "id"}
                dir={sortDir}
                onClick={() => toggleSort("id")}
              />
              <TableHead>Customer / Table</TableHead>
              <SortableHead
                label="Items"
                active={sortKey === "items"}
                dir={sortDir}
                onClick={() => toggleSort("items")}
              />
              <SortableHead
                label="Status"
                active={sortKey === "status"}
                dir={sortDir}
                onClick={() => toggleSort("status")}
              />
              <SortableHead
                label="Elapsed"
                active={sortKey === "elapsed"}
                dir={sortDir}
                onClick={() => toggleSort("elapsed")}
              />
              <SortableHead
                label="Total"
                active={sortKey === "total"}
                dir={sortDir}
                onClick={() => toggleSort("total")}
                align="right"
              />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No orders match this filter
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => {
                const elapsedSec = Math.max(
                  0,
                  Math.floor((now - o.createdAt) / 1000),
                );
                const sinceStart = o.prepStartTime
                  ? Math.floor((now - o.prepStartTime) / 1000)
                  : 0;
                const isDelayed =
                  o.status === "preparing" && o.prepStartTime
                    ? sinceStart > o.expectedPrepTime
                    : false;
                const next = NEXT_STATUS[o.status];
                const itemCount = o.items.reduce((s, it) => s + it.qty, 0);
                return (
                  <TableRow key={o.orderId} className="text-sm">
                    <TableCell className="py-3 font-semibold tabular-nums">
                      #{o.orderId.replace("ORD-", "")}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-foreground">
                        {o.customerName}
                      </div>
                      {o.table && (
                        <div className="text-xs text-muted-foreground">
                          {o.table}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-foreground">
                        {itemCount}{" "}
                        <span className="text-muted-foreground">
                          item{itemCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div
                        className="max-w-[220px] truncate text-xs text-muted-foreground"
                        title={o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      >
                        {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          STATUS_BADGE[o.status],
                        )}
                      >
                        {STATUS_LABEL[o.status]}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "py-3 tabular-nums",
                        isDelayed
                          ? "font-semibold text-status-delayed"
                          : "text-muted-foreground",
                      )}
                    >
                      {isDelayed
                        ? `+${formatDuration(sinceStart - o.expectedPrepTime)}`
                        : formatDuration(elapsedSec)}
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold tabular-nums">
                      {currency(o.totalAmount)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        {o.status === "new" ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs"
                              onClick={() => cancelOrder(o.orderId)}
                            >
                              <X className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => acceptOrder(o.orderId)}
                            >
                              <Check className="size-3.5" /> Accept
                            </Button>
                          </>
                        ) : next ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => setOrderStatus(o.orderId, next)}
                          >
                            → {STATUS_LABEL[next]}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "size-3 transition-transform",
            active && dir === "asc" && "rotate-180",
          )}
        />
      </button>
    </TableHead>
  );
}
