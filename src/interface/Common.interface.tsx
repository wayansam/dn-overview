import {
  CONVERSION_TYPE,
  EQUIPMENT,
  ITEM_RARITY,
} from "../constants/InGame.constants";

export interface ExtraPayload {
  lunarScreen?: {
    tabOpen: string[];
  };
  skillJadeScreen?: {
    tabOpen: string[];
  };
}
export interface SideBarTab {
  key: string;
  name: string;
  payload?: ExtraPayload;
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

export type CommonEquipmentCalculator<T = {}> = T & {
  key: string;
  equipment: EQUIPMENT;
  min: number;
  max: number;
  from: number;
  to: number;
};

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

export interface ConversionCalculator {
  key: string;
  equipment: CONVERSION_TYPE;
  min: number;
  max: number;
  from: number;
  to: number;
}

export interface BoneCalculator {
  key: string;
  equipment: EQUIPMENT;
  min: number;
  max: number;
  from: number;
  to: number;
}
