import { LS_KEYS } from "../constants/localStorage.constants";
import { getServerTimestamp } from "./weeklyReset.util";

// Marks a file as one of ours; bump the version when the format changes.
const BACKUP_APP = "dn-overview";
const BACKUP_VERSION = 1;

// Everything saved in this browser except the last opened screen, which
// belongs to the device.
export const BACKUP_KEYS: string[] = Object.values(LS_KEYS).filter(
  (key) => key !== LS_KEYS.last_screen,
);

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  // Server time of the export.
  exportedAt: string;
  // localStorage key -> its raw value, so each part is checked by its own
  // loader after import, like any saved data.
  data: Record<string, string>;
}

export const createBackup = (): Backup => {
  const data: Record<string, string> = {};
  BACKUP_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) data[key] = value;
  });
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: getServerTimestamp(),
    data,
  };
};

export const backupToText = (backup: Backup) => JSON.stringify(backup);

// Throws an Error with a message for the user when the text is not a backup.
export const parseBackup = (text: string): Backup => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    throw new Error("This is not a DN Overview backup (not valid JSON).");
  }
  const value = parsed as Partial<Backup> | null;
  if (!value || typeof value !== "object" || value.app !== BACKUP_APP) {
    throw new Error("This is not a DN Overview backup.");
  }
  if (typeof value.version !== "number" || value.version > BACKUP_VERSION) {
    throw new Error(
      "This backup was made by a newer version, reload the page and try again.",
    );
  }
  if (!value.data || typeof value.data !== "object") {
    throw new Error("This backup has no data.");
  }
  // Unknown keys and non-text values are ignored.
  const data = Object.fromEntries(
    Object.entries(value.data).filter(
      ([key, item]) => BACKUP_KEYS.includes(key) && typeof item === "string",
    ),
  ) as Record<string, string>;
  return {
    app: BACKUP_APP,
    version: value.version,
    exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : "",
    data,
  };
};

const countOf = (raw: string | undefined, field: string) => {
  try {
    const list = raw ? JSON.parse(raw)?.[field] : undefined;
    return Array.isArray(list) ? list.length : 0;
  } catch {
    return 0;
  }
};

// Counts shown before importing.
export const describeBackup = (backup: Backup) => ({
  characters: countOf(backup.data[LS_KEYS.characters], "characters"),
  ids: countOf(backup.data[LS_KEYS.characters], "groups"),
  tasks: countOf(backup.data[LS_KEYS.tasks], "entries"),
});

// Replaces this browser's saved data with the backup's. Parts missing from
// the backup are removed, so the result matches the exporting browser.
export const restoreBackup = (backup: Backup) => {
  BACKUP_KEYS.forEach((key) => {
    const value = backup.data[key];
    if (value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  });
};

// Wrapped so tests can replace it (jsdom cannot reload).
export const page = {
  reload: () => window.location.reload(),
};
