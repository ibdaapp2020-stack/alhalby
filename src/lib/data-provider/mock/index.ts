/**
 * Mock data provider — barrel exports.
 *
 * Each namespace (products, categories, orders, …) exposes the same
 * function names as its corresponding real service, so the real
 * services can route to it conditionally.
 */
export * as mockProducts from "./products";
export * as mockCategories from "./categories";
export * as mockOrders from "./orders";
export * as mockBanners from "./banners";
export * as mockSettings from "./settings";
export * as mockCustomers from "./customers";
export * as mockModifiers from "./modifiers";
export * as mockStorage from "./storage";
export * as mockAuth from "./auth";
export { mockStore } from "./store";
