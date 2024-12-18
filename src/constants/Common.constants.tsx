import { SideBarGroupTab } from "../interface/Common.interface";

export const TAB_KEY = {
  mainGeneral: "General",
  eqAncient: "Ancient",
  eqKilos: "Kilos",
  eqNamedEOD: "Named EOD",
  jadeLunar: "Lunar Jade",
  jadeSkill: "Skill Jade",
  jadeErosion: "Erosion Jade",
  heraldryAncientGoddes: "Ancients' Goddess",
  talismanBlackDragon: "Black Dragon's",
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
    ],
  },
];
