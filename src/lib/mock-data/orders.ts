/**
 * Mock orders — intentionally empty. The demo provider creates orders
 * dynamically when the customer completes checkout; those orders are
 * persisted to `localStorage` so admin screens can display them.
 */
import type { Order } from "@/types";

export const mockOrders: Order[] = [];
