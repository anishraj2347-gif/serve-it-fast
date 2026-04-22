import { Order, HourlyOrder } from "@/types";

interface BuildPayloadArgs {
  question: string;
  restaurantName: string;
  orders: Order[];
  hourly: HourlyOrder[];
}

export function buildAnalysisPayload({
  question,
  restaurantName,
  orders,
  hourly,
}: BuildPayloadArgs) {
  let revenue = 0;
  const statusBreakdown: Record<string, number> = {};
  const revenueByCategory: Record<string, number> = {};
  const itemAgg: Record<string, { qty: number; revenue: number }> = {};

  let prepSum = 0,
    prepN = 0,
    delSum = 0,
    delN = 0;
  let accepted = 0,
    cancelled = 0,
    decided = 0;

  for (const o of orders) {
    revenue += o.totalAmount;
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    for (const it of o.items) {
      const cat = it.category ?? "Uncategorised";
      revenueByCategory[cat] =
        (revenueByCategory[cat] || 0) + it.qty * it.price;
      const agg = itemAgg[it.name] ?? { qty: 0, revenue: 0 };
      agg.qty += it.qty;
      agg.revenue += it.qty * it.price;
      itemAgg[it.name] = agg;
    }
    if (o.prepStartTime && o.readyTime) {
      prepSum += (o.readyTime - o.prepStartTime) / 1000;
      prepN++;
    }
    if (o.readyTime && o.deliveredTime) {
      delSum += (o.deliveredTime - o.readyTime) / 1000;
      delN++;
    }
    if (o.status === "cancelled") {
      cancelled++;
      decided++;
    } else if (o.status !== "new") {
      accepted++;
      decided++;
    }
  }

  const topItems = Object.entries(itemAgg)
    .map(([name, v]) => ({
      name,
      qty: v.qty,
      revenue: round2(v.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const today = hourly[hourly.length - 1]?.date;
  const hourlyToday = hourly
    .filter((h) => h.date === today)
    .map((h) => ({ hour: h.hour, orders: h.orderCount }));

  const weeklyMap: Record<string, number> = {};
  for (const h of hourly) {
    weeklyMap[h.date] = (weeklyMap[h.date] || 0) + h.orderCount;
  }
  const weekly = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, orders]) => ({ date, orders }));

  const recentOrders = orders.slice(0, 30).map((o) => ({
    orderId: o.orderId,
    status: o.status,
    totalAmount: round2(o.totalAmount),
    itemCount: o.items.reduce((s, it) => s + it.qty, 0),
    createdAtISO: new Date(o.createdAt).toISOString(),
    createdHour: new Date(o.createdAt).getHours(),
    prepSeconds:
      o.prepStartTime && o.readyTime
        ? Math.round((o.readyTime - o.prepStartTime) / 1000)
        : null,
    deliverySeconds:
      o.readyTime && o.deliveredTime
        ? Math.round((o.deliveredTime - o.readyTime) / 1000)
        : null,
    items: o.items.map((it) => ({
      name: it.name,
      qty: it.qty,
      price: it.price,
      category: it.category,
    })),
  }));

  return {
    question,
    restaurantName,
    generatedAtISO: new Date().toISOString(),
    totals: {
      orders: orders.length,
      revenue: round2(revenue),
      avgTicket: orders.length ? round2(revenue / orders.length) : 0,
      statusBreakdown,
      revenueByCategory: Object.fromEntries(
        Object.entries(revenueByCategory).map(([k, v]) => [k, round2(v)]),
      ),
      topItems,
      avgPrepSeconds: prepN ? Math.round(prepSum / prepN) : 0,
      avgDeliverySeconds: delN ? Math.round(delSum / delN) : 0,
      acceptanceRate: decided ? Math.round((accepted / decided) * 100) : 0,
      cancellationRate: decided ? Math.round((cancelled / decided) * 100) : 0,
    },
    hourlyToday,
    weekly,
    recentOrders,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
