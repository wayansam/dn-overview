import {
  CHARACTER_2NDJOB,
  CHARACTER_3RDJOB,
  CHARACTER_CLASS,
} from "../constants/InGame.constants";
import { Rune, SkillJade } from "./Item.interface";

export interface AccountData {
  characters: CharacterInGameData[];
}

export interface Classes {
  name: CHARACTER_CLASS;
  list: SecondJob[];
}

export interface SecondJob {
  name: CHARACTER_2NDJOB;
  list: ThirdJob[];
}

export interface ThirdJob {
  name: CHARACTER_3RDJOB;
}

export interface CharacterInGameData {
  ign: string;
  job: CHARACTER_3RDJOB;
  level: number;
  stg?: number;
  skillJade?: SkillJade[];
  rune?: {
    tria?: Rune;
    circu?: Rune;
    recta?: Rune;
    trape?: Rune;
  };
}
