// Paradox Warrior Skill Dragon Jade costs and Paradox Shop prices
// (SEA patch 202, Nov 2026). Source: https://patchnote.dragonnest.com/sea/202/c/1

export const PARADOX_FRAGMENT = "Paradox Fragment";
export const PARADOX_STONE = "Paradox Stone";

// Skill Dragon Jade +1..+10 is always 100% and only costs Paradox Fragments.
// +11..+20 uses the same rate & cost as other classes' Skill Dragon Jades.
export interface ParadoxSkillJadeMaterial {
  encLevel: string;
  dmv: number; // Dreamy / Blood Moon / Verdure
  ancient: number;
  dimOther: number; // Dimension / Otherworldly
}

export const ParadoxSkillJadeMaterialTable: ParadoxSkillJadeMaterial[] = [
  { encLevel: "+1", dmv: 1, ancient: 5, dimOther: 2 },
  { encLevel: "+2", dmv: 1, ancient: 5, dimOther: 2 },
  { encLevel: "+3", dmv: 2, ancient: 15, dimOther: 4 },
  { encLevel: "+4", dmv: 2, ancient: 15, dimOther: 4 },
  { encLevel: "+5", dmv: 8, ancient: 40, dimOther: 10 },
  { encLevel: "+6", dmv: 8, ancient: 40, dimOther: 10 },
  { encLevel: "+7", dmv: 10, ancient: 60, dimOther: 15 },
  { encLevel: "+8", dmv: 10, ancient: 60, dimOther: 15 },
  { encLevel: "+9", dmv: 12, ancient: 80, dimOther: 20 },
  { encLevel: "+10", dmv: 12, ancient: 125, dimOther: 25 },
];

export type ParadoxSkillJadeType = "dmv" | "ancient" | "dimOther";

export const PARADOX_SKILL_JADE_TYPES: {
  value: ParadoxSkillJadeType;
  label: string;
}[] = [
  { value: "dmv", label: "Dreamy / Blood Moon / Verdure" },
  { value: "ancient", label: "Ancient" },
  { value: "dimOther", label: "Dimension / Otherworldly" },
];

// Every Skill Dragon Jade in the Paradox Shop costs 1 Paradox Stone.
export const PARADOX_SKILL_JADE_PRICE_STONE = 1;

export interface ParadoxShopItem {
  key: string;
  item: string;
  qty: number;
  currency: string;
  price: number;
  limit?: string;
}

const shop = (
  rows: Omit<ParadoxShopItem, "key">[]
): ParadoxShopItem[] => rows.map((row, idx) => ({ key: `${idx}`, ...row }));

// Stage/nest currencies traded in for Paradox currency.
export const ParadoxShopCurrency = shop([
  { item: PARADOX_STONE, qty: 1, currency: "Dawn Dew Light Gem", price: 3 },
  { item: PARADOX_STONE, qty: 1, currency: PARADOX_FRAGMENT, price: 30, limit: "5 times weekly" },
  { item: PARADOX_FRAGMENT, qty: 1, currency: "Ancients' Foundation Stone", price: 30 },
  { item: PARADOX_FRAGMENT, qty: 1, currency: "Shattered Spun Gold Armor Crystal", price: 25 },
  { item: PARADOX_FRAGMENT, qty: 1, currency: "Shattered Spun Gold Weapon Crystal", price: 20 },
  { item: PARADOX_FRAGMENT, qty: 1, currency: "Unknown Ancient Accessory Fragment", price: 30, limit: "3 times weekly" },
]);

export const ParadoxShopEquipment = shop([
  { item: "Paradox Purple Energy", qty: 1, currency: PARADOX_FRAGMENT, price: 5 },
  { item: "Paradox Armor (Normal)", qty: 1, currency: PARADOX_FRAGMENT, price: 3 },
  { item: "Paradox Weapon (Normal)", qty: 1, currency: PARADOX_FRAGMENT, price: 10 },
  { item: "Paradox Accessory (Normal)", qty: 1, currency: PARADOX_FRAGMENT, price: 5 },
  { item: "Paradox Armor Upgrade Chip (Magic)", qty: 1, currency: PARADOX_STONE, price: 2 },
  { item: "Paradox Armor Upgrade Chip (Rare)", qty: 1, currency: PARADOX_STONE, price: 4 },
  { item: "Paradox Armor Upgrade Chip (Epic)", qty: 1, currency: PARADOX_STONE, price: 40 },
  { item: "Paradox Armor Upgrade Chip (Unique)", qty: 1, currency: PARADOX_STONE, price: 50 },
  { item: "Paradox Weapon Upgrade Chip (Magic)", qty: 1, currency: PARADOX_STONE, price: 4 },
  { item: "Paradox Weapon Upgrade Chip (Rare)", qty: 1, currency: PARADOX_STONE, price: 12 },
  { item: "Paradox Weapon Upgrade Chip (Epic)", qty: 1, currency: PARADOX_STONE, price: 60 },
  { item: "Paradox Weapon Upgrade Chip (Unique)", qty: 1, currency: PARADOX_STONE, price: 75 },
  { item: "Paradox Accessory Upgrade Chip (Magic)", qty: 1, currency: PARADOX_STONE, price: 3 },
  { item: "Paradox Accessory Upgrade Chip (Rare)", qty: 1, currency: PARADOX_STONE, price: 9 },
  { item: "Paradox Accessory Upgrade Chip (Epic)", qty: 1, currency: PARADOX_STONE, price: 20 },
  { item: "Paradox Accessory Upgrade Chip (Unique)", qty: 1, currency: PARADOX_STONE, price: 100 },
]);

export const ParadoxShopDragonJade = shop([
  { item: "Paradox Blue Energy", qty: 1, currency: PARADOX_FRAGMENT, price: 5 },
  {
    item: "Dreamy / Blood Moon / Verdure / Dimension / Otherworldly / Ancient Dragon Jade",
    qty: 1,
    currency: PARADOX_STONE,
    price: PARADOX_SKILL_JADE_PRICE_STONE,
  },
  { item: "Paradox Dragon Jade Additive", qty: 1, currency: PARADOX_STONE, price: 2 },
  { item: "Paradox Dragon Jade (Normal)", qty: 1, currency: PARADOX_FRAGMENT, price: 3 },
]);

export const ParadoxShopRune = shop(
  ["Triangular", "Circular", "Rectangular", "Trapezoid"].map((shape) => ({
    item: `Frozen Paradox ${shape} Rune`,
    qty: 1,
    currency: PARADOX_STONE,
    price: 2,
    limit: "1 time weekly",
  }))
);
