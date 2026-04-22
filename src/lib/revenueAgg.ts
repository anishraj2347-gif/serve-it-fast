import { Order } from "@/types";

export interface RevenueBucket {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryRow {
  name: string;
  revenue: number;
  orders: number;
}

export interface ItemRow {
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

/** Sums non-cancelled order revenue strictly between [from, to). */
export function sumRange(orders: Order[], from: number, to: number) {
  let revenue = 0;
  let count = 0;
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    if (o.createdAt >= from && o.createdAt < to) {
      revenue += o.totalAmount;
      count += 1;
    }
  }
  return { revenue, count };
}

/** Build category breakdown for orders in a time range. */
export function categoryBreakdown(
  orders: Order[],
  from: number,
  to: number,
): CategoryRow[] {
  const cats: Record<string, { revenue: number; orders: Set<string> }> = {};
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    if (o.createdAt < from || o.createdAt >= to) continue;
    for (const it of o.items) {
      const c = it.category || "Other";
      if (!cats[c]) cats[c] = { revenue: 0, orders: new Set() };
      cats[c].revenue += it.price * it.qty;
      cats[c].orders.add(o.orderId);
    }
  }
  return Object.entries(cats)
    .map(([name, v]) => ({
      name,
      revenue: Math.round(v.revenue * 100) / 100,
      orders: v.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

/** Top-selling items in a range. */
export function topItems(
  orders: Order[],
  from: number,
  to: number,
  limit = 8,
): ItemRow[] {
  const items: Record<string, ItemRow> = {};
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    if (o.createdAt < from || o.createdAt >= to) continue;
    for (const it of o.items) {
      if (!items[it.name]) {
        items[it.name] = {
          name: it.name,
          category: it.category || "Other",
          qty: 0,
          revenue: 0,
        };
      }
      items[it.name].qty += it.qty;
      items[it.name].revenue += it.price * it.qty;
    }
  }
  return Object.values(items)
    .map((r) => ({ ...r, revenue: Math.round(r.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Daily revenue buckets for the last 7 calendar days (today inclusive). */
export function dailyBucketsLast7(orders: Order[]): RevenueBucket[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const dayMs = 86_400_000;
  const buckets: RevenueBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = start.getTime() - i * dayMs;
    const { revenue, count } = sumRange(orders, dayStart, dayStart + dayMs);
    const d = new Date(dayStart);
    buckets.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: Math.round(revenue * 100) / 100,
      orders: count,
    });
  }
  return buckets;
}

/** Daily buckets for current month, day 1 -> today. */
export function dailyBucketsMTD(orders: Order[]): RevenueBucket[] {
  const now = new Date();
  const buckets: RevenueBucket[] = [];
  for (let day = 1; day <= now.getDate(); day++) {
    const start = new Date(now.getFullYear(), now.getMonth(), day).getTime();
    const end = new Date(now.getFullYear(), now.getMonth(), day + 1).getTime();
    const { revenue, count } = sumRange(orders, start, end);
    buckets.push({
      label: String(day).padStart(2, "0"),
      revenue: Math.round(revenue * 100) / 100,
      orders: count,
    });
  }
  return buckets;
}

/** Monthly buckets for current year, Jan -> current month. */
export function monthlyBucketsYTD(orders: Order[]): RevenueBucket[] {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets: RevenueBucket[] = [];
  for (let m = 0; m <= now.getMonth(); m++) {
    const start = new Date(now.getFullYear(), m, 1).getTime();
    const end = new Date(now.getFullYear(), m + 1, 1).getTime();
    const { revenue, count } = sumRange(orders, start, end);
    buckets.push({
      label: months[m],
      revenue: Math.round(revenue * 100) / 100,
      orders: count,
    });
  }
  return buckets;
}

/** Range boundaries helpers. */
export function ranges() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 86_400_000;

  const weekStart = startOfToday.getTime() - 6 * dayMs;
  const weekEnd = startOfToday.getTime() + dayMs;
  const prevWeekStart = weekStart - 7 * dayMs;
  const prevWeekEnd = weekStart;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthEnd = now.getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const lastMonthSamePeriodEnd = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  ).getTime();

  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const yearEnd = now.getTime();
  const lastYearStart = new Date(now.getFullYear() - 1, 0, 1).getTime();
  const lastYearSamePeriodEnd = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  ).getTime();

  return {
    week: { from: weekStart, to: weekEnd },
    prevWeek: { from: prevWeekStart, to: prevWeekEnd },
    mtd: { from: monthStart, to: monthEnd },
    lastMonthSamePeriod: { from: lastMonthStart, to: lastMonthSamePeriodEnd },
    ytd: { from: yearStart, to: yearEnd },
    lastYearSamePeriod: { from: lastYearStart, to: lastYearSamePeriodEnd },
  };
}
