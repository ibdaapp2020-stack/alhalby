/**
 * Mock customer service. Mirrors the public signatures of
 * `src/services/customerService.ts`.
 */
import { type ServiceResult, success, failure, ServiceError } from "@/lib/errors";
import { customerSchema, type CustomerInput } from "@/lib/validation/schemas";
import type { Customer } from "@/types";
import { mockStore, mockId, mockNowIso } from "./store";

export type Unsubscribe = () => void;

export const GUEST_CUSTOMER_ID = "guest-checkout";

const GUEST_CUSTOMER: Customer = {
  id: GUEST_CUSTOMER_ID,
  name: "Guest Customer",
  phone: "",
  address: "Walk-in",
  ordersCount: 0,
  totalSpending: 0,
  lastOrder: new Date(0).toISOString(),
  favoriteItems: [],
  notes: "",
};

function readAll(): Customer[] {
  return mockStore.getSnapshot("customers");
}

function writeAll(next: Customer[]): void {
  mockStore.setCollection("customers", next);
}

function filterAndSort(customers: Customer[], search?: string): Customer[] {
  let result = [...customers];
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }
  return result.sort(
    (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
  );
}

export async function getCustomers(search?: string): Promise<Customer[]> {
  return filterAndSort(readAll(), search);
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  if (id === GUEST_CUSTOMER_ID) return GUEST_CUSTOMER;
  return readAll().find((c) => c.id === id);
}

export async function getTopCustomers(limit = 5): Promise<Customer[]> {
  return (await getCustomers()).slice(0, limit);
}

export function subscribeToCustomers(
  search: string | undefined,
  onData: (customers: Customer[]) => void,
  _onError: (error: string) => void
): Unsubscribe {
  return mockStore.subscribe("customers", () => {
    onData(filterAndSort(readAll(), search));
  });
}

export async function createCustomer(
  input: CustomerInput
): Promise<ServiceResult<Customer>> {
  try {
    const parsed = customerSchema.parse(input);
    const customer: Customer = {
      id: mockId("cust"),
      name: parsed.name,
      phone: parsed.phone,
      address: parsed.address,
      ordersCount: 0,
      totalSpending: 0,
      lastOrder: mockNowIso(),
      favoriteItems: parsed.favoriteProducts,
      notes: parsed.notes,
    };
    writeAll([...readAll(), customer]);
    return success(customer);
  } catch (error) {
    return failure(error, "Failed to create customer");
  }
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>
): Promise<ServiceResult<Customer>> {
  try {
    const list = readAll();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) {
      return failure(new ServiceError("Customer not found", "NOT_FOUND"));
    }
    const existing = list[index]!;
    const merged: Customer = {
      ...existing,
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.favoriteProducts !== undefined
        ? { favoriteItems: input.favoriteProducts }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    };
    list[index] = merged;
    writeAll(list);
    return success(merged);
  } catch (error) {
    return failure(error, "Failed to update customer");
  }
}

export async function deleteCustomer(id: string): Promise<ServiceResult<void>> {
  try {
    writeAll(readAll().filter((c) => c.id !== id));
    return success(undefined);
  } catch (error) {
    return failure(error, "Failed to delete customer");
  }
}

export async function getOrCreateGuestCustomer(): Promise<ServiceResult<Customer>> {
  return success(GUEST_CUSTOMER);
}
