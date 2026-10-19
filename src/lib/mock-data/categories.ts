/**
 * Mock categories — 4 neutral example categories used by the demo
 * provider when no backend is wired. Replace or empty when connecting a
 * real database.
 */
import type { Category } from "@/types";

export const mockCategories: Category[] = [
  {
    id: "cat-signature",
    name_he: "המומלצים שלנו",
    name_ar: "اختياراتنا المميزة",
    name_en: "Signature Picks",
    icon: "star",
    image: "",
    color: "#C12C22",
    sortOrder: 1,
    active: true,
    parentId: null,
  },
  {
    id: "cat-drinks",
    name_he: "משקאות",
    name_ar: "مشروبات",
    name_en: "Drinks",
    icon: "coffee",
    image: "",
    color: "#C27B42",
    sortOrder: 2,
    active: true,
    parentId: null,
  },
  {
    id: "cat-pastries",
    name_he: "מאפים",
    name_ar: "معجنات",
    name_en: "Pastries",
    icon: "croissant",
    image: "",
    color: "#B88717",
    sortOrder: 3,
    active: true,
    parentId: null,
  },
  {
    id: "cat-desserts",
    name_he: "קינוחים",
    name_ar: "حلويات",
    name_en: "Desserts",
    icon: "cake",
    image: "",
    color: "#A5241B",
    sortOrder: 4,
    active: true,
    parentId: null,
  },
];
