import {
  CHARACTER_2NDJOB,
  CHARACTER_CLASS,
} from "../../constants/InGame.constants";
import {
  ClassIcon,
  getBaseClassIcon,
  getClassIcon,
  getSecondJobIcon,
} from "./ClassIcon";

describe("ClassIcon", () => {
  it("maps icon files by file name", () => {
    expect(ClassIcon.gladiator).toEqual(expect.any(String));
    expect(getClassIcon("grand-master")).toBe(ClassIcon["grand-master"]);
  });

  it("resolves base class and 2nd job icons from their enum values", () => {
    expect(getBaseClassIcon(CHARACTER_CLASS.WARRIOR)).toBe(ClassIcon.warrior);
    expect(getSecondJobIcon(CHARACTER_2NDJOB.SWORDSMAN)).toBe(
      ClassIcon.swordsman,
    );
  });

  it("returns undefined for missing icons", () => {
    expect(getClassIcon(undefined)).toBeUndefined();
    expect(getClassIcon("not-a-class")).toBeUndefined();
  });
});
