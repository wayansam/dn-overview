import { LUNAR_JADE_RARITY, RUNE_GRADE, RUNE_SHAPE, RUNE_STAT_TYPE, SKILL_JADE } from "../constants/InGame.constants";

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