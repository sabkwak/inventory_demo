export const Weights = [
  { value: "KG", label: "Kilogram", symbol: "kg", locale: "en-US", intlDefaultUnit: "kilogram" },
  { value: "G", label: "Gram", symbol: "g", locale: "en-US", intlDefaultUnit: "gram" },
  { value: "LB", label: "Pound", symbol: "lb", locale: "en-US", intlDefaultUnit: "pound" },
  { value: "OZ", label: "Ounce", symbol: "oz", locale: "en-US", intlDefaultUnit: "ounce" },
  { value: "TON", label: "Ton", symbol: "t", locale: "en-US", intlDefaultUnit: "ton" },
  { value: "ST", label: "Stone", symbol: "st", locale: "en-GB", intlDefaultUnit: "stone" }, // UK Stone
];

export type Weight = (typeof Weights)[0];
