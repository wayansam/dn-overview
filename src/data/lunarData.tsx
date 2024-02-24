import { LUNAR_FRAGMENT_TYPE_COLOR } from "../constants/InGame.color.constants";
import {
  EQUIPMENT,
  LUNAR_FRAGMENT_TYPE,
  LUNAR_JADE_RARITY,
} from "../constants/InGame.constants";
import {
  ConcentratedDimensionalEnergyCraftMats,
  LunarFragment,
  LunarJadeCraftAmount,
  LunarJadeCraftMaterial,
  TigerIntactOrbCraftMats,
} from "../interface/Item.interface";

export const tigerIntactOrbCraftMats: TigerIntactOrbCraftMats = {
  tigerIntactOrb: 10,
  gold: 10000,
};

export const concentratedDimensionalEnergyCraftMats: ConcentratedDimensionalEnergyCraftMats =
  {
    tigerIntactOrb: 10,
    dimensionalEnergy: 10,
    gold: 10000,
  };

export const LunarJadeCraftAmountTable: LunarJadeCraftAmount[] = [
  {
    rarity: LUNAR_JADE_RARITY.CRAFT,
    quantity: 0,
    quantityHg: 0,
    stigmata: 0,
    gold: 0,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.NORMAL,
    quantity: 100,
    quantityHg: 0,
    stigmata: 0,
    gold: 100,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.MAGIC,
    quantity: 300,
    quantityHg: 0,
    stigmata: 0,
    gold: 1000,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.RARE,
    quantity: 0,
    quantityHg: 15,
    stigmata: 4,
    gold: 1000,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.EPIC,
    quantity: 0,
    quantityHg: 63,
    stigmata: 16,
    gold: 3000,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.UNIQUE,
    quantity: 0,
    quantityHg: 255,
    stigmata: 64,
    gold: 5000,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.LEGEND,
    quantity: 0,
    quantityHg: 1023,
    stigmata: 256,
    gold: 10000,
    tigerIntactOrb: 1,
    concentratedDimensionalEnergy: 0,
  },
  {
    rarity: LUNAR_JADE_RARITY.ANCIENT,
    quantity: 0,
    quantityHg: 4095,
    stigmata: 1024,
    gold: 10000,
    tigerIntactOrb: 0,
    concentratedDimensionalEnergy: 1,
  },
];

export const LunarFragmentList: LunarFragment = {
  holy: {
    type: LUNAR_FRAGMENT_TYPE.HOLY,
    color: LUNAR_FRAGMENT_TYPE_COLOR.HOLY,
  },
  crystal: {
    type: LUNAR_FRAGMENT_TYPE.CRYSTAL,
    color: LUNAR_FRAGMENT_TYPE_COLOR.CRYSTAL,
  },
  burning: {
    type: LUNAR_FRAGMENT_TYPE.BURNING,
    color: LUNAR_FRAGMENT_TYPE_COLOR.BURNING,
  },
  pitch: {
    type: LUNAR_FRAGMENT_TYPE.PITCH,
    color: LUNAR_FRAGMENT_TYPE_COLOR.PITCH,
  },
  tailwind: {
    type: LUNAR_FRAGMENT_TYPE.TAILWIND,
    color: LUNAR_FRAGMENT_TYPE_COLOR.TAILWIND,
  },
  ardent: {
    type: LUNAR_FRAGMENT_TYPE.ARDENT,
    color: LUNAR_FRAGMENT_TYPE_COLOR.ARDENT,
  },
};

export const LunarJadeCraftMaterialList: LunarJadeCraftMaterial[] = [
  {
    equipmentType: EQUIPMENT.HELM,
    lunarFragment: [LunarFragmentList.holy, LunarFragmentList.crystal],
  },
  {
    equipmentType: EQUIPMENT.UPPER,
    lunarFragment: [LunarFragmentList.crystal, LunarFragmentList.burning],
  },
  {
    equipmentType: EQUIPMENT.LOWER,
    lunarFragment: [LunarFragmentList.burning, LunarFragmentList.pitch],
  },
  {
    equipmentType: EQUIPMENT.GLOVE,
    lunarFragment: [LunarFragmentList.pitch, LunarFragmentList.tailwind],
  },
  {
    equipmentType: EQUIPMENT.SHOES,
    lunarFragment: [LunarFragmentList.tailwind, LunarFragmentList.ardent],
  },
  {
    equipmentType: EQUIPMENT.MAIN_WEAPON,
    lunarFragment: [
      LunarFragmentList.holy,
      LunarFragmentList.crystal,
      LunarFragmentList.ardent,
    ],
  },
  {
    equipmentType: EQUIPMENT.SECOND_WEAPON,
    lunarFragment: [
      LunarFragmentList.holy,
      LunarFragmentList.crystal,
      LunarFragmentList.pitch,
    ],
  },
  {
    equipmentType: EQUIPMENT.NECKLACE,
    lunarFragment: [LunarFragmentList.holy, LunarFragmentList.ardent],
  },
  {
    equipmentType: EQUIPMENT.EARRING,
    lunarFragment: [LunarFragmentList.burning, LunarFragmentList.tailwind],
  },
  {
    equipmentType: EQUIPMENT.RING,
    lunarFragment: [LunarFragmentList.holy, LunarFragmentList.pitch],
  },
];
