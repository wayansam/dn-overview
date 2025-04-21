import { EQUIPMENT } from "../constants/InGame.constants";
import { BoneCalculator } from "../interface/Common.interface";
import { BoneDragonEqEnhanceMaterial } from "../interface/Item.interface";
import { BoneDragonStats } from "../interface/ItemStat.interface";

export const dataBoneCalculator: BoneCalculator[] = [
  {
    key: "1",
    equipment: EQUIPMENT.HELM,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "2",
    equipment: EQUIPMENT.UPPER,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "3",
    equipment: EQUIPMENT.LOWER,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "4",
    equipment: EQUIPMENT.GLOVE,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "5",
    equipment: EQUIPMENT.SHOES,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "6",
    equipment: EQUIPMENT.MAIN_WEAPON,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
  {
    key: "7",
    equipment: EQUIPMENT.SECOND_WEAPON,
    min: 0,
    max: 20,
    from: 0,
    to: 1,
  },
];

export const BoneDragonEqEnhanceMaterialArmorTable: BoneDragonEqEnhanceMaterial[] =
  [];
export const BoneDragonEqEnhanceMaterialWeapTable: BoneDragonEqEnhanceMaterial[] =
  [];

export const BoneDragonStatsMainTable: BoneDragonStats[] = [];
export const BoneDragonStatsSecondTable: BoneDragonStats[] = [];
export const BoneDragonStatsHelmTable: BoneDragonStats[] = [];
export const BoneDragonStatsUpperTable: BoneDragonStats[] = [];
export const BoneDragonStatsLowerTable: BoneDragonStats[] = [];
export const BoneDragonStatsGlovesTable: BoneDragonStats[] = [];
export const BoneDragonStatsShoesTable: BoneDragonStats[] = [];
