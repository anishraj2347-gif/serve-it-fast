export type OrderStatus = "new" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  category?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: number;
  acceptedAt?: number;
  cancelledAt?: number;
  prepStartTime?: number;
  readyTime?: number;
  deliveredTime?: number;
  expectedPrepTime: number; // seconds
  customerName: string;
  table?: string;
}

export interface MenuItem {
  itemId: string;
  userId: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  prepTimeEstimate: number; // seconds
}

export interface HourlyOrder {
  date: string;
  hour: number;
  orderCount: number;
}
