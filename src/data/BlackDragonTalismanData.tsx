import { ITEM_RARITY } from "../constants/InGame.constants";
import {
  BDAncientElementTalismanStat,
  BDBaofaTalismanStat,
  BDKeenTalismanStat,
  BDMelukaTalismanStat,
  BDTitanionTalismanStat,
  BDUmbalaTalismanStat,
} from "../interface/ItemStat.interface";
import { getBDTalisFd } from "../utils/common.util";

export const BDBaofaTalismanStatTable: BDBaofaTalismanStat[] = [
  {
    name: "Baofa's Talisman",
    rarity: ITEM_RARITY.NORMAL,
    maxHP: 1950000,
    maxHPPercent: undefined,
    attackPercent: undefined,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Baofa's Talisman",
    rarity: ITEM_RARITY.MAGIC,
    maxHP: 3900000,
    maxHPPercent: 30,
    attackPercent: undefined,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Baofa's Talisman",
    rarity: ITEM_RARITY.RARE,
    maxHP: 5850000,
    maxHPPercent: 60,
    attackPercent: 1,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Baofa's Talisman",
    rarity: ITEM_RARITY.EPIC,
    maxHP: 7800000,
    maxHPPercent: 90,
    attackPercent: 2,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Baofa's Talisman",
    rarity: ITEM_RARITY.UNIQUE,
    maxHP: 9750000,
    maxHPPercent: 120,
    attackPercent: 3,
    fd: getBDTalisFd(ITEM_RARITY.UNIQUE),
    craftable: true,
  },
  {
    name: "Blessed Baofa's Talisman",
    rarity: ITEM_RARITY.LEGEND,
    maxHP: 11700000,
    maxHPPercent: 150,
    attackPercent: 5,
    fd: getBDTalisFd(ITEM_RARITY.LEGEND),
    craftable: false,
  },
];

export const BDUmbalaTalismanStatTable: BDUmbalaTalismanStat[] = [
  {
    name: "Umbala's Talisman",
    rarity: ITEM_RARITY.NORMAL,
    phyDef: 7500,
    maxHPPercent: undefined,
    attackPercent: undefined,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Umbala's Talisman",
    rarity: ITEM_RARITY.MAGIC,
    phyDef: 15000,
    maxHPPercent: 2,
    attackPercent: undefined,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Umbala's Talisman",
    rarity: ITEM_RARITY.RARE,
    phyDef: 22500,
    maxHPPercent: 4,
    attackPercent: 1,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Umbala's Talisman",
    rarity: ITEM_RARITY.EPIC,
    phyDef: 30000,
    maxHPPercent: 6,
    attackPercent: 2,
    fd: undefined,
    craftable: true,
  },
  {
    name: "Umbala's Talisman",
    rarity: ITEM_RARITY.UNIQUE,
    phyDef: 37500,
    maxHPPercent: 8,
    attackPercent: 3,
    fd: getBDTalisFd(ITEM_RARITY.UNIQUE),
    craftable: true,
  },
  {
    name: "Blessed Umbala's Talisman",
    rarity: ITEM_RARITY.LEGEND,
    phyDef: 45000,
    maxHPPercent: 10,
    attackPercent: 5,
    fd: getBDTalisFd(ITEM_RARITY.LEGEND),
    craftable: false,
  },
];

export const BDMelukaTalismanStatTable: BDMelukaTalismanStat[] = [];

export const BDTitanionTalismanStatTable: BDTitanionTalismanStat[] = [];

export const BDKeenTalismanStatTable: BDKeenTalismanStat[] = [];

export const BDAncientElementTalismanStatTable: BDAncientElementTalismanStat[] =
  [];
