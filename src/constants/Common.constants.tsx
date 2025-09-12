import { Typography } from "antd";
import { SideBarGroupTab } from "../interface/Common.interface";
import { LunarFragmentData } from "../interface/Item.interface";
import { CommonItemStats } from "../interface/ItemStat.interface";

export const TAB_KEY = {
  mainGeneral: "General",
  setting: "Setting",
  eqAncient: "Ancient",
  eqKilos: "Kilos",
  eqNamedEOD: "Named EOD",
  eqBoneDragon: "Bone Dragon",
  eqVIPAcc: "VIP Accessories",
  eqSpunGold: "Spun Gold",
  jadeLunar: "Lunar Jade",
  jadeSkill: "Skill Jade",
  jadeErosion: "Erosion Jade",
  heraldryAncientGoddes: "Ancients' Goddess",
  talismanBlackDragon: "Black Dragon's",
  talismanEternal: "Eternal",
  miscConversion: "Conversion",
  miscBestie: "Bestie",
};

export const TAB_GROUP_LIST: SideBarGroupTab[] = [
  {
    key: "MAIN",
    name: "Main",
    children: [
      {
        key: TAB_KEY.mainGeneral,
        name: TAB_KEY.mainGeneral,
      },
    ],
  },
  {
    key: "EQUIPMENT",
    name: "Equipment",
    children: [
      {
        key: TAB_KEY.eqAncient,
        name: TAB_KEY.eqAncient,
      },
      {
        key: TAB_KEY.eqKilos,
        name: TAB_KEY.eqKilos,
      },
      {
        key: TAB_KEY.eqNamedEOD,
        name: TAB_KEY.eqNamedEOD,
      },
      {
        key: TAB_KEY.eqBoneDragon,
        name: TAB_KEY.eqBoneDragon,
      },
      {
        key: TAB_KEY.eqVIPAcc,
        name: TAB_KEY.eqVIPAcc,
      },
      {
        key: TAB_KEY.eqSpunGold,
        name: TAB_KEY.eqSpunGold,
      },
    ],
  },
  {
    key: "JADE",
    name: "Jade",
    children: [
      {
        key: TAB_KEY.jadeLunar,
        name: TAB_KEY.jadeLunar,
      },
      {
        key: TAB_KEY.jadeSkill,
        name: TAB_KEY.jadeSkill,
      },
      {
        key: TAB_KEY.jadeErosion,
        name: TAB_KEY.jadeErosion,
      },
    ],
  },
  {
    key: "HERALDRY",
    name: "Heraldry",
    children: [
      {
        key: TAB_KEY.heraldryAncientGoddes,
        name: TAB_KEY.heraldryAncientGoddes,
      },
    ],
  },
  {
    key: "TALISMAN",
    name: "Talisman",
    children: [
      {
        key: TAB_KEY.talismanBlackDragon,
        name: TAB_KEY.talismanBlackDragon,
      },
      {
        key: TAB_KEY.talismanEternal,
        name: TAB_KEY.talismanEternal,
      },
    ],
  },
  {
    key: "MISC",
    name: "Misc.",
    children: [
      {
        key: TAB_KEY.miscConversion,
        name: TAB_KEY.miscConversion,
      },
      {
        key: TAB_KEY.miscBestie,
        name: TAB_KEY.miscBestie,
      },
    ],
  },
  {
    key: "UTILITY",
    name: "Utility",
    children: [
      {
        key: TAB_KEY.setting,
        name: TAB_KEY.setting,
      },
    ],
  },
];

export interface TableResource {
  mats: string;
  amount: number;
  customLabel?: {
    lunarStyle?: LunarFragmentData;
  };
}

export const EmptyCommonnStat: CommonItemStats = {
  encLevel: "0",
  phyMagAtk: 0,
  phyMagAtkMin: 0,
  phyMagAtkMax: 0,
  phyMagAtkPercent: 0,
  attAtkPercent: 0,

  crt: 0,
  crtPercent: 0,
  cdm: 0,
  fd: 0,

  str: 0,
  agi: 0,
  int: 0,
  vit: 0,
  strPercent: 0,
  agiPercent: 0,
  intPercent: 0,
  vitPercent: 0,

  def: 0,
  magdef: 0,
  defPercent: 0,
  magdefPercent: 0,

  hp: 0,
  hpPercent: 0,
  moveSpeedPercent: 0,
  moveSpeedPercentTown: 0,
};
