export const Weights = [
  { value: "KG", label: "Kilogram", symbol: "kg", locale: "en-US", intlUnit: "kilogram" },
  { value: "G", label: "Gram", symbol: "g", locale: "en-US", intlUnit: "gram" },
  { value: "LB", label: "Pound", symbol: "lb", locale: "en-US", intlUnit: "pound" },
  { value: "OZ", label: "Ounce", symbol: "oz", locale: "en-US", intlUnit: "ounce" },
  { value: "TON", label: "Ton", symbol: "t", locale: "en-US", intlUnit: "ton" },
  { value: "ST", label: "Stone", symbol: "st", locale: "en-GB", intlUnit: "stone" }, // UK Stone
];

export type Weight = (typeof Weights)[0];
