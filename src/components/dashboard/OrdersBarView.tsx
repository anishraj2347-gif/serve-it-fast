import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Order, OrderStatus } from "@/types";
import { currency } from "@/lib/format";

interface Props {
  orders: Order[];
}

const STATUS_ORDER: OrderStatus[] = [
  "new",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "var(--status-new)",
  preparing: "var(--status-preparing)",
  ready: "var(--status-ready)",
  delivered: "var(--status-delivered)",
  cancelled: "var(--status-cancelled)",
};

export function OrdersBarView({ orders }: Props) {
  const data = useMemo(() => {
    return STATUS_ORDER.map((status) => {
      const subset = orders.filter((o) => o.status === status);
      const revenue = subset.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        status,
        label: STATUS_LABEL[status],
        count: subset.length,
        revenue,
        color: STATUS_COLOR[status],
      };
    });
  }, [orders]);

  const totalCount = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Tickets by status
            </h3>
            <p className="text-xs text-muted-foreground">
              Live distribution across the pass
            </p>
          </div>
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 8, left: -8, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-2)", opacity: 0.5 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number, _name, props) => [
                  `${value} ticket${value === 1 ? "" : "s"} · ${currency(props.payload.revenue)}`,
                  props.payload.label,
                ]}
                labelFormatter={() => ""}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
                {data.map((d) => (
                  <Cell key={d.status} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown list */}
      <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Breakdown</h3>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {totalCount} total · {currency(totalRevenue)}
          </span>
        </div>
        <ul className="space-y-3">
          {data.map((d) => {
            const pct = totalCount === 0 ? 0 : (d.count / totalCount) * 100;
            return (
              <li key={d.status}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: d.color }}
                    />
                    <span className="font-medium text-foreground">
                      {d.label}
                    </span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    {d.count} · {currency(d.revenue)}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: d.color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
