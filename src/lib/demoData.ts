import { HourlyOrder, MenuItem, Order, OrderStatus } from "@/types";

const MENU_SEED: Omit<MenuItem, "itemId" | "userId">[] = [
  { name: "Margherita Pizza", price: 12.5, category: "Mains", isAvailable: true, prepTimeEstimate: 720 },
  { name: "Truffle Pasta", price: 18.0, category: "Mains", isAvailable: true, prepTimeEstimate: 600 },
  { name: "Wagyu Burger", price: 22.0, category: "Mains", isAvailable: true, prepTimeEstimate: 540 },
  { name: "Caesar Salad", price: 9.5, category: "Starters", isAvailable: true, prepTimeEstimate: 240 },
  { name: "Bruschetta", price: 7.5, category: "Starters", isAvailable: true, prepTimeEstimate: 300 },
  { name: "Calamari Fritti", price: 11.0, category: "Starters", isAvailable: false, prepTimeEstimate: 420 },
  { name: "Tiramisu", price: 8.0, category: "Desserts", isAvailable: true, prepTimeEstimate: 120 },
  { name: "Lava Cake", price: 9.0, category: "Desserts", isAvailable: true, prepTimeEstimate: 360 },
  { name: "Espresso", price: 3.0, category: "Drinks", isAvailable: true, prepTimeEstimate: 90 },
  { name: "Craft Lemonade", price: 4.5, category: "Drinks", isAvailable: true, prepTimeEstimate: 120 },
  { name: "Truffle Fries", price: 6.5, category: "Sides", isAvailable: true, prepTimeEstimate: 300 },
  { name: "Garlic Bread", price: 5.0, category: "Sides", isAvailable: true, prepTimeEstimate: 240 },
];

const NAMES = [
  "Aarav S.", "Maya R.", "Liam K.", "Sofia P.", "Ethan W.", "Noor A.",
  "Diego M.", "Hana T.", "Jonas B.", "Priya N.", "Olivia G.", "Kenji I.",
  "Zara F.", "Mateo L.", "Ines D.", "Oscar V.", "Ravi C.", "Emma H.",
];

let counter = 1000;
export const newId = (prefix = "ORD") => `${prefix}-${++counter}`;
export const newMenuId = () => `MNU-${++counter}`;

export function buildMenu(userId = "rest_demo"): MenuItem[] {
  return MENU_SEED.map((m) => ({ ...m, itemId: newMenuId(), userId }));
}

const PAST_STATUSES: OrderStatus[] = ["new", "preparing", "ready", "delivered", "cancelled"];

function pickItems(menu: MenuItem[]) {
  const available = menu.filter((m) => m.isAvailable);
  const count = 1 + Math.floor(Math.random() * 3);
  const items = [];
  let prepMax = 0;
  let total = 0;
  for (let i = 0; i < count; i++) {
    const m = available[Math.floor(Math.random() * available.length)];
    const qty = 1 + Math.floor(Math.random() * 2);
    items.push({ name: m.name, qty, price: m.price, category: m.category });
    total += m.price * qty;
    prepMax = Math.max(prepMax, m.prepTimeEstimate);
  }
  return { items, total: Math.round(total * 100) / 100, expectedPrepTime: prepMax };
}

export function buildOrders(menu: MenuItem[], count = 20): Order[] {
  const now = Date.now();
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    // Distribute: ~10% cancelled, ~15% new, ~25% preparing, ~20% ready, ~30% delivered
    const r = Math.random();
    let status: OrderStatus;
    if (r < 0.1) status = "cancelled";
    else if (r < 0.25) status = "new";
    else if (r < 0.5) status = "preparing";
    else if (r < 0.7) status = "ready";
    else status = "delivered";

    const { items, total, expectedPrepTime } = pickItems(menu);
    const ageMin = Math.floor(Math.random() * 90);
    const createdAt = now - ageMin * 60_000 - Math.floor(Math.random() * 30_000);
    const order: Order = {
      orderId: newId(),
      userId: "rest_demo",
      status,
      items,
      totalAmount: total,
      createdAt,
      expectedPrepTime,
      customerName: NAMES[Math.floor(Math.random() * NAMES.length)],
      table: Math.random() > 0.4 ? `T${1 + Math.floor(Math.random() * 24)}` : undefined,
    };
    if (status === "preparing" || status === "ready" || status === "delivered") {
      order.acceptedAt = createdAt + 30_000 + Math.random() * 90_000;
      order.prepStartTime = order.acceptedAt;
    }
    if (status === "ready" || status === "delivered")
      order.readyTime = (order.prepStartTime || createdAt) + expectedPrepTime * 1000 * (0.8 + Math.random() * 0.6);
    if (status === "delivered") order.deliveredTime = (order.readyTime || createdAt) + 60_000 + Math.random() * 600_000;
    if (status === "cancelled") order.cancelledAt = createdAt + 30_000 + Math.random() * 120_000;
    orders.push(order);
  }
  return orders.sort((a, b) => b.createdAt - a.createdAt);
}

export function buildHourly(): HourlyOrder[] {
  const out: HourlyOrder[] = [];
  const today = new Date();
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const ds = date.toISOString().slice(0, 10);
    for (let h = 9; h <= 22; h++) {
      const lunch = Math.exp(-Math.pow(h - 13, 2) / 2) * 18;
      const dinner = Math.exp(-Math.pow(h - 20, 2) / 2.2) * 22;
      const noise = Math.random() * 4;
      out.push({ date: ds, hour: h, orderCount: Math.round(lunch + dinner + noise) });
    }
  }
  return out;
}

export function generateIncomingOrder(menu: MenuItem[]): Order {
  const { items, total, expectedPrepTime } = pickItems(menu);
  return {
    orderId: newId(),
    userId: "rest_demo",
    status: "new",
    items,
    totalAmount: total,
    createdAt: Date.now(),
    expectedPrepTime,
    customerName: NAMES[Math.floor(Math.random() * NAMES.length)],
    table: Math.random() > 0.4 ? `T${1 + Math.floor(Math.random() * 24)}` : undefined,
  };
}
