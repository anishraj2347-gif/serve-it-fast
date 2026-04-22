import { create } from "zustand";
import { MenuItem, Order, OrderStatus } from "@/types";
import { buildHourly, buildMenu, buildOrders, newMenuId } from "@/lib/demoData";

interface DashboardState {
  restaurantName: string;
  orders: Order[];
  menu: MenuItem[];
  hourly: ReturnType<typeof buildHourly>;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  addOrder: (order: Order) => void;
  addMenuItem: (item: Omit<MenuItem, "itemId" | "userId">) => void;
  updateMenuItem: (itemId: string, patch: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleAvailability: (itemId: string) => void;
}

const initialMenu = buildMenu();
const initialOrders = buildOrders(initialMenu, 18);
const initialHourly = buildHourly();

export const useDashboard = create<DashboardState>((set) => ({
  restaurantName: "Bella Cucina",
  orders: initialOrders,
  menu: initialMenu,
  hourly: initialHourly,

  setOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.orderId !== orderId) return o;
        const now = Date.now();
        const next: Order = { ...o, status };
        if (status === "preparing" && !o.prepStartTime) {
          next.prepStartTime = now;
          if (!o.acceptedAt) next.acceptedAt = now;
        }
        if (status === "ready" && !o.readyTime) next.readyTime = now;
        if (status === "delivered" && !o.deliveredTime) next.deliveredTime = now;
        if (status === "cancelled" && !o.cancelledAt) next.cancelledAt = now;
        return next;
      }),
    })),

  acceptOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.orderId !== orderId || o.status !== "new") return o;
        const now = Date.now();
        return { ...o, status: "preparing", acceptedAt: now, prepStartTime: now };
      }),
    })),

  cancelOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.orderId !== orderId) return o;
        return { ...o, status: "cancelled", cancelledAt: Date.now() };
      }),
    })),

  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

  addMenuItem: (item) =>
    set((state) => ({
      menu: [{ ...item, itemId: newMenuId(), userId: "rest_demo" }, ...state.menu],
    })),

  updateMenuItem: (itemId, patch) =>
    set((state) => ({
      menu: state.menu.map((m) => (m.itemId === itemId ? { ...m, ...patch } : m)),
    })),

  deleteMenuItem: (itemId) =>
    set((state) => ({ menu: state.menu.filter((m) => m.itemId !== itemId) })),

  toggleAvailability: (itemId) =>
    set((state) => ({
      menu: state.menu.map((m) => (m.itemId === itemId ? { ...m, isAvailable: !m.isAvailable } : m)),
    })),
}));
