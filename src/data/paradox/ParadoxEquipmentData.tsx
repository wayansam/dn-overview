import { EQUIPMENT } from "../../constants/InGame.constants";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";

// Paradox Warrior-exclusive equipment (SEA patch 202, Nov 2026).
// Source: https://patchnote.dragonnest.com/sea/202/c/1
//
// Every part walks one linear progression, which is what the calculator's
// From/To positions index into:
//   0            = Buy (not owned yet, bought from the Paradox Shop)
//   1..11        = Normal +0..+10
//   12..22       = Magic  +0..+10
//   23..33       = Rare   +0..+10
//   34..44       = Epic   +0..+10
//   45           = Unique +0 (armor/weapon can't be enhanced further)
//   45..50       = Unique +0..+5 (accessories only)
// Moving from a +10 into the next grade's +0 is an evolution, paid with that
// grade's Upgrade Chip (bought from the shop with Paradox Stones).

export const PARADOX_GRADES = ["Normal", "Magic", "Rare", "Epic", "Unique"];
const LEVELS_PER_GRADE = 11; // +0..+10

export type ParadoxCategory = "armor" | "weapon" | "accessory";

export const PARADOX_MAX_POSITION: Record<ParadoxCategory, number> = {
  armor: 45,
  weapon: 45,
  accessory: 50,
};

export const getParadoxCategory = (equipment: EQUIPMENT): ParadoxCategory => {
  switch (equipment) {
    case EQUIPMENT.MAIN_WEAPON:
    case EQUIPMENT.SECOND_WEAPON:
      return "weapon";
    case EQUIPMENT.NECKLACE:
    case EQUIPMENT.EARRING:
    case EQUIPMENT.RING1:
    case EQUIPMENT.RING2:
      return "accessory";
    default:
      return "armor";
  }
};

const positionToGrade = (position: number) => {
  const index = position - 1;
  return {
    grade: Math.min(Math.floor(index / LEVELS_PER_GRADE), PARADOX_GRADES.length - 1),
    level:
      index >= (PARADOX_GRADES.length - 1) * LEVELS_PER_GRADE
        ? index - (PARADOX_GRADES.length - 1) * LEVELS_PER_GRADE
        : index % LEVELS_PER_GRADE,
  };
};

export const getParadoxPositionLabel = (position: number) => {
  if (position <= 0) {
    return "Buy";
  }
  const { grade, level } = positionToGrade(position);
  return `${PARADOX_GRADES[grade]} +${level}`;
};

// ---------------------------------------------------------------------------
// Calculator rows
// ---------------------------------------------------------------------------

const row = (
  key: string,
  equipment: EQUIPMENT
): CommonEquipmentCalculator => ({
  key,
  equipment,
  min: 0,
  max: PARADOX_MAX_POSITION[getParadoxCategory(equipment)],
  from: 0,
  to: 1,
});

export const dataParadoxCalculator: CommonEquipmentCalculator[] = [
  row("1", EQUIPMENT.HELM),
  row("2", EQUIPMENT.UPPER),
  row("3", EQUIPMENT.LOWER),
  row("4", EQUIPMENT.GLOVE),
  row("5", EQUIPMENT.SHOES),
  row("6", EQUIPMENT.MAIN_WEAPON),
  row("7", EQUIPMENT.SECOND_WEAPON),
  row("8", EQUIPMENT.NECKLACE),
  row("9", EQUIPMENT.EARRING),
  row("10", EQUIPMENT.RING1),
  row("11", EQUIPMENT.RING2),
];

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

export interface ParadoxEnhanceMaterial {
  // The step taken, e.g. "Buy Normal", "Normal +3", "Evolve to Magic".
  encLevel: string;
  rarity: string;
  paradoxFragment: number;
  paradoxStone: number;
}

interface ParadoxCostTable {
  buyFragment: number;
  // [grade][level-1] for +1..+10, Normal..Epic (+ Unique for accessories).
  enhance: { fragment: number; stone: number[] }[];
  // Upgrade Chip price in Paradox Stones, to Magic/Rare/Epic/Unique.
  evolveStone: number[];
}

// Stone surcharge per level +1..+10; only Epic (and Unique accessories) have one.
const NO_STONE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const PARADOX_COST: Record<ParadoxCategory, ParadoxCostTable> = {
  armor: {
    buyFragment: 3,
    enhance: [
      { fragment: 2, stone: NO_STONE },
      { fragment: 6, stone: NO_STONE },
      { fragment: 12, stone: NO_STONE },
      { fragment: 15, stone: [0, 0, 0, 0, 1, 1, 1, 2, 2, 4] },
    ],
    evolveStone: [2, 4, 40, 50],
  },
  weapon: {
    buyFragment: 10,
    enhance: [
      { fragment: 5, stone: NO_STONE },
      { fragment: 15, stone: NO_STONE },
      { fragment: 30, stone: NO_STONE },
      { fragment: 40, stone: [0, 0, 0, 0, 2, 2, 2, 4, 4, 8] },
    ],
    evolveStone: [4, 12, 60, 75],
  },
  accessory: {
    buyFragment: 5,
    enhance: [
      { fragment: 4, stone: NO_STONE },
      { fragment: 7, stone: NO_STONE },
      { fragment: 15, stone: NO_STONE },
      { fragment: 30, stone: [0, 0, 0, 0, 2, 2, 2, 4, 4, 8] },
      // Unique accessories stop at +5.
      { fragment: 50, stone: [0, 0, 0, 0, 2] },
    ],
    evolveStone: [3, 9, 20, 100],
  },
};

// step[i] is the cost of moving from position i to position i + 1, so a
// From/To range slices it directly (same as every other equipment table).
const buildSteps = (category: ParadoxCategory): ParadoxEnhanceMaterial[] => {
  const cost = PARADOX_COST[category];
  const steps: ParadoxEnhanceMaterial[] = [
    {
      encLevel: `Buy ${PARADOX_GRADES[0]}`,
      rarity: PARADOX_GRADES[0],
      paradoxFragment: cost.buyFragment,
      paradoxStone: 0,
    },
  ];
  cost.enhance.forEach((grade, gradeIdx) => {
    if (gradeIdx > 0) {
      steps.push({
        encLevel: `Evolve to ${PARADOX_GRADES[gradeIdx]}`,
        rarity: PARADOX_GRADES[gradeIdx],
        paradoxFragment: 0,
        paradoxStone: cost.evolveStone[gradeIdx - 1],
      });
    }
    grade.stone.forEach((stone, levelIdx) => {
      steps.push({
        encLevel: `${PARADOX_GRADES[gradeIdx]} +${levelIdx + 1}`,
        rarity: PARADOX_GRADES[gradeIdx],
        paradoxFragment: grade.fragment,
        paradoxStone: stone,
      });
    });
  });
  // Armor/weapon: Unique can't be enhanced, but can still be evolved into.
  if (cost.enhance.length < PARADOX_GRADES.length) {
    steps.push({
      encLevel: `Evolve to ${PARADOX_GRADES[PARADOX_GRADES.length - 1]}`,
      rarity: PARADOX_GRADES[PARADOX_GRADES.length - 1],
      paradoxFragment: 0,
      paradoxStone: cost.evolveStone[cost.evolveStone.length - 1],
    });
  }
  return steps;
};

export const ParadoxArmorMaterialTable = buildSteps("armor");
export const ParadoxWeaponMaterialTable = buildSteps("weapon");
export const ParadoxAccessoryMaterialTable = buildSteps("accessory");

export const getParadoxMaterialTable = (
  equipment: EQUIPMENT
): ParadoxEnhanceMaterial[] => {
  switch (getParadoxCategory(equipment)) {
    case "weapon":
      return ParadoxWeaponMaterialTable;
    case "accessory":
      return ParadoxAccessoryMaterialTable;
    default:
      return ParadoxArmorMaterialTable;
  }
};

// ---------------------------------------------------------------------------
// Stats — the patch note only lists each grade's base (+0) stats, so the
// tables have one row per grade, encLevel = grade name.
// ---------------------------------------------------------------------------

export const ParadoxHelmStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 1365000, phyMagAtkMax: 1950000, crt: -50000, attAtkPercent: 39.5, hp: 4500000, hpPercent: 9, phyMagAtkPercent: 5, def: 11000, magdef: 11000 },
  { encLevel: "Magic", phyMagAtkMin: 2625000, phyMagAtkMax: 3750000, crt: -50000, attAtkPercent: 49, hp: 11350000, hpPercent: 13.5, phyMagAtkPercent: 5, def: 15000, magdef: 15000 },
  { encLevel: "Rare", phyMagAtkMin: 2765000, phyMagAtkMax: 3950000, crt: -50000, attAtkPercent: 50, hp: 16450000, hpPercent: 16, phyMagAtkPercent: 5, def: 18500, magdef: 18500 },
  { encLevel: "Epic", phyMagAtkMin: 2870000, phyMagAtkMax: 4100000, crt: -50000, attAtkPercent: 53, hp: 23800000, hpPercent: 16, phyMagAtkPercent: 15, def: 52000, magdef: 52000 },
  { encLevel: "Unique", phyMagAtkMin: 3150000, phyMagAtkMax: 4500000, crt: -50000, attAtkPercent: 55, hp: 46000000, hpPercent: 20, phyMagAtkPercent: 15, def: 57500, magdef: 57500 },
];

export const ParadoxUpperStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 1575000, phyMagAtkMax: 2250000, crt: -50000, attAtkPercent: 8, hp: 5650000, hpPercent: 11, phyMagAtkPercent: 5, def: 15000, magdef: 15000, fd: 2600 },
  { encLevel: "Magic", phyMagAtkMin: 2975000, phyMagAtkMax: 4250000, crt: -50000, attAtkPercent: 8, hp: 14150000, hpPercent: 17, phyMagAtkPercent: 5, def: 19500, magdef: 19500, fd: 3600 },
  { encLevel: "Rare", phyMagAtkMin: 3045000, phyMagAtkMax: 4350000, crt: -50000, attAtkPercent: 8, hp: 20500000, hpPercent: 20, phyMagAtkPercent: 5, def: 23500, magdef: 23500, fd: 4100 },
  { encLevel: "Epic", phyMagAtkMin: 3115000, phyMagAtkMax: 4450000, crt: -50000, attAtkPercent: 11, hp: 29600000, hpPercent: 20, phyMagAtkPercent: 15, def: 58000, magdef: 58000, fd: 4100 },
  { encLevel: "Unique", phyMagAtkMin: 3360000, phyMagAtkMax: 4800000, crt: -50000, attAtkPercent: 11, hp: 57350000, hpPercent: 25, phyMagAtkPercent: 15, def: 65000, magdef: 65000, fd: 4600 },
];

export const ParadoxLowerStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 1505000, phyMagAtkMax: 2150000, crt: -50000, attAtkPercent: 8, hp: 5400000, hpPercent: 10, phyMagAtkPercent: 5, def: 14000, magdef: 14000, cdm: 1000000 },
  { encLevel: "Magic", phyMagAtkMin: 2870000, phyMagAtkMax: 4100000, crt: -50000, attAtkPercent: 8, hp: 13500000, hpPercent: 16, phyMagAtkPercent: 5, def: 18500, magdef: 18500, cdm: 1200000 },
  { encLevel: "Rare", phyMagAtkMin: 2940000, phyMagAtkMax: 4200000, crt: -50000, attAtkPercent: 8, hp: 19700000, hpPercent: 19, phyMagAtkPercent: 5, def: 22500, magdef: 22500, cdm: 1400000 },
  { encLevel: "Epic", phyMagAtkMin: 3010000, phyMagAtkMax: 4300000, crt: -50000, attAtkPercent: 11, hp: 28450000, hpPercent: 19, phyMagAtkPercent: 15, def: 57000, magdef: 57000, cdm: 1600000 },
  { encLevel: "Unique", phyMagAtkMin: 3220000, phyMagAtkMax: 4600000, crt: -50000, attAtkPercent: 11, hp: 55100000, hpPercent: 23, phyMagAtkPercent: 15, def: 63000, magdef: 63000, cdm: 1800000 },
];

export const ParadoxGlovesStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 1295000, phyMagAtkMax: 1850000, crt: -50000, attAtkPercent: 8, hp: 4080000, hpPercent: 8, phyMagAtkPercent: 5, def: 90000, magdef: 10500 },
  { encLevel: "Magic", phyMagAtkMin: 2520000, phyMagAtkMax: 3600000, crt: -50000, attAtkPercent: 8, hp: 10200000, hpPercent: 12, phyMagAtkPercent: 5, def: 120000, magdef: 13500 },
  { encLevel: "Rare", phyMagAtkMin: 2590000, phyMagAtkMax: 3700000, crt: -50000, attAtkPercent: 8, hp: 14800000, hpPercent: 14.5, phyMagAtkPercent: 5, def: 145000, magdef: 16500 },
  { encLevel: "Epic", phyMagAtkMin: 2660000, phyMagAtkMax: 3800000, crt: -50000, attAtkPercent: 11, hp: 21500000, hpPercent: 14.5, phyMagAtkPercent: 15, def: 200000, magdef: 50000 },
  { encLevel: "Unique", phyMagAtkMin: 2870000, phyMagAtkMax: 4100000, crt: -50000, attAtkPercent: 11, hp: 41550000, hpPercent: 18, phyMagAtkPercent: 15, def: 245000, magdef: 55000 },
];

export const ParadoxShoesStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 1295000, phyMagAtkMax: 1850000, crt: -50000, attAtkPercent: 8, hp: 4080000, hpPercent: 8, phyMagAtkPercent: 5, def: 10500, magdef: 90000, moveSpeedPercent: 3.5 },
  { encLevel: "Magic", phyMagAtkMin: 2520000, phyMagAtkMax: 3600000, crt: -50000, attAtkPercent: 8, hp: 10200000, hpPercent: 12, phyMagAtkPercent: 5, def: 13500, magdef: 120000, moveSpeedPercent: 3.5 },
  { encLevel: "Rare", phyMagAtkMin: 2590000, phyMagAtkMax: 3700000, crt: -50000, attAtkPercent: 8, hp: 14800000, hpPercent: 14.5, phyMagAtkPercent: 5, def: 16500, magdef: 145000, moveSpeedPercent: 3.5 },
  { encLevel: "Epic", phyMagAtkMin: 2660000, phyMagAtkMax: 3800000, crt: -50000, attAtkPercent: 11, hp: 21500000, hpPercent: 14.5, phyMagAtkPercent: 15, def: 50000, magdef: 200000, moveSpeedPercent: 3.5 },
  { encLevel: "Unique", phyMagAtkMin: 2870000, phyMagAtkMax: 4100000, crt: -50000, attAtkPercent: 11, hp: 41550000, hpPercent: 18, phyMagAtkPercent: 15, def: 55000, magdef: 245000, moveSpeedPercent: 3.5 },
];

export const ParadoxMainStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 945000, phyMagAtkMax: 1350000, phyMagAtkPercent: 5, crt: 50000, cdm: 112500, fd: 600 },
  { encLevel: "Magic", phyMagAtkMin: 3745000, phyMagAtkMax: 5350000, phyMagAtkPercent: 15, crt: 50000, cdm: 450000, fd: 600 },
  { encLevel: "Rare", phyMagAtkMin: 5054000, phyMagAtkMax: 7220000, phyMagAtkPercent: 18, crt: 60000, cdm: 540000, fd: 700 },
  { encLevel: "Epic", phyMagAtkMin: 6405000, phyMagAtkMax: 9150000, phyMagAtkPercent: 18, crt: 260000, cdm: 1400000, fd: 700, attAtkPercent: 10 },
  { encLevel: "Unique", phyMagAtkMin: 9625000, phyMagAtkMax: 13750000, phyMagAtkPercent: 21, crt: 270000, cdm: 1500000, fd: 800, attAtkPercent: 10 },
];

export const ParadoxSecondStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtkMin: 910000, phyMagAtkMax: 1300000, phyMagAtkPercent: 5, crt: 50000, cdm: 112500, fd: 600 },
  { encLevel: "Magic", phyMagAtkMin: 3710000, phyMagAtkMax: 5300000, phyMagAtkPercent: 15, crt: 50000, cdm: 450000, fd: 600 },
  { encLevel: "Rare", phyMagAtkMin: 4991000, phyMagAtkMax: 7130000, phyMagAtkPercent: 18, crt: 60000, cdm: 540000, fd: 700 },
  { encLevel: "Epic", phyMagAtkMin: 6300000, phyMagAtkMax: 9000000, phyMagAtkPercent: 18, crt: 260000, cdm: 1400000, fd: 700, attAtkPercent: 10 },
  { encLevel: "Unique", phyMagAtkMin: 9485000, phyMagAtkMax: 13550000, phyMagAtkPercent: 21, crt: 270000, cdm: 1500000, fd: 800, attAtkPercent: 10 },
];

export const ParadoxNecklaceStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtk: 450000, phyMagAtkPercent: 5, attAtkPercent: 17, fd: 1300 },
  { encLevel: "Magic", phyMagAtk: 450000, phyMagAtkPercent: 10, attAtkPercent: 17, fd: 1300 },
  { encLevel: "Rare", phyMagAtk: 450000, phyMagAtkPercent: 20, attAtkPercent: 17, fd: 1300 },
  { encLevel: "Epic", phyMagAtk: 500000, phyMagAtkPercent: 25, attAtkPercent: 25, fd: 1300, str: 10000, agi: 10000, int: 10000 },
  { encLevel: "Unique", phyMagAtk: 970000, phyMagAtkPercent: 36.5, attAtkPercent: 29.5, fd: 1400, str: 10000, agi: 10000, int: 10000 },
];

export const ParadoxEarringStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtk: 400000, phyMagAtkPercent: 13, attAtkPercent: 8, crt: -50000 },
  { encLevel: "Magic", phyMagAtk: 400000, phyMagAtkPercent: 18, attAtkPercent: 8, crt: -50000 },
  { encLevel: "Rare", phyMagAtk: 400000, phyMagAtkPercent: 28, attAtkPercent: 8, crt: -50000 },
  { encLevel: "Epic", phyMagAtk: 450000, phyMagAtkPercent: 46, fd: 1000, crt: 10000, cdm: 150000, str: 10000, agi: 10000, int: 10000 },
  { encLevel: "Unique", phyMagAtk: 870000, phyMagAtkPercent: 60, fd: 1400, crt: 24500, cdm: 150000, str: 10000, agi: 10000, int: 10000 },
];

export const ParadoxRingStats: CommonItemStats[] = [
  { encLevel: "Normal", phyMagAtk: 350000, phyMagAtkPercent: 10, fd: 1000, def: 30000, magdef: 30000 },
  { encLevel: "Magic", phyMagAtk: 350000, phyMagAtkPercent: 15, fd: 1000, def: 30000, magdef: 30000 },
  { encLevel: "Rare", phyMagAtk: 350000, phyMagAtkPercent: 25, fd: 1000, def: 30000, magdef: 30000 },
  { encLevel: "Epic", phyMagAtk: 400000, phyMagAtkPercent: 24, attAtkPercent: 22 },
  { encLevel: "Unique", phyMagAtk: 800000, phyMagAtkPercent: 36, attAtkPercent: 32.5 },
];

export const getParadoxGradeStats = (equipment: EQUIPMENT): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.HELM:
      return ParadoxHelmStats;
    case EQUIPMENT.UPPER:
      return ParadoxUpperStats;
    case EQUIPMENT.LOWER:
      return ParadoxLowerStats;
    case EQUIPMENT.GLOVE:
      return ParadoxGlovesStats;
    case EQUIPMENT.SHOES:
      return ParadoxShoesStats;
    case EQUIPMENT.MAIN_WEAPON:
      return ParadoxMainStats;
    case EQUIPMENT.SECOND_WEAPON:
      return ParadoxSecondStats;
    case EQUIPMENT.NECKLACE:
      return ParadoxNecklaceStats;
    case EQUIPMENT.EARRING:
      return ParadoxEarringStats;
    case EQUIPMENT.RING1:
    case EQUIPMENT.RING2:
      return ParadoxRingStats;
    default:
      return [];
  }
};

// One row per calculator position (see the header comment), so the shared
// From/To stat diff can index it directly. Every level of a grade carries that
// grade's base stats; position 0 (Buy) has none, so diffing from Buy shows
// the item's full stats.
const buildPositionStats = (equipment: EQUIPMENT): CommonItemStats[] => {
  const grades = getParadoxGradeStats(equipment);
  const max = PARADOX_MAX_POSITION[getParadoxCategory(equipment)];
  return Array.from({ length: max + 1 }, (_, position) =>
    position === 0
      ? { encLevel: "Buy" }
      : {
          ...grades[positionToGrade(position).grade],
          encLevel: getParadoxPositionLabel(position),
        }
  );
};

const POSITION_STATS = new Map<EQUIPMENT, CommonItemStats[]>(
  dataParadoxCalculator.map(({ equipment }) => [
    equipment,
    buildPositionStats(equipment),
  ])
);

export const getParadoxPositionStats = (equipment: EQUIPMENT) =>
  POSITION_STATS.get(equipment) ?? [];

// ---------------------------------------------------------------------------
// Skill add-on stats (fixed per grade/part, rerollable with Purple Energy)
// ---------------------------------------------------------------------------

export interface ParadoxSkillAddOn {
  grade: string;
  armor: string;
  weapon: string;
}

export const ParadoxSkillAddOnTable: ParadoxSkillAddOn[] = [
  { grade: "Normal", armor: "-", weapon: "-" },
  { grade: "Magic", armor: "1 Rune Skill 40%", weapon: "1 Skill Jade skill 50%" },
  { grade: "Rare", armor: "1 Rune Skill 80%", weapon: "1 Skill Jade skill 100%" },
  {
    grade: "Epic",
    armor: "1 Rune Skill 120% + 1 Rune Skill 80%",
    weapon: "1 Skill Jade skill 150% + 1 Skill Jade skill 100%",
  },
  {
    grade: "Unique",
    armor: "1 Rune Skill 120% + 1 Rune Skill 120% + 1 Rune Skill 80%",
    weapon:
      "1 Skill Jade skill 200% + 1 Skill Jade skill 150% + 1 Skill Jade skill 100%",
  },
];
