import { CHARACTER_3RDJOB, SKILL_JADE } from "../constants/InGame.constants";
import { AccountData } from "../interface/Account.interface";

export const exampleAccount: AccountData = {
  characters: [
    {
      ign: "Opichiuz",
      job: CHARACTER_3RDJOB.SAINT,
      level: 95,
      stg: 20.5,
      skillJade: [
        {
          name: SKILL_JADE.DREAMY,
          level: 10,
        },
        {
          name: SKILL_JADE.VERDURE,
          level: 10,
        },
      ],
    },
  ],
};
