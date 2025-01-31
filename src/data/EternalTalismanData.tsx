import {
  EternalPainTalismanMats,
  EternalWorldTalismanMats,
} from "../interface/Item.interface";
import {
  EternalChaosTalismanStat,
  EternalPainTalismanStat,
  EternalWorldTalismanStat,
} from "../interface/ItemStat.interface";

export const EternalWorldTalismanStatTable: EternalWorldTalismanStat[] = [
  {
    encLevel: 1,
    attack: 80000,
    attributePercent: 1.5,
    maxHP: 2000000,
  },
  {
    encLevel: 2,
    attack: 160000,
    attributePercent: 1.6,
    maxHP: 2500000,
  },
  {
    encLevel: 3,
    attack: 240000,
    attributePercent: 1.7,
    maxHP: 3000000,
  },
  {
    encLevel: 4,
    attack: 320000,
    attributePercent: 1.8,
    maxHP: 3500000,
  },
  {
    encLevel: 5,
    attack: 400000,
    attributePercent: 1.9,
    maxHP: 4000000,
  },
  {
    encLevel: 6,
    attack: 480000,
    attributePercent: 2.0,
    maxHP: 4500000,
  },
  {
    encLevel: 7,
    attack: 560000,
    attributePercent: 2.1,
    maxHP: 5000000,
  },
  {
    encLevel: 8,
    attack: 640000,
    attributePercent: 2.2,
    maxHP: 5500000,
  },
  {
    encLevel: 9,
    attack: 720000,
    attributePercent: 2.3,
    maxHP: 6000000,
  },
  {
    encLevel: 10,
    attack: 800000,
    attributePercent: 2.4,
    maxHP: 6500000,
  },
];

export const EternalPainTalismanStatTable: EternalPainTalismanStat[] = [
  {
    encLevel: 1,
    attack: 500000,
    fd: 600,
    maxHP: 5000000,
  },
  {
    encLevel: 2,
    attack: 800000,
    fd: 700,
    maxHP: 6000000,
  },
  {
    encLevel: 3,
    attack: 1100000,
    fd: 800,
    maxHP: 7000000,
  },
  {
    encLevel: 4,
    attack: 1400000,
    fd: 900,
    maxHP: 8000000,
  },
  {
    encLevel: 5,
    attack: 1700000,
    fd: 1000,
    maxHP: 9000000,
  },
];

export const EternalChaosTalismanStatTable: EternalChaosTalismanStat = {
  critical: [50000, 25000, -25000, -50000],
  criticalDamage: [225000, 112500, -112500, -225000],
  phyDef: [15000, 7500, -7500, -15000],
  magDef: [15000, 7500, -7500, -15000],
  fd: [0, 600],
};

export const EternalWorldTalismanMatsTable: EternalWorldTalismanMats[] = [
  {
    encLevel: 1,
    apparition: 30,
    gold: 1000,
  },
  {
    encLevel: 2,
    apparition: 60,
    gold: 5000,
  },
  {
    encLevel: 3,
    apparition: 100,
    gold: 10000,
  },
  {
    encLevel: 4,
    apparition: 180,
    gold: 30000,
  },
  {
    encLevel: 5,
    apparition: 330,
    gold: 50000,
  },
  {
    encLevel: 6,
    apparition: 600,
    gold: 70000,
  },
  {
    encLevel: 7,
    apparition: 1100,
    gold: 100000,
  },
  {
    encLevel: 8,
    apparition: 2000,
    gold: 120000,
  },
  {
    encLevel: 9,
    apparition: 3600,
    gold: 150000,
  },
  {
    encLevel: 10,
    apparition: 6500,
    gold: 200000,
  },
];
export const EternalPainTalismanMatsTable: EternalPainTalismanMats[] = [
  {
    encLevel: 1,
    apparition: 100,
    vortex: 1,
    gold: 50000,
  },
  {
    encLevel: 2,
    apparition: 200,
    vortex: 10,
    gold: 50000,
  },
  {
    encLevel: 3,
    apparition: 300,
    vortex: 30,
    gold: 50000,
  },
  {
    encLevel: 4,
    apparition: 400,
    vortex: 50,
    gold: 50000,
  },
  {
    encLevel: 5,
    apparition: 500,
    vortex: 100,
    gold: 50000,
  },
];
