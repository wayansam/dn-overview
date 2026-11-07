import { GoldenHeraldryCraftMats } from "../../interface/Item.interface";
import {
  columnCommonItemFlag,
  CommonItemStats,
} from "../../interface/ItemStat.interface";

// Sources:
// - Bear/Wind/Intellect/Vitality: https://patchnote.dragonnest.com/sea/174/c/5
// - Iron Wall/Tent/Fatal/Limit: https://patchnote.dragonnest.com/sea/202/c/2
// Lv.1-4 are crafted in a chain (each level consumes 1 heraldry of the level
// below, returned on failure) with Epic/Unique plates. Blessed is crafted
// directly from a Legend plate and needs no lower level. The 174 patch note
// calls Blessed "Lv.5" in its stat tables.

export const GOLDEN_HERALDRY_LEVELS = ["Lv.1", "Lv.2", "Lv.3", "Lv.4"];
export const GOLDEN_HERALDRY_BLESSED = "Blessed";

export interface GoldenHeraldryPlate {
  grade: string;
  plateName: string;
  successRatePercent: number;
  use: string;
}

export const GoldenHeraldryPlateTable: GoldenHeraldryPlate[] = [
  {
    grade: "Epic",
    plateName: "Golden Plate (individual per type)",
    successRatePercent: 20,
    use: "Lv.1 - Lv.4",
  },
  {
    grade: "Unique",
    plateName: "Golden Plate (individual per type)",
    successRatePercent: 70,
    use: "Lv.1 - Lv.4",
  },
  {
    grade: "Legend",
    plateName: "Blessed Golden Plate (common per group)",
    successRatePercent: 100,
    use: "Blessed",
  },
];

// Bear/Wind/Intellect/Vitality all share one crafting table.
const StatCraftMatsTable: GoldenHeraldryCraftMats[] = [
  {
    encLevel: "Lv.1",
    gold: 10000,
    prevHeraldry: 0,
    foundationStone: 1000,
    weaponCrystal: 800,
    armorCrystal: 2500,
    special: 0,
  },
  {
    encLevel: "Lv.2",
    gold: 15000,
    prevHeraldry: 1,
    foundationStone: 2000,
    weaponCrystal: 1200,
    armorCrystal: 3500,
    special: 0,
  },
  {
    encLevel: "Lv.3",
    gold: 20000,
    prevHeraldry: 1,
    foundationStone: 3000,
    weaponCrystal: 1800,
    armorCrystal: 4500,
    special: 0,
  },
  {
    encLevel: "Lv.4",
    gold: 25000,
    prevHeraldry: 1,
    foundationStone: 4000,
    weaponCrystal: 2500,
    armorCrystal: 6000,
    special: 0,
  },
  {
    encLevel: "Blessed",
    gold: 100000,
    prevHeraldry: 0,
    foundationStone: 16000,
    weaponCrystal: 10000,
    armorCrystal: 30000,
    special: 0,
  },
];

// Iron Wall/Tent/Fatal/Limit share gold & Foundation Stone, use only one
// crystal type below Blessed, and each adds its own 4th material.
const makeDefOffCraftMats = (
  crystal: "weapon" | "armor",
  crystalQty: [number, number, number, number],
  specialQty: [number, number, number, number, number],
): GoldenHeraldryCraftMats[] => {
  const golds = [5000, 7500, 10000, 12500, 50000];
  const stones = [500, 1000, 1500, 2000, 16000];
  return [...GOLDEN_HERALDRY_LEVELS, GOLDEN_HERALDRY_BLESSED].map(
    (encLevel, idx) => {
      const isBlessed = idx === 4;
      return {
        encLevel,
        gold: golds[idx],
        prevHeraldry: idx === 0 || isBlessed ? 0 : 1,
        foundationStone: stones[idx],
        weaponCrystal: isBlessed
          ? 10000
          : crystal === "weapon"
            ? crystalQty[idx]
            : 0,
        armorCrystal: isBlessed
          ? 30000
          : crystal === "armor"
            ? crystalQty[idx]
            : 0,
        special: specialQty[idx],
      };
    },
  );
};

const IronWallCraftMatsTable = makeDefOffCraftMats(
  "armor",
  [1250, 1750, 2250, 3000],
  [1500, 1750, 2000, 2500, 15000],
);
const TentCraftMatsTable = makeDefOffCraftMats(
  "armor",
  [1250, 1750, 2250, 3000],
  [150, 175, 200, 250, 1500],
);
const FatalCraftMatsTable = makeDefOffCraftMats(
  "weapon",
  [400, 600, 900, 1250],
  [1300, 1500, 1700, 2000, 12000],
);
const LimitCraftMatsTable = makeDefOffCraftMats(
  "weapon",
  [400, 600, 900, 1250],
  [75, 100, 125, 150, 1000],
);

// Every type shares the same ATK curve and Final Damage (Blessed only); the
// type's own flat + % stat is the same at every level.
const ATK = [800000, 960000, 1152000, 1613000, 2500000];
const makeStats = (
  extra: Omit<CommonItemStats, "encLevel">,
): CommonItemStats[] =>
  [...GOLDEN_HERALDRY_LEVELS, GOLDEN_HERALDRY_BLESSED].map((encLevel, idx) => ({
    encLevel,
    phyMagAtk: ATK[idx],
    ...extra,
    ...(idx === 4 ? { fd: 1236 } : {}),
  }));

export interface GoldenHeraldry {
  key: string;
  label: string;
  group: "stat" | "defOff";
  specialItem?: string;
  craftMats: GoldenHeraldryCraftMats[];
  stats: CommonItemStats[];
  flags: columnCommonItemFlag;
}

export const GOLDEN_HERALDRIES: GoldenHeraldry[] = [
  {
    key: "bear",
    label: "Bear",
    group: "stat",
    craftMats: StatCraftMatsTable,
    stats: makeStats({ str: 12000, strPercent: 10 }),
    flags: {
      phyMagAtkFlag: true,
      strFlag: true,
      strPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "wind",
    label: "Wind",
    group: "stat",
    craftMats: StatCraftMatsTable,
    stats: makeStats({ agi: 12000, agiPercent: 10 }),
    flags: {
      phyMagAtkFlag: true,
      agiFlag: true,
      agiPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "intellect",
    label: "Intellect",
    group: "stat",
    craftMats: StatCraftMatsTable,
    stats: makeStats({ int: 12000, intPercent: 10 }),
    flags: {
      phyMagAtkFlag: true,
      intFlag: true,
      intPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "vitality",
    label: "Vitality",
    group: "stat",
    craftMats: StatCraftMatsTable,
    stats: makeStats({ vit: 6000, vitPercent: 7 }),
    flags: {
      phyMagAtkFlag: true,
      vitFlag: true,
      vitPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "ironWall",
    label: "Iron Wall",
    group: "defOff",
    specialItem: "Hand Mushroom",
    craftMats: IronWallCraftMatsTable,
    stats: makeStats({ def: 45000, defPercent: 10 }),
    flags: {
      phyMagAtkFlag: true,
      defFlag: true,
      defPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "tent",
    label: "Tent",
    group: "defOff",
    specialItem: "Demon Bone Bell",
    craftMats: TentCraftMatsTable,
    stats: makeStats({ magdef: 45000, magdefPercent: 10 }),
    flags: {
      phyMagAtkFlag: true,
      magdefFlag: true,
      magdefPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "fatal",
    label: "Fatal",
    group: "defOff",
    specialItem: "Sparkling Golden Ink",
    craftMats: FatalCraftMatsTable,
    stats: makeStats({ crt: 150000, crtPercent: 20 }),
    flags: {
      phyMagAtkFlag: true,
      crtFlag: true,
      crtPercentFlag: true,
      fdFlag: true,
    },
  },
  {
    key: "limit",
    label: "Limit",
    group: "defOff",
    specialItem: "Deeply Rooted Fragment of Longing",
    craftMats: LimitCraftMatsTable,
    stats: makeStats({ cdm: 675000, cdmPercent: 20 }),
    flags: {
      phyMagAtkFlag: true,
      cdmFlag: true,
      cdmPercentFlag: true,
      fdFlag: true,
    },
  },
];
