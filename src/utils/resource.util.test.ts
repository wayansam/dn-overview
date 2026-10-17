import { TAB_KEY } from "../constants/Common.constants";
import { EQUIPMENT } from "../constants/InGame.constants";
import { getResource } from "./resource.util";

const ALL = Object.values(EQUIPMENT);
const ARMOR_AND_WEAPONS = [
  EQUIPMENT.HELM,
  EQUIPMENT.UPPER,
  EQUIPMENT.LOWER,
  EQUIPMENT.GLOVE,
  EQUIPMENT.SHOES,
  EQUIPMENT.MAIN_WEAPON,
  EQUIPMENT.SECOND_WEAPON,
];

// Which equipment each calculator has a stat table for.
const supported: [string, EQUIPMENT[]][] = [
  [TAB_KEY.miscConversion, ALL],
  [
    TAB_KEY.eqVIPAcc,
    [EQUIPMENT.NECKLACE, EQUIPMENT.EARRING, EQUIPMENT.RING1, EQUIPMENT.RING2],
  ],
  [TAB_KEY.eqBoneDragon, ARMOR_AND_WEAPONS],
  [TAB_KEY.eqGoldDragon, ARMOR_AND_WEAPONS],
  [TAB_KEY.eqSpunGold, ARMOR_AND_WEAPONS],
  [TAB_KEY.eqNamedEOD, [EQUIPMENT.MAIN_WEAPON, EQUIPMENT.SECOND_WEAPON]],
];

describe.each(supported)("getResource(%s)", (menu, equipment) => {
  test.each(ALL)("%s", (eq) => {
    const table = getResource(menu, eq);
    if (equipment.includes(eq)) {
      expect(table.length).toBeGreaterThan(0);
    } else {
      expect(table).toEqual([]);
    }
  });
});

test("both rings share one table", () => {
  expect(getResource(TAB_KEY.eqVIPAcc, EQUIPMENT.RING1)).toBe(
    getResource(TAB_KEY.eqVIPAcc, EQUIPMENT.RING2)
  );
});

test("unknown menus have no tables", () => {
  expect(getResource("unknown", EQUIPMENT.HELM)).toEqual([]);
});
