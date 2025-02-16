import { ITEM_RARITY } from "../constants/InGame.constants";

export interface NamedEODStat {
  encLevel: number;
  minAttack: number;
  maxAttack: number;
  attackPercent: number;
  critical: number;
  criticalDamage: number;
}

export interface SkillJadeStat {
  encLevel: number;
  attackPercent: number;
  cooldownPercent: number;
}

export interface AncientGoddesHeraStat {
  encLevel: number;
  attackPercent: number;
}

export interface BDTalismanStat {
  name: string;
  rarity: ITEM_RARITY;
  maxHPPercent?: number;
  attackPercent?: number;
  fd?: number[];
  craftable: boolean;
}

export interface BDBaofaTalismanStat extends BDTalismanStat {
  maxHP?: number;
}
export interface BDUmbalaTalismanStat extends BDTalismanStat {
  phyDef?: number;
}
export interface BDMelukaTalismanStat extends BDTalismanStat {
  magDef?: number;
}
export interface BDTitanionTalismanStat extends BDTalismanStat {
  attack?: number;
}
export interface BDKeenTalismanStat extends BDTalismanStat {
  attack?: number;
  critical?: number;
  criticalDamage?: number;
}
export interface BDAncientElementTalismanStat
  extends Omit<BDTalismanStat, "attackPercent"> {
  attributePercent?: number;
  attack?: number;
}

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
