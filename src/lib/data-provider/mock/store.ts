/**
 * Mock data store — in-memory + localStorage.
 *
 * Shared single instance that holds products, categories, orders,
 * customers, banners and settings for the demo provider. Mutations call
 * {@link MockStore.notify} which fans out to all subscribers of the
 * affected collection, mimicking Firestore's `onSnapshot` behaviour.
 *
 * **Server-side rendering** reads a fresh in-memory copy of the seed
 * data (no localStorage access). On the client, {@link MockStore.hydrate}
 * merges any previously persisted mutations on top of the seed. This
 * guarantees that first paint matches between server and client even
 * when the user has customized the catalog in demo mode.
 */

import type {
  BannerSlide,
  Category,
  Customer,
  Order,
  Product,
} from "@/types";
import type { AppSettings } from "@/services/settingsService";
import {
  mockBanners,
  mockCategories,
  mockCustomers,
  mockOrders,
  mockProducts,
  mockSettings,
} from "@/lib/mock-data";

export type CollectionKey =
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "banners"
  | "settings";

export interface MockDatabase {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  banners: BannerSlide[];
  settings: AppSettings;
}

const STORAGE_KEY = "store-mock-db-v3";
const PERSIST_DEBOUNCE_MS = 100;

/**
 * Lightweight deep clone that works for all mock data shapes. We can't
 * rely on `structuredClone` for environments that polyfill differently;
 * JSON round-trip is sufficient because all our types are JSON-safe.
 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seed(): MockDatabase {
  return clone({
    products: mockProducts,
    categories: mockCategories,
    orders: mockOrders,
    customers: mockCustomers,
    banners: mockBanners,
    settings: mockSettings,
  });
}

class MockStore {
  private db: MockDatabase = seed();
  private listeners: Record<CollectionKey, Set<() => void>> = {
    products: new Set(),
    categories: new Set(),
    orders: new Set(),
    customers: new Set(),
    banners: new Set(),
    settings: new Set(),
  };
  private hydrated = false;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  hydrate(): void {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<MockDatabase>;
      // Merge parsed values on top of seed so new seed items also appear
      // after a localStorage reset.
      if (Array.isArray(parsed.products)) this.db.products = parsed.products;
      if (Array.isArray(parsed.categories)) this.db.categories = parsed.categories;
      if (Array.isArray(parsed.orders)) this.db.orders = parsed.orders;
      if (Array.isArray(parsed.customers)) this.db.customers = parsed.customers;
      if (Array.isArray(parsed.banners)) this.db.banners = parsed.banners;
      if (parsed.settings && typeof parsed.settings === "object") {
        this.db.settings = { ...this.db.settings, ...parsed.settings };
      }
    } catch (error) {
      console.warn("[mock-store] failed to hydrate from localStorage:", error);
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    if (this.persistTimer) clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
      } catch (error) {
        console.warn("[mock-store] failed to persist to localStorage:", error);
      }
    }, PERSIST_DEBOUNCE_MS);
  }

  reset(): void {
    this.db = seed();
    this.persist();
    (Object.keys(this.listeners) as CollectionKey[]).forEach((key) => this.notify(key));
  }

  getSnapshot<K extends CollectionKey>(key: K): MockDatabase[K] {
    this.hydrate();
    return clone(this.db[key]);
  }

  setCollection<K extends Exclude<CollectionKey, "settings">>(
    key: K,
    value: MockDatabase[K]
  ): void {
    this.db[key] = value as MockDatabase[K];
    this.persist();
    this.notify(key);
  }

  setSettings(value: AppSettings): void {
    this.db.settings = value;
    this.persist();
    this.notify("settings");
  }

  subscribe(key: CollectionKey, listener: () => void): () => void {
    this.hydrate();
    this.listeners[key].add(listener);
    // Fire once immediately so subscribers get the current snapshot.
    queueMicrotask(() => {
      if (this.listeners[key].has(listener)) listener();
    });
    return () => {
      this.listeners[key].delete(listener);
    };
  }

  private notify(key: CollectionKey): void {
    for (const listener of this.listeners[key]) {
      try {
        listener();
      } catch (error) {
        console.error("[mock-store] subscriber threw:", error);
      }
    }
  }
}

export const mockStore = new MockStore();

/** Random, URL-safe-ish id. Not cryptographic — demo use only. */
export function mockId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${stamp}${rand}`;
}

/** Current ISO date — mirrors Firestore `nowTimestamp()` for client code. */
export function mockNowIso(): string {
  return new Date().toISOString();
}
