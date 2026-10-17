// Sanity checks for the hand-entered enhancement stat tables. Each row holds
// the cumulative stats at that enhancement level, so a typo usually shows up
// as a stat that goes down, an unknown stat key, or a level out of sequence.
import { EmptyCommonnStat } from "../constants/Common.constants";
import { CommonItemStats } from "../interface/ItemStat.interface";
import {
  BestieMountV1TableStats,
  BestieMountV2TableStats,
  BestieSpiritV1TableStats,
  BestieSpiritV2TableStats,
} from "./misc/BestieCalculatorData";
import {
  conversionDecalStats,
  conversionEarringStats,
  conversionGloveStats,
  conversionHelmStats,
  conversionLowerStats,
  conversionMainStats,
  conversionNecklaceStats,
  conversionRingStats,
  conversionSecondStats,
  conversionShoesStats,
  conversionTailStats,
  conversionUpperStats,
  conversionWingStats,
} from "./misc/ConversionCalculatorData";
import {
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
} from "./equipment/BoneDragonEqData";
import {
  GoldDragonStatsGlovesTable,
  GoldDragonStatsHelmTable,
  GoldDragonStatsLowerTable,
  GoldDragonStatsMainTable,
  GoldDragonStatsSecondTable,
  GoldDragonStatsShoesTable,
  GoldDragonStatsUpperTable,
} from "./equipment/GoldDragonEqData";
import {
  NamedEODMainStatTable,
  NamedEODSecondStatTable,
} from "./equipment/NamedEODData";
import {
  SpunGoldStatsGlovesTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsShoesTable,
  SpunGoldStatsUpperTable,
} from "./equipment/SpunGoldEqData";
import {
  IonaEarringEnhancementStatsTable,
  IonaNecklaceEnhancementStatsTable,
  IonaRingEnhancementStatsTable,
} from "./equipment/VIPAccData";
import {
  CollapseJadeAttackStatsTable,
  CollapseJadeDefendStatsTable,
} from "./jade/CollapseJadeData";
import {
  DeeplyVariantLJadeStatsTable,
  DeeplyVariantUJadeStatsTable,
} from "./jade/DeeplyVarJadeData";
import { GoldDragonJadeStatsTable } from "./jade/GoldDragonJadeData";
import {
  LunarJadeAttEnhancementStatsTable,
  LunarJadeDefEnhancementStatsTable,
} from "./jade/lunarData";

// Row i is level i.
const zeroBased = {
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsUpperTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsGlovesTable,
  BoneDragonStatsShoesTable,
  GoldDragonStatsMainTable,
  GoldDragonStatsSecondTable,
  GoldDragonStatsHelmTable,
  GoldDragonStatsUpperTable,
  GoldDragonStatsLowerTable,
  GoldDragonStatsGlovesTable,
  GoldDragonStatsShoesTable,
  SpunGoldStatsMainTable,
  SpunGoldStatsSecondTable,
  SpunGoldStatsHelmTable,
  SpunGoldStatsUpperTable,
  SpunGoldStatsLowerTable,
  SpunGoldStatsGlovesTable,
  SpunGoldStatsShoesTable,
  NamedEODMainStatTable,
  NamedEODSecondStatTable,
  IonaRingEnhancementStatsTable,
  IonaEarringEnhancementStatsTable,
  IonaNecklaceEnhancementStatsTable,
  CollapseJadeAttackStatsTable,
  CollapseJadeDefendStatsTable,
  DeeplyVariantUJadeStatsTable,
  GoldDragonJadeStatsTable,
  LunarJadeAttEnhancementStatsTable,
  LunarJadeDefEnhancementStatsTable,
};

// Row i is level i + 1. Bestie screens look levels up without an offset, and
// the Deeply Variant (L) table continues after the (U) table's max level.
const oneBased = {
  DeeplyVariantLJadeStatsTable,
  BestieMountV1TableStats,
  BestieMountV2TableStats,
  BestieSpiritV1TableStats,
  BestieSpiritV2TableStats,
};

// Levels 0..10, then a "Legend" tier that restarts its stats:
// "Legend", "Legend +1", ...
const conversion = {
  conversionHelmStats,
  conversionUpperStats,
  conversionLowerStats,
  conversionGloveStats,
  conversionShoesStats,
  conversionMainStats,
  conversionSecondStats,
  conversionNecklaceStats,
  conversionEarringStats,
  conversionRingStats,
  conversionWingStats,
  conversionTailStats,
  conversionDecalStats,
};
const LEGEND_START = 11;
const conversionLevel = (i: number) =>
  i < LEGEND_START
    ? String(i)
    : i === LEGEND_START
      ? "Legend"
      : `Legend +${i - LEGEND_START}`;

const knownStats = new Set(Object.keys(EmptyCommonnStat));

const statEntries = (row: CommonItemStats) =>
  Object.entries(row).filter(([key]) => key !== "encLevel");

// Every stat present in either row must not go down; a stat missing from a
// row counts as 0.
const findDecreases = (rows: CommonItemStats[]) => {
  const problems: string[] = [];
  rows.forEach((row, i) => {
    if (i === 0) return;
    const prev = new Map(statEntries(rows[i - 1]));
    const curr = new Map(statEntries(row));
    const keys = new Set([...prev.keys(), ...curr.keys()]);
    keys.forEach((key) => {
      const before = Number(prev.get(key) ?? 0);
      const after = Number(curr.get(key) ?? 0);
      if (after < before) {
        problems.push(`${row.encLevel} ${key}: ${before} -> ${after}`);
      }
    });
  });
  return problems;
};

const allTables = { ...zeroBased, ...oneBased, ...conversion };

describe.each(Object.entries(allTables))("%s", (_, rows) => {
  test("is not empty", () => {
    expect(rows.length).toBeGreaterThan(1);
  });

  test("only uses known stat keys", () => {
    const unknown = rows.flatMap((row) =>
      statEntries(row)
        .map(([key]) => key)
        .filter((key) => !knownStats.has(key))
    );
    expect(unknown).toEqual([]);
  });

  test("has finite numbers for every stat that is set", () => {
    const bad = rows.flatMap((row) =>
      statEntries(row)
        .filter(([, value]) => value !== undefined && !Number.isFinite(value))
        .map(([key, value]) => `${row.encLevel} ${key}=${value}`)
    );
    expect(bad).toEqual([]);
  });
});

describe.each(Object.entries(zeroBased))("%s", (_, rows) => {
  test("lists levels 0, 1, 2, ... in order", () => {
    expect(rows.map((row) => row.encLevel)).toEqual(
      rows.map((_, i) => String(i))
    );
  });

  test("stats never decrease between levels", () => {
    expect(findDecreases(rows)).toEqual([]);
  });
});

describe.each(Object.entries(oneBased))("%s", (_, rows) => {
  test("lists levels 1, 2, 3, ... in order", () => {
    expect(rows.map((row) => row.encLevel)).toEqual(
      rows.map((_, i) => String(i + 1))
    );
  });

  test("stats never decrease between levels", () => {
    expect(findDecreases(rows)).toEqual([]);
  });
});

describe.each(Object.entries(conversion))("%s", (_, rows) => {
  test("lists levels 0..10 then the Legend tier", () => {
    expect(rows.map((row) => row.encLevel)).toEqual(
      rows.map((_, i) => conversionLevel(i))
    );
  });

  test("stats never decrease within a tier", () => {
    expect(findDecreases(rows.slice(0, LEGEND_START))).toEqual([]);
    expect(findDecreases(rows.slice(LEGEND_START))).toEqual([]);
  });
});
