import { TAB_KEY } from "../constants/Common.constants";
import { EQUIPMENT } from "../constants/InGame.constants";
import {
  conversionDecalStats,
  conversionEarringStats,
  conversionGloveStats,
  conversionHelmStats,
  conversionLowerStats,
  conversionMainStats,
  conversionNecklaceStats,
  conversionRingStats,
  conversionSecondStats,
  conversionShoesStats,
  conversionTailStats,
  conversionUpperStats,
  conversionWingStats,
} from "../data/ConversionCalculatorData";
import { IonaEarringEnhancementStatsTable, IonaNecklaceEnhancementStatsTable, IonaRingEnhancementStatsTable } from "../data/VIPAccData";
import {
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
} from "../data/BoneDragonEqData";
import {
  SpunGoldStatsGlovesTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsShoesTable,
  SpunGoldStatsUpperTable,
} from "../data/SpunGoldEqData";
import {
  NamedEODMainStatTable,
  NamedEODSecondStatTable,
} from "../data/NamedEODData";
import { CommonItemStats } from "../interface/ItemStat.interface";

export const getConveRscTable = (equipment: EQUIPMENT): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.HELM:
      return conversionHelmStats;
    case EQUIPMENT.UPPER:
      return conversionUpperStats;
    case EQUIPMENT.LOWER:
      return conversionLowerStats;
    case EQUIPMENT.GLOVE:
      return conversionGloveStats;
    case EQUIPMENT.SHOES:
      return conversionShoesStats;

    case EQUIPMENT.MAIN_WEAPON:
      return conversionMainStats;
    case EQUIPMENT.SECOND_WEAPON:
      return conversionSecondStats;

    case EQUIPMENT.NECKLACE:
      return conversionNecklaceStats;
    case EQUIPMENT.EARRING:
      return conversionEarringStats;
    case EQUIPMENT.RING1:
    case EQUIPMENT.RING2:
      return conversionRingStats;

    case EQUIPMENT.WING:
      return conversionWingStats;
    case EQUIPMENT.TAIL:
      return conversionTailStats;
    case EQUIPMENT.DECAL:
      return conversionDecalStats;

    default:
      return [];
  }
};

export const getIonaRscTable = (equipment: EQUIPMENT): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.RING1:
    case EQUIPMENT.RING2:
      return IonaRingEnhancementStatsTable;

    case EQUIPMENT.EARRING:
      return IonaEarringEnhancementStatsTable;

    case EQUIPMENT.NECKLACE:
      return IonaNecklaceEnhancementStatsTable;

    default:
      return [];
  }
};

export const getBoneDragonRscTable = (
  equipment: EQUIPMENT
): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.HELM:
      return BoneDragonStatsHelmTable;
    case EQUIPMENT.UPPER:
      return BoneDragonStatsUpperTable;
    case EQUIPMENT.LOWER:
      return BoneDragonStatsLowerTable;
    case EQUIPMENT.GLOVE:
      return BoneDragonStatsGlovesTable;
    case EQUIPMENT.SHOES:
      return BoneDragonStatsShoesTable;
    case EQUIPMENT.MAIN_WEAPON:
      return BoneDragonStatsMainTable;
    case EQUIPMENT.SECOND_WEAPON:
      return BoneDragonStatsSecondTable;

    default:
      return [];
  }
};

export const getSpunGoldRscTable = (
  equipment: EQUIPMENT
): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.HELM:
      return SpunGoldStatsHelmTable;
    case EQUIPMENT.UPPER:
      return SpunGoldStatsUpperTable;
    case EQUIPMENT.LOWER:
      return SpunGoldStatsLowerTable;
    case EQUIPMENT.GLOVE:
      return SpunGoldStatsGlovesTable;
    case EQUIPMENT.SHOES:
      return SpunGoldStatsShoesTable;
    case EQUIPMENT.MAIN_WEAPON:
      return SpunGoldStatsMainTable;
    case EQUIPMENT.SECOND_WEAPON:
      return SpunGoldStatsSecondTable;

    default:
      return [];
  }
};

export const getNamedEODRscTable = (
  equipment: EQUIPMENT
): CommonItemStats[] => {
  switch (equipment) {
    case EQUIPMENT.MAIN_WEAPON:
      return NamedEODMainStatTable;
    case EQUIPMENT.SECOND_WEAPON:
      return NamedEODSecondStatTable;

    default:
      return [];
  }
};

export const getResource = (menu: string, equipment: EQUIPMENT) => {
  switch (menu) {
    case TAB_KEY.miscConversion:
      return getConveRscTable(equipment);

    case TAB_KEY.eqVIPAcc:
      return getIonaRscTable(equipment);

    case TAB_KEY.eqBoneDragon:
      return getBoneDragonRscTable(equipment);

    case TAB_KEY.eqSpunGold:
      return getSpunGoldRscTable(equipment);

    case TAB_KEY.eqNamedEOD:
      return getNamedEODRscTable(equipment);

    default:
      return [];
  }
};
