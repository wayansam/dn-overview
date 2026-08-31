import { ITEM_RARITY } from "../constants/InGame.constants";

export interface CommonItemStats {
  encLevel: string;
  phyMagAtk?: number;
  phyMagAtkMin?: number;
  phyMagAtkMax?: number;
  phyMagAtkPercent?: number;
  attAtkPercent?: number;

  crt?: number;
  crtPercent?: number;
  cdm?: number;
  fd?: number;

  str?: number;
  agi?: number;
  int?: number;
  vit?: number;
  strPercent?: number;
  agiPercent?: number;
  intPercent?: number;
  vitPercent?: number;

  def?: number;
  magdef?: number;
  defPercent?: number;
  magdefPercent?: number;

  hp?: number;
  hpPercent?: number;
  moveSpeedPercent?: number;
  moveSpeedPercentTown?: number; //(?)
}

export type columnCommonItemFlag = {
  [K in keyof CommonItemStats as `${K}Flag`]?: boolean;
};
export type columnCommonItemDesc = {
  [K in keyof CommonItemStats as `${K}Desc`]?: {
    long: string;
    short: string;
  };
};
export interface SkillJadeStat {
  encLevel: number;
  attackPercent: number;
  cooldownPercent: number;
  successRate: number;
}

export interface AncientGoddesHeraStat {
  encLevel: number;
  attackPercent: number;
}

// Black Dragon's Talisman stats reuse CommonItemStats for every field that
// actually behaves like a per-item stat (hp/hpPercent/phyMagAtk/def/magdef/
// crt/cdm/attAtkPercent/phyMagAtkPercent) so this shape stays comparable with
// every other item's stats — e.g. for a future cross-item stat comparison
// feature. `fdOptions` stays separate from CommonItemStats.fd because it's a
// list of alternate values (shown as "a / b / c"), not a single diffable
// number; name/rarity/craftable are display/gating metadata, not stats.
export interface BDTalismanStat extends CommonItemStats {
  name: string;
  rarity: ITEM_RARITY;
  fdOptions?: number[];
  craftable: boolean;
}

export type BDBaofaTalismanStat = BDTalismanStat;
export type BDUmbalaTalismanStat = BDTalismanStat;
export type BDMelukaTalismanStat = BDTalismanStat;
export type BDTitanionTalismanStat = BDTalismanStat;
export type BDKeenTalismanStat = BDTalismanStat;
export type BDAncientElementTalismanStat = BDTalismanStat;

export interface EternalWorldTalismanStat {
  encLevel: number;
  attack: number;
  attributePercent: number;
  maxHP: number;
}
export interface EternalPainTalismanStat {
  encLevel: number;
  attack: number;
  fd: number;
  maxHP: number;
}
export interface EternalChaosTalismanStat {
  critical: number[];
  criticalDamage: number[];
  phyDef: number[];
  magDef: number[];
  fd: number[];
}

export interface LunarJadeEnhancementStats {
  encLevel: number;
  attack: number;
  attPercent: number;
  fd: number;
  hsSkillPercent: number;

  // att
  attackPercent?: number;
  critical?: number;
  criticalDamage?: number;

  // def
  hpPercent?: number;
  hp?: number;
  phyDef?: number;
  magDef?: number;
}
