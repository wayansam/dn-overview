import { LUNAR_FRAGMENT_TYPE_COLOR } from "../constants/InGame.color.constants";
import {
  EQUIPMENT,
  ITEM_RARITY,
  LUNAR_FRAGMENT_TYPE,
  LUNAR_JADE_TYPE,
  RUNE_GRADE,
  RUNE_SHAPE,
  RUNE_STAT_TYPE,
  SKILL_JADE,
} from "../constants/InGame.constants";

export interface SkillJade {
  name: SKILL_JADE;
  level: number;
}

export interface RuneStat {
  runeType: RUNE_STAT_TYPE;
  runeValue: number;
  runeDesc: string;
  isDefault: boolean;
}

export interface Rune {
  shape: RUNE_SHAPE;
  rarity: RUNE_GRADE;
  runeStat: RuneStat[];
}

export interface LunarJadeCraftAmount {
  rarity: ITEM_RARITY;
  quantity: number;
  quantityHg: number;
  stigmata: number;
  gold: number;
  tigerIntactOrb: number;
  concentratedDimensionalEnergy: number;
}

export interface TigerIntactOrbCraftMats {
  tigerIntactOrb: number;
  gold: number;
}
export interface ConcentratedDimensionalEnergyCraftMats {
  tigerIntactOrb: number;
  dimensionalEnergy: number;
  gold: number;
}

export interface LunarFragmentData {
  type: LUNAR_FRAGMENT_TYPE;
  color: LUNAR_FRAGMENT_TYPE_COLOR;
}

export interface LunarFragment {
  holy: LunarFragmentData;
  crystal: LunarFragmentData;
  burning: LunarFragmentData;
  pitch: LunarFragmentData;
  tailwind: LunarFragmentData;
  ardent: LunarFragmentData;
}
export interface LunarJadeCraftMaterial {
  equipmentType: EQUIPMENT;
  lunarFragment: Array<LunarFragmentData>;
}
export interface LunarJadeEnhanceMaterial {
  jadeType: LUNAR_JADE_TYPE;
  lunarFragment: Array<LunarFragmentData>;
}

export interface AncientArmorCraftMaterial {
  encLevel: number;
  eqTypeFragment: number;
  ancKnowledge: number;
  ancInsignia: number;
  gold: number;
}

export interface SkillJadeEnhanceMaterial {
  encLevel: number;
  lowerFragment: number;
  higherFragment: number;
  gold: number;
}

export interface ErosionConquerorJadeMaterial {
  encLevel: number;
  erosionFragment: number;
  goldLotusCrown: number;
  gold: number;
}
export interface NamedEODMaterial {
  encLevel: number;
  guideStar: number;
  twilightEssence: number;
  gold: number;
}

export interface KilosArmorCraftMaterial {
  encLevel: number;
  eqTypeFragment: number;
  joySorrow: number;
  joySorrowHG: number;
  threadIntelect: number;
  gold: number;
}

export interface AncientGoddesHeraRequiredItem {
  encLevel: number;
  ab: number;
  abFrag: number;
}
export interface AncientGoddesHeraDisassemblyItem {
  encLevel: number;
  abFrag: number;
}

export interface BlackDragonTalismanCraftMaterial {
  rarity: ITEM_RARITY;
  bdMemories: number;
  fragment: number;
  garnet: number;
  essence: number;
  gold: number;
  craftable: boolean;
}

export interface EternalWorldTalismanMats {
  encLevel: number;
  apparition: number;
  gold: number;
}
export interface EternalPainTalismanMats {
  encLevel: number;
  apparition: number;
  vortex: number;
  gold: number;
}

export interface LunarJadeEnhancementMats {
  encLevel: number;
  stigmata: number;
  crystal: number;
  gold: number;
  hgFragment: number;
}
