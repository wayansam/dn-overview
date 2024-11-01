import { EQUIPMENT, ITEM_RARITY } from "../constants/InGame.constants";

export interface SideBarTab {
  key: string;
  name: string;
}

export interface SideBarGroupTab {
  key: string;
  name: string;
  children: SideBarTab[];
}

export interface LunarJadeCalculator {
  key: string;
  equipment: EQUIPMENT;
  min: number;
  max: number;
  defaultValue: number;
  from: ITEM_RARITY;
  to: ITEM_RARITY;
}

export interface AncientCalculator {
  key: string;
  equipment: EQUIPMENT;
  min: number;
  max: number;
  from: number;
  to: number;
}

export interface KilosCalculator {
  key: string;
  equipment: EQUIPMENT;
  min: number;
  max: number;
  from: number;
  to: number;
  evoTier2: boolean;
  craft: boolean;
}
