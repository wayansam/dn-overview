import { EQUIPMENT } from "../constants/InGame.constants";
import { CommonEquipmentCalculator } from "../interface/Common.interface";
import { SpunGoldEqEnhanceMaterial } from "../interface/Item.interface";
import { CommonItemStats } from "../interface/ItemStat.interface";

export const dataGoldSpunCalculator: CommonEquipmentCalculator[] = [
  {
    key: "1",
    equipment: EQUIPMENT.HELM,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "2",
    equipment: EQUIPMENT.UPPER,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "3",
    equipment: EQUIPMENT.LOWER,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "4",
    equipment: EQUIPMENT.GLOVE,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "5",
    equipment: EQUIPMENT.SHOES,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "6",
    equipment: EQUIPMENT.MAIN_WEAPON,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
  {
    key: "7",
    equipment: EQUIPMENT.SECOND_WEAPON,
    min: 0,
    max: 10,
    from: 0,
    to: 1,
  },
];

export const SpunGoldEqEnhanceMaterialArmorTable: SpunGoldEqEnhanceMaterial[] =
  [];
export const SpunGoldEqEnhanceMaterialWeapTable: SpunGoldEqEnhanceMaterial[] =
  [];
export const SpunGoldStatsMainTable: CommonItemStats[] = [];
export const SpunGoldStatsSecondTable: CommonItemStats[] = [];
export const SpunGoldStatsHelmTable: CommonItemStats[] = [];
export const SpunGoldStatsUpperTable: CommonItemStats[] = [];
export const SpunGoldStatsLowerTable: CommonItemStats[] = [];
export const SpunGoldStatsGlovesTable: CommonItemStats[] = [];
export const SpunGoldStatsShoesTable: CommonItemStats[] = [];
