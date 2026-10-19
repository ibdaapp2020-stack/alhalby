/**
 * Local fallback catalog data.
 *
 * STORE-STARTER ships with an empty catalog. Products and categories live
 * exclusively in Firestore and are managed through Admin → Products /
 * Categories. Until the first write arrives the storefront renders an empty
 * state ("we're preparing the store") rather than placeholder demo content.
 *
 * To seed a starter catalog for a new tenant, use `npm run seed` (see
 * SETUP.md) after populating `scripts/data/products.json`.
 */

import type { BusinessType } from "@/lib/menu/category-meta";

export interface MasterMenuProduct {
  id: string;
  categoryId: string;
  nameHe: string;
  nameAr: string;
  nameEn: string;
  descriptionHe: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  cost: number;
  profit: number;
  businessType: BusinessType;
  popular: boolean;
  available: boolean;
  hidden: boolean;
  image: string;
  sortOrder: number;
  active: boolean;
  menuCode?: string;
  productType?: string;
}

export interface MasterMenuCategory {
  id: string;
  nameHe: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  sortOrder: number;
  active: boolean;
}

export const masterMenuCategories: MasterMenuCategory[] = [];
export const masterMenuProducts: MasterMenuProduct[] = [];

export const MASTER_MENU_STATS = {
  categories: masterMenuCategories.length,
  products: masterMenuProducts.length,
  popular: 0,
  active: 0,
  hidden: 0,
};
