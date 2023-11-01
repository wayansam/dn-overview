import { LUNAR_FRAGMENT_TYPE_COLOR } from "../constants/InGame.color.constants";
import {
  EQUIPMENT,
  LUNAR_FRAGMENT_TYPE,
  LUNAR_JADE_RARITY,
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
  rarity: LUNAR_JADE_RARITY;
  quantity: number;
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

export interface AncientArmorCraftMaterial {
  encLevel: number;
  eqTypeFragment: number;
  ancKnowledge: number;
  ancInsignia: number;
  gold: number;
}
