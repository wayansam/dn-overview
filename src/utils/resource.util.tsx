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

export const getResource = (menu: string, equipment: EQUIPMENT) => {
  switch (menu) {
    case TAB_KEY.miscConversion:
      return getConveRscTable(equipment);
    
    case TAB_KEY.eqVIPAcc:
      return getIonaRscTable(equipment);

    default:
      return [];
  }
};
