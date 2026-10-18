import { LS_KEYS } from "../constants/localStorage.constants";
import {
  backupToText,
  createBackup,
  describeBackup,
  parseBackup,
  restoreBackup,
} from "./backup.util";

beforeEach(() => localStorage.clear());

const characters = JSON.stringify({
  version: 1,
  characters: [{ id: "c1" }, { id: "c2" }],
  groups: [{ id: "g1" }],
});

test("exports every saved part except the last opened screen", () => {
  localStorage.setItem(LS_KEYS.characters, characters);
  localStorage.setItem(LS_KEYS.dark_mode, "true");
  localStorage.setItem(LS_KEYS.last_screen, '{"key":"Task"}');
  localStorage.setItem("SOMETHING_ELSE", "x");

  const backup = createBackup();
  expect(backup.app).toBe("dn-overview");
  expect(backup.data).toEqual({
    [LS_KEYS.characters]: characters,
    [LS_KEYS.dark_mode]: "true",
  });
});

test("round-trips through text and replaces this browser's data", () => {
  localStorage.setItem(LS_KEYS.characters, characters);
  localStorage.setItem(LS_KEYS.tasks, '{"entries":[{}, {}, {}]}');
  const text = backupToText(createBackup());

  localStorage.clear();
  localStorage.setItem(LS_KEYS.general_widgets, "old");
  localStorage.setItem(LS_KEYS.last_screen, "kept");
  const backup = parseBackup(text);
  expect(describeBackup(backup)).toEqual({ characters: 2, ids: 1, tasks: 3 });

  restoreBackup(backup);
  expect(localStorage.getItem(LS_KEYS.characters)).toBe(characters);
  // Not in the backup, so removed; the device's own screen is kept.
  expect(localStorage.getItem(LS_KEYS.general_widgets)).toBeNull();
  expect(localStorage.getItem(LS_KEYS.last_screen)).toBe("kept");
});

test("ignores unknown parts and non-text values", () => {
  const backup = parseBackup(
    JSON.stringify({
      app: "dn-overview",
      version: 1,
      exportedAt: "2026-10-18T10:00:00+08:00",
      data: {
        [LS_KEYS.dark_mode]: "true",
        [LS_KEYS.last_screen]: "x",
        OTHER: "x",
        [LS_KEYS.tasks]: { not: "text" },
      },
    })
  );
  expect(backup.data).toEqual({ [LS_KEYS.dark_mode]: "true" });
});

test("rejects text that is not a backup", () => {
  expect(() => parseBackup("hello")).toThrow("not valid JSON");
  expect(() => parseBackup('{"app":"other","data":{}}')).toThrow(
    "This is not a DN Overview backup."
  );
  expect(() =>
    parseBackup('{"app":"dn-overview","version":99,"data":{}}')
  ).toThrow("newer version");
  expect(() => parseBackup('{"app":"dn-overview","version":1}')).toThrow(
    "no data"
  );
});

test("counts nothing from broken parts", () => {
  expect(
    describeBackup({
      app: "dn-overview",
      version: 1,
      exportedAt: "",
      data: { [LS_KEYS.characters]: "{broken" },
    })
  ).toEqual({ characters: 0, ids: 0, tasks: 0 });
});
