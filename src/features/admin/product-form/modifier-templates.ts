export type ModifierTemplateOption = {
  nameHe: string;
  priceDelta?: number;
};

export type ModifierTemplate = {
  id: string;
  labelKey: string;
  nameHe: string;
  selectionType: "single" | "multiple";
  required: boolean;
  options: ModifierTemplateOption[];
};

export const MODIFIER_TEMPLATES: ModifierTemplate[] = [
  {
    id: "nut",
    labelKey: "admin.productForm.templateIce",
    nameHe: "סוג מילוי",
    selectionType: "single",
    required: false,
    options: [
      { nameHe: "פיסטוק" },
      { nameHe: "אגוז מלך" },
      { nameHe: "קשיו" },
    ],
  },
  {
    id: "syrup",
    labelKey: "admin.productForm.templateMilk",
    nameHe: "סירופ",
    selectionType: "single",
    required: false,
    options: [{ nameHe: "קל" }, { nameHe: "רגיל" }, { nameHe: "בלי סירופ" }],
  },
  {
    id: "pack",
    labelKey: "admin.productForm.templateCup",
    nameHe: "אריזה",
    selectionType: "single",
    required: false,
    options: [{ nameHe: "קופסה" }, { nameHe: "מגש" }, { nameHe: "שקית" }],
  },
  {
    id: "extras",
    labelKey: "admin.productForm.templateSauces",
    nameHe: "תוספות",
    selectionType: "multiple",
    required: false,
    options: [
      { nameHe: "פיסטוק טחון", priceDelta: 3 },
      { nameHe: "מי ורדים" },
      { nameHe: "קינמון" },
    ],
  },
  {
    id: "size",
    labelKey: "admin.productForm.templateSize",
    nameHe: "גודל",
    selectionType: "single",
    required: true,
    options: [
      { nameHe: "אישי" },
      { nameHe: "משפחתי", priceDelta: 20 },
    ],
  },
  {
    id: "gift",
    labelKey: "admin.productForm.templateSandwich",
    nameHe: "אריזת מתנה",
    selectionType: "single",
    required: false,
    options: [{ nameHe: "בלי אריזה" }, { nameHe: "סרט" }, { nameHe: "קופסת מתנה", priceDelta: 8 }],
  },
];
