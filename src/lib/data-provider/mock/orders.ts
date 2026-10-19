/**
 * Mock order service. Mirrors the public signatures of
 * `src/services/orderService.ts` — enough for the storefront checkout
 * flow and the admin orders screen to work without Firebase.
 */
import { type ServiceResult, success, failure, ServiceError } from "@/lib/errors";
import { orderSchema, type OrderInput } from "@/lib/validation/schemas";
import { forcePickupForNewOrder, NEW_ORDER_FULFILLMENT } from "@/lib/orders/fulfillment";
import {
  calculateLineTotal,
  collectKitchenNotes,
} from "@/lib/product-builder/engine";
import { getLocalizedName } from "@/lib/i18n/localized-content";
import type {
  CartItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentStatus,
} from "@/types";
import { mockStore, mockId, mockNowIso } from "./store";

export type Unsubscribe = () => void;

function readAll(): Order[] {
  return mockStore.getSnapshot("orders");
}

function writeAll(next: Order[]): void {
  mockStore.setCollection("orders", next);
}

function sortByCreatedDesc(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function filter(
  orders: Order[],
  filters?: { search?: string; status?: OrderStatus | "all" }
): Order[] {
  let result = sortByCreatedDesc(orders);
  if (filters?.status && filters.status !== "all") {
    result = result.filter((o) => o.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
  }
  return result;
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const tail = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  return `OR-${year}-${tail.slice(-8)}`;
}

export async function getOrders(filters?: {
  search?: string;
  status?: OrderStatus | "all";
}): Promise<Order[]> {
  return filter(readAll(), filters);
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  return readAll().find((o) => o.id === id);
}

export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
  return sortByCreatedDesc(readAll().filter((o) => o.customerId === customerId));
}

export async function getOrderStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivered: number;
  cancelled: number;
}> {
  const orders = readAll();
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };
}

export function subscribeToOrders(
  filters: { search?: string; status?: OrderStatus | "all" } | undefined,
  onData: (orders: Order[]) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("orders", () => {
    onData(filter(readAll(), filters));
  });
}

function buildOrder(parsed: OrderInput, orderNumber: string): Order {
  return {
    id: mockId("order"),
    orderNumber,
    customerId: parsed.customerId,
    customerName: parsed.customerName,
    status: parsed.status,
    items: parsed.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      ...(item.basePrice !== undefined ? { basePrice: item.basePrice } : {}),
      ...(item.notes ? { notes: item.notes } : {}),
      ...(item.kitchenNotes?.length ? { kitchenNotes: item.kitchenNotes } : {}),
      ...(item.modifiers?.length ? { modifiers: item.modifiers } : {}),
    })),
    subtotal: parsed.subtotal,
    discount: parsed.discount ?? 0,
    delivery: parsed.delivery ?? 0,
    total: parsed.total,
    paymentMethod: parsed.paymentMethod ?? "cash",
    paymentStatus: parsed.paymentStatus ?? "pending",
    customerPhone: parsed.customerPhone?.trim() || undefined,
    orderType: parsed.orderType,
    deliveryAddress: parsed.deliveryAddress,
    notes: parsed.notes?.trim() ?? "",
    locale: parsed.locale,
    createdAt: mockNowIso(),
    confirmedAt: null,
    preparationStartedAt: null,
    readyAt: null,
    completedAt: null,
    cancelledAt: null,
  };
}

export async function createOrder(input: OrderInput): Promise<ServiceResult<Order>> {
  try {
    const parsed = forcePickupForNewOrder(orderSchema.parse(input));
    const order = buildOrder(parsed, generateOrderNumber());
    writeAll([order, ...readAll()]);
    return success(order);
  } catch (error) {
    return failure(error, "Failed to create order");
  }
}

export async function createOrderFromCart(
  cartItems: CartItem[],
  customerId: string,
  customerName: string,
  checkout?: {
    subtotal?: number;
    discount?: number;
    total?: number;
    paymentMethod?: string;
    paymentStatus?: PaymentStatus;
    customerPhone?: string;
    notes?: string;
    locale?: "ar" | "he" | "en";
  }
): Promise<ServiceResult<Order>> {
  const locale = checkout?.locale;
  const items: OrderItem[] = cartItems.map((item) => {
    const mapped: OrderItem = {
      productId: item.product.id,
      productName: locale
        ? getLocalizedName(item.product, locale)
        : item.product.name_he || item.product.name_en,
      quantity: item.quantity,
      price: item.unitPrice,
      basePrice: item.product.price,
    };
    if (item.selections.length > 0) mapped.modifiers = item.selections;
    const note = item.notes?.trim();
    if (note) mapped.notes = note;
    const kitchenNotes = collectKitchenNotes(item.selections);
    if (kitchenNotes.length > 0) mapped.kitchenNotes = kitchenNotes;
    return mapped;
  });

  const subtotal =
    checkout?.subtotal ??
    items.reduce(
      (sum, item) => sum + calculateLineTotal(item.price, item.quantity),
      0
    );
  const discount = checkout?.discount ?? 0;
  const total = Math.max(subtotal - discount, 0.01);

  return createOrder({
    customerId,
    customerName,
    items,
    status: "pending",
    subtotal,
    discount,
    delivery: 0,
    total,
    paymentMethod: checkout?.paymentMethod ?? "cash",
    paymentStatus: checkout?.paymentStatus ?? "pending",
    customerPhone: checkout?.customerPhone,
    orderType: NEW_ORDER_FULFILLMENT,
    notes: checkout?.notes?.trim() ?? "",
    locale,
  });
}

export async function updateOrder(
  id: string,
  input: Partial<OrderInput & { orderNumber?: string }>
): Promise<ServiceResult<Order>> {
  try {
    const list = readAll();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) {
      return failure(new ServiceError("Order not found", "NOT_FOUND"));
    }
    const existing = list[index]!;
    const merged: Order = {
      ...existing,
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      ...(input.customerName !== undefined ? { customerName: input.customerName } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.items !== undefined ? { items: input.items as OrderItem[] } : {}),
      ...(input.subtotal !== undefined ? { subtotal: input.subtotal } : {}),
      ...(input.discount !== undefined ? { discount: input.discount } : {}),
      ...(input.delivery !== undefined ? { delivery: input.delivery } : {}),
      ...(input.total !== undefined ? { total: input.total } : {}),
      ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod } : {}),
      ...(input.paymentStatus !== undefined ? { paymentStatus: input.paymentStatus } : {}),
      ...(input.customerPhone !== undefined ? { customerPhone: input.customerPhone } : {}),
      ...(input.orderType !== undefined ? { orderType: input.orderType } : {}),
      ...(input.deliveryAddress !== undefined
        ? { deliveryAddress: input.deliveryAddress }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.locale !== undefined ? { locale: input.locale } : {}),
      ...(input.orderNumber !== undefined ? { orderNumber: input.orderNumber } : {}),
    };
    list[index] = merged;
    writeAll(list);
    return success(merged);
  } catch (error) {
    return failure(error, "Failed to update order");
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  metadata?: { cancelReason?: string; cancelledBy?: string }
): Promise<ServiceResult<void>> {
  try {
    const list = readAll();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) {
      return failure(new ServiceError("Order not found", "NOT_FOUND"));
    }
    const now = mockNowIso();
    const existing = list[index]!;
    const next: Order = { ...existing, status };
    if (status === "confirmed") next.confirmedAt = now;
    if (status === "preparing") next.preparationStartedAt = now;
    if (status === "ready") next.readyAt = now;
    if (status === "delivered") next.completedAt = now;
    if (status === "cancelled") {
      next.cancelledAt = now;
      next.cancelReason = metadata?.cancelReason?.trim() || "other";
      next.cancelledBy = metadata?.cancelledBy?.trim() || "admin";
    }
    list[index] = next;
    writeAll(list);
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to update order status");
  }
}

export async function deleteOrder(id: string): Promise<ServiceResult<void>> {
  try {
    writeAll(readAll().filter((o) => o.id !== id));
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to delete order");
  }
}

export async function updateOrderItemExtras(
  orderId: string,
  itemIndex: number,
  update: {
    price: number;
    modifiers?: OrderItem["modifiers"];
    notes?: string;
    kitchenNotes?: string[];
  }
): Promise<ServiceResult<Order>> {
  const list = readAll();
  const orderIndex = list.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return failure(new ServiceError("Order not found", "NOT_FOUND"));
  }
  const order = list[orderIndex]!;
  if (itemIndex < 0 || itemIndex >= order.items.length) {
    return failure(new ServiceError("Invalid item index", "INVALID_ITEM"));
  }
  const items = order.items.map((item, i) => {
    if (i !== itemIndex) return item;
    const next: OrderItem = { ...item, price: update.price };
    if (update.modifiers?.length) next.modifiers = update.modifiers;
    else delete next.modifiers;
    const note = update.notes?.trim();
    if (note) next.notes = note;
    else delete next.notes;
    if (update.kitchenNotes?.length) next.kitchenNotes = update.kitchenNotes;
    else delete next.kitchenNotes;
    return next;
  });
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineTotal(item.price, item.quantity),
    0
  );
  const total = Math.max(subtotal + (order.delivery ?? 0) - (order.discount ?? 0), 0.01);
  const next: Order = { ...order, items, subtotal, total };
  list[orderIndex] = next;
  writeAll(list);
  return success(next);
}
