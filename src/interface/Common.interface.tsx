import { EQUIPMENT, LUNAR_JADE_RARITY } from "../constants/InGame.constants";

export interface SideBarTab {
  key: string;
  name: string;
}

export interface LunarJadeCalculator {
  equipment: EQUIPMENT
  min: number
  max: number
  from: LUNAR_JADE_RARITY
  to: LUNAR_JADE_RARITY
}