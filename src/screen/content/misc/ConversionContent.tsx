import { Collapse, CollapseProps, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChartsCard, { ChartItem } from "../../../components/ChartsCard";
import ConversionSuggestionPanel, {
  ConversionSuggestionMaterialInput,
  ConversionSuggestionOption,
} from "../../../components/ConversionSuggestionPanel";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import MaterialListTable from "../../../components/MaterialListTable";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { EmptyCommonnStat, TAB_KEY } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import { useEquipmentAccumulator, useInvalidRange } from "../../../hooks/useEquipmentCalculator";
import { dataConversionCalculator } from "../../../data/misc/ConversionCalculatorData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { combineEqStats, getAllStatDesc, getComparedData } from "../../../utils/common.util";
import { getResource } from "../../../utils/resource.util";

const { Text } = Typography;

interface TableMaterialList {
  "Armor Fragment": number;
  "Acc Fragment": number;
  "Wtd Fragment": number;
  "Weapon Fragment": number;
  "Astral Powder": number;
  "Astral Stone": number;
  "Astral Jewel": number;
}

// A tap the suggestion engine actually took (fits within owned resources).
interface SuggestionRow {
  key: string;
  equipment: EQUIPMENT;
  from: number;
  to: number;
  gain: number;
  cost: TableMaterialList;
}

const getLabel = (item: number) => {
  if (item === 0) {
    return "Buy";
  }
  if (item >= 12) {
    return `Legend +${item - 12}`;
  }
  return `+${item - 1}`;
};

const CONV_FRAG = 3500;
const WEAP_FRAG = 1;
const EV_AST_STONE = 3;
const EV_AST_POW_ARMOR = 1000;
const EV_AST_POW_WEAP = 1500;
const EV_AST_POW_ACC = 1150;
const EV_AST_POW_WTD = 1300;
const WEAP_ENH_SUC_RATE = [50, 40, 35, 20, 10, 7, 5, 5, 3, 3];

// Legend-tier enhancement (Legend -> +1 -> +2 ... ) material cost, per tap.
// Rate increases past +3, and armor's final +6 -> +7 tap switches entirely
// from Astral Stone to the new Astral Jewel material.
const ENC_AST_POW_ARMOR = 450;
const ENC_AST_STONE_ARMOR = 1;
const ENC_AST_STONE_ARMOR_MID = 3; // +4, +5, +6
const ENC_AST_POW_ARMOR_TOP = 1500; // +6 -> +7
const ENC_AST_JEWEL_ARMOR_TOP = 25; // +6 -> +7

const ENC_AST_POW_ACC = 500;
const ENC_AST_STONE_ACC = 3;
const ENC_AST_STONE_ACC_MID = 5; // +4, +5, +6

const ENC_AST_POW_WEAP = 600;
const ENC_AST_STONE_WEAP = 3;
const ENC_AST_STONE_WEAP_MID = 5; // +4, +5, +6

const ENC_AST_POW_WTD = 550;
const ENC_AST_STONE_WTD = 3;
const ENC_AST_STONE_WTD_MID = 5; // +4, +5, +6

// encLevel index boundaries within the Legend chain (Legend = 12).
const LEGEND_START = 12; // Legend +0, first level that costs Legend-rate mats
const LEGEND_OLD_CAP = 15; // Legend +3, last level at the original rate
const LEGEND_MID_CAP = 18; // Legend +6, last level shared by every category
const LEGEND_ARMOR_MAX = 19; // Legend +7, armor only

interface LegendRate {
  powder: number;
  stone?: number;
  jewel?: number;
}

// Splits the [from, to] range into its Legend-rate tiers (original / mid /
// top) and sums the material cost across whichever tiers it actually
// crosses. Reduces to the original flat `enhLRange * rate` computation for
// any range that doesn't reach past Legend +3. `from` is clamped to
// LEGEND_START (not just 1) since taps below Legend+0 (the +0..+10 unique
// enhance range) never cost Legend-rate mats — only the evo step itself
// (handled separately by the caller's `lgFrag += EV_AST_POW_*`) bridges
// into this range, e.g. going from +5 all the way to Legend+0 costs only
// the evo amount, not 5 phantom Legend-rate taps.
const getLegendMatsCost = (
  from: number,
  to: number,
  categoryMax: number,
  oldRate: LegendRate,
  midRate: LegendRate,
  topRate?: LegendRate
) => {
  const rangeLow = Math.max(from, LEGEND_START);
  const rangeHigh = Math.min(to, categoryMax);

  const oldPortion = Math.max(
    0,
    Math.min(rangeHigh, LEGEND_OLD_CAP) - rangeLow
  );
  const midPortion = Math.max(
    0,
    Math.min(rangeHigh, LEGEND_MID_CAP) - Math.max(rangeLow, LEGEND_OLD_CAP)
  );
  const topPortion = topRate
    ? Math.max(0, rangeHigh - Math.max(rangeLow, LEGEND_MID_CAP))
    : 0;

  return {
    powder:
      oldPortion * oldRate.powder +
      midPortion * midRate.powder +
      topPortion * (topRate?.powder ?? 0),
    stone:
      oldPortion * (oldRate.stone ?? 0) + midPortion * (midRate.stone ?? 0),
    jewel: topPortion * (topRate?.jewel ?? 0),
  };
};

const EMPTY_CONVERSION_MATS: TableMaterialList = {
  "Armor Fragment": 0,
  "Acc Fragment": 0,
  "Wtd Fragment": 0,
  "Weapon Fragment": 0,
  "Astral Powder": 0,
  "Astral Stone": 0,
  "Astral Jewel": 0,
};

const MATERIAL_KEYS = Object.keys(
  EMPTY_CONVERSION_MATS
) as (keyof TableMaterialList)[];

// Material cost to take a single equipment piece from `from` to `to` (the
// 0=Buy .. 19=Legend+7 index scheme used throughout this screen). Pure and
// equipment/level-only, so both the resource accumulator (selected rows in
// the Calculate tab) and the suggestion engine (hypothetical single-piece
// projections) share one source of truth for the cost formula instead of
// duplicating the per-category switch.
const computeConversionMats = (
  equipment: EQUIPMENT,
  from: number,
  to: number
): TableMaterialList => {
  const next: TableMaterialList = { ...EMPTY_CONVERSION_MATS };
  const isBuy = from === 0;
  const isEnhUnique = to <= 11 && from <= 11;
  const isEvo = to >= 12 && from <= 11;
  const frag =
    (Math.min(to, 11) - Math.max(isEnhUnique ? from : 11, 1)) * CONV_FRAG +
    (isBuy ? CONV_FRAG : 0);
  // Weapon has no "buy from store" step (it's obtained via Cherry
  // store/Trading House instead) and its fragment box costs WEAP_FRAG, not
  // CONV_FRAG, so it needs its own tap count rather than reusing `frag`.
  const weaponFrag =
    (Math.min(to, 11) - Math.max(isEnhUnique ? from : 11, 1)) * WEAP_FRAG;

  let lgFrag = 0;
  let lgStone = 0;
  let lgJewel = 0;

  switch (equipment) {
    case EQUIPMENT.HELM:
    case EQUIPMENT.UPPER:
    case EQUIPMENT.LOWER:
    case EQUIPMENT.GLOVE:
    case EQUIPMENT.SHOES:
      next["Armor Fragment"] += frag;
      if (isEvo) {
        lgFrag += EV_AST_POW_ARMOR;
        lgStone += EV_AST_STONE;
      }
      if (!isEnhUnique) {
        const cost = getLegendMatsCost(
          from,
          to,
          LEGEND_ARMOR_MAX,
          { powder: ENC_AST_POW_ARMOR, stone: ENC_AST_STONE_ARMOR },
          { powder: ENC_AST_POW_ARMOR, stone: ENC_AST_STONE_ARMOR_MID },
          { powder: ENC_AST_POW_ARMOR_TOP, jewel: ENC_AST_JEWEL_ARMOR_TOP }
        );
        lgFrag += cost.powder;
        lgStone += cost.stone;
        lgJewel += cost.jewel;
      }
      break;

    case EQUIPMENT.MAIN_WEAPON:
    case EQUIPMENT.SECOND_WEAPON:
      next["Weapon Fragment"] += weaponFrag;
      if (isEvo) {
        lgFrag += EV_AST_POW_WEAP;
        lgStone += EV_AST_STONE;
      }
      if (!isEnhUnique) {
        const cost = getLegendMatsCost(
          from,
          to,
          LEGEND_MID_CAP,
          { powder: ENC_AST_POW_WEAP, stone: ENC_AST_STONE_WEAP },
          { powder: ENC_AST_POW_WEAP, stone: ENC_AST_STONE_WEAP_MID }
        );
        lgFrag += cost.powder;
        lgStone += cost.stone;
      }
      break;

    case EQUIPMENT.NECKLACE:
    case EQUIPMENT.EARRING:
    case EQUIPMENT.RING1:
    case EQUIPMENT.RING2:
      next["Acc Fragment"] += frag;
      if (isEvo) {
        lgFrag += EV_AST_POW_ACC;
        lgStone += EV_AST_STONE;
      }
      if (!isEnhUnique) {
        const cost = getLegendMatsCost(
          from,
          to,
          LEGEND_MID_CAP,
          { powder: ENC_AST_POW_ACC, stone: ENC_AST_STONE_ACC },
          { powder: ENC_AST_POW_ACC, stone: ENC_AST_STONE_ACC_MID }
        );
        lgFrag += cost.powder;
        lgStone += cost.stone;
      }
      break;

    case EQUIPMENT.WING:
    case EQUIPMENT.TAIL:
    case EQUIPMENT.DECAL:
      next["Wtd Fragment"] += frag;
      if (isEvo) {
        lgFrag += EV_AST_POW_WTD;
        lgStone += EV_AST_STONE;
      }
      if (!isEnhUnique) {
        const cost = getLegendMatsCost(
          from,
          to,
          LEGEND_MID_CAP,
          { powder: ENC_AST_POW_WTD, stone: ENC_AST_STONE_WTD },
          { powder: ENC_AST_POW_WTD, stone: ENC_AST_STONE_WTD_MID }
        );
        lgFrag += cost.powder;
        lgStone += cost.stone;
      }
      break;

    default:
      break;
  }

  next["Astral Powder"] += lgFrag;
  next["Astral Stone"] += lgStone;
  next["Astral Jewel"] += lgJewel;

  return next;
};

const sumMats = (
  a: TableMaterialList,
  b: TableMaterialList
): TableMaterialList => {
  const result = { ...a };
  (Object.keys(a) as (keyof TableMaterialList)[]).forEach((key) => {
    result[key] = a[key] + b[key];
  });
  return result;
};

const canAffordMats = (
  owned: TableMaterialList,
  cost: TableMaterialList
): boolean =>
  (Object.keys(cost) as (keyof TableMaterialList)[]).every(
    (key) => owned[key] >= cost[key]
  );

const subtractMats = (
  a: TableMaterialList,
  b: TableMaterialList
): TableMaterialList => {
  const result = { ...a };
  (Object.keys(a) as (keyof TableMaterialList)[]).forEach((key) => {
    result[key] = a[key] - b[key];
  });
  return result;
};

// Value of a single stat at one level (not a diff) — level 0 (Buy) reads as
// 0 for every stat, matching the "not owned yet" baseline used elsewhere in
// this screen's own statDif computation.
const getEquipmentStatValue = (
  equipment: EQUIPMENT,
  level: number,
  statKey: keyof CommonItemStats
): number => {
  const table = getResource(TAB_KEY.miscConversion, equipment);
  const { dt2 } = getComparedData(table, level, level);
  const val = dt2?.[statKey];
  return typeof val === "number" ? val : 0;
};

const getStatGain = (
  equipment: EQUIPMENT,
  from: number,
  to: number,
  statKey: keyof CommonItemStats
): number =>
  getEquipmentStatValue(equipment, to, statKey) -
  getEquipmentStatValue(equipment, from, statKey);

const formatMats = (mats: TableMaterialList): string => {
  const parts = (Object.entries(mats) as [string, number][])
    .filter(([, value]) => value > 0)
    .map(([key, value]) => `${value.toLocaleString()} ${key}`);
  return parts.length > 0 ? parts.join(", ") : "-";
};

// Hard cap on greedy iterations — with 14 equipment pieces each capped at
// Legend +7 at most, the real bound is far lower; this only guards against a
// logic bug turning into an infinite loop.
const MAX_SUGGESTION_STEPS = 500;

// One round of the greedy allocation: among every equipment piece's very
// next tap, find whichever single tap grows the priority stat the most
// while still fitting in `remaining` (skipping taps that don't grow it at
// all, so resources aren't burned on a stat-irrelevant step while another
// piece could still use them). Takes `remaining`/`levels` as plain
// parameters (rather than closing over loop-reassigned locals) so each call
// is a pure, independent snapshot.
const pickBestTap = (
  dataSource: CommonEquipmentCalculator[],
  levels: Map<string, number>,
  remaining: TableMaterialList,
  statKey: keyof CommonItemStats
): { key: string; cost: TableMaterialList } | undefined => {
  let best: { key: string; gain: number; cost: TableMaterialList } | undefined;

  dataSource.forEach((row) => {
    const cur = levels.get(row.key) ?? row.from;
    if (cur >= row.max) {
      return;
    }
    const stepCost = computeConversionMats(row.equipment, cur, cur + 1);
    if (!canAffordMats(remaining, stepCost)) {
      return;
    }
    const stepGain = getStatGain(row.equipment, cur, cur + 1, statKey);
    if (stepGain > (best?.gain ?? 0)) {
      best = { key: row.key, gain: stepGain, cost: stepCost };
    }
  });

  return best && { key: best.key, cost: best.cost };
};

const MAX_OPTIONS = 5;
const MAX_PLAN_B_OPTIONS = 3;

// Crude scalar stand-in for "how much resource this costs" across 7
// different material types with no defined exchange rate between them —
// just the sum of raw units. Only used to rank Plan B options by how little
// extra is needed beyond what's owned.
const materialMagnitude = (mats: TableMaterialList): number =>
  (Object.values(mats) as number[]).reduce((sum, v) => sum + v, 0);

// Componentwise max(0, cost - owned) — the extra resources a cost needs
// beyond what's actually owned, per material.
const excessMats = (
  cost: TableMaterialList,
  owned: TableMaterialList
): TableMaterialList => {
  const result = { ...cost };
  (Object.keys(cost) as (keyof TableMaterialList)[]).forEach((key) => {
    result[key] = Math.max(0, cost[key] - owned[key]);
  });
  return result;
};

// Componentwise max(0, owned - cost) — what's left of owned after paying a
// cost, floored per material instead of allowed to go negative (used to
// keep a Plan B seed's overspend in one material from corrupting how much
// of OTHER materials are actually still available to greedy-fill with).
const clampSubtractMats = (
  owned: TableMaterialList,
  cost: TableMaterialList
): TableMaterialList => {
  const result = { ...owned };
  (Object.keys(owned) as (keyof TableMaterialList)[]).forEach((key) => {
    result[key] = Math.max(0, owned[key] - cost[key]);
  });
  return result;
};

// One full "option" — a set of equipment moves that together spend (some
// of) the pool, e.g. Wing Legend+0→+3 AND Helm Legend+0→+1 in one option.
interface SuggestionOption {
  key: string;
  rows: SuggestionRow[];
  totalGain: number;
  totalCost: TableMaterialList;
}

// Runs the greedy allocation (see pickBestTap) starting from a given
// levels/remaining snapshot, without mutating either — used both for the
// unseeded baseline option and to fill whatever's left after a seed.
const runGreedyFill = (
  dataSource: CommonEquipmentCalculator[],
  levels: Map<string, number>,
  remaining: TableMaterialList,
  statKey: keyof CommonItemStats
): Map<string, number> => {
  const nextLevels = new Map(levels);
  let pool = remaining;
  for (let i = 0; i < MAX_SUGGESTION_STEPS; i++) {
    const best = pickBestTap(dataSource, nextLevels, pool, statKey);
    if (!best) {
      break;
    }
    pool = subtractMats(pool, best.cost);
    nextLevels.set(best.key, (nextLevels.get(best.key) ?? 0) + 1);
  }
  return nextLevels;
};

// Builds one candidate option. With a `seedKey`, that piece is pushed as
// far as the WHOLE pool allows first (guaranteeing it's the option's
// headline pick), then whatever's left over runs through the same greedy
// fill as everywhere else — which is how a seeded option ends up multi
// equipment, e.g. Wing (seed) now + Helm from the leftover Astral Stone.
// Without a seed it's just the unweighted greedy baseline.
const buildSuggestionOption = (
  dataSource: CommonEquipmentCalculator[],
  ownedResources: TableMaterialList,
  statKey: keyof CommonItemStats,
  seedKey?: string
): SuggestionOption | undefined => {
  let levels = new Map<string, number>();
  dataSource.forEach((row) => levels.set(row.key, row.from));
  let remaining = ownedResources;

  if (seedKey) {
    const seedRow = dataSource.find((row) => row.key === seedKey);
    if (!seedRow) {
      return undefined;
    }
    let to = seedRow.from;
    let cost = EMPTY_CONVERSION_MATS;
    while (to < seedRow.max) {
      const nextCost = sumMats(
        cost,
        computeConversionMats(seedRow.equipment, to, to + 1)
      );
      if (!canAffordMats(remaining, nextCost)) {
        break;
      }
      cost = nextCost;
      to += 1;
    }
    if (to === seedRow.from) {
      return undefined; // can't even afford the seed's first tap
    }
    levels.set(seedKey, to);
    remaining = subtractMats(remaining, cost);
  }

  levels = runGreedyFill(dataSource, levels, remaining, statKey);

  const rows: SuggestionRow[] = dataSource
    .filter((row) => (levels.get(row.key) ?? row.from) > row.from)
    .map((row) => {
      const to = levels.get(row.key) ?? row.from;
      return {
        key: row.key,
        equipment: row.equipment,
        from: row.from,
        to,
        gain: getStatGain(row.equipment, row.from, to, statKey),
        cost: computeConversionMats(row.equipment, row.from, to),
      };
    })
    .sort((a, b) => b.gain - a.gain);

  if (rows.length === 0) {
    return undefined;
  }

  return {
    key: rows
      .map((row) => `${row.key}:${row.to}`)
      .sort()
      .join("|"),
    rows,
    totalGain: rows.reduce((sum, row) => sum + row.gain, 0),
    totalCost: rows.reduce(
      (sum, row) => sumMats(sum, row.cost),
      EMPTY_CONVERSION_MATS
    ),
  };
};

// Generates up to MAX_OPTIONS distinct ways to spend the pool: the
// unweighted greedy baseline, plus one option per equipment piece seeded to
// go as far as the whole pool allows before the leftover is greedy-filled
// across everything else. Different seeds often converge on the same final
// allocation (deduped by composition signature, keeping the better-gain
// copy) — this is a heuristic search over plausible strategies, not an
// exhaustive optimum, but it's what surfaces alternatives like "commit to
// Wing first" vs. "commit to Helm first" as distinct, comparable options.
const computeSuggestionOptions = (
  dataSource: CommonEquipmentCalculator[],
  ownedResources: TableMaterialList,
  statKey: keyof CommonItemStats
): SuggestionOption[] => {
  const seeds: (string | undefined)[] = [
    undefined,
    ...dataSource.map((row) => row.key),
  ];

  const bySignature = new Map<string, SuggestionOption>();
  seeds.forEach((seedKey) => {
    const option = buildSuggestionOption(
      dataSource,
      ownedResources,
      statKey,
      seedKey
    );
    if (!option) {
      return;
    }
    const existing = bySignature.get(option.key);
    if (!existing || option.totalGain > existing.totalGain) {
      bySignature.set(option.key, option);
    }
  });

  return Array.from(bySignature.values())
    .sort((a, b) => b.totalGain - a.totalGain)
    .slice(0, MAX_OPTIONS);
};

// Greedily taps `equipment` from `from` upward, one level at a time, for as
// long as the running total stays within `owned` — used only by Plan B, to
// find each piece's own next milestone independent of any chosen option.
const getMaxAffordableLevel = (
  equipment: EQUIPMENT,
  from: number,
  max: number,
  owned: TableMaterialList
): { to: number; cost: TableMaterialList } => {
  let to = from;
  let cost = EMPTY_CONVERSION_MATS;
  while (to < max) {
    const nextCost = sumMats(
      cost,
      computeConversionMats(equipment, to, to + 1)
    );
    if (!canAffordMats(owned, nextCost)) {
      break;
    }
    cost = nextCost;
    to += 1;
  }
  return { to, cost };
};

// Plan B is a full option too — same shape as the affordable table — for
// *pending* Option 1 in favor of saving up for a set that costs more than
// currently owned but pays off more than Option 1's total. Built by taking
// one equipment piece, pushing it exactly ONE tap past what it could reach
// on its own with the whole pool (the cheapest "reach" beyond what's
// already affordable), then greedy-filling the rest with whatever of the
// pool that seed didn't need — e.g. Wing pushed to Legend+3 (one past its
// own +2 ceiling) leaves enough Astral Powder untouched for Helm to still
// tag along. Only kept if it (a) genuinely needs more than owned somewhere
// — otherwise it already belongs in the affordable table — and (b) beats
// Option 1's total, since there's no point saving for something worse.
const buildPlanBOption = (
  dataSource: CommonEquipmentCalculator[],
  ownedResources: TableMaterialList,
  statKey: keyof CommonItemStats,
  seedKey: string
): { option: SuggestionOption; shortfall: number } | undefined => {
  const seedRow = dataSource.find((row) => row.key === seedKey);
  if (!seedRow) {
    return undefined;
  }

  const { to: affordableTo } = getMaxAffordableLevel(
    seedRow.equipment,
    seedRow.from,
    seedRow.max,
    ownedResources
  );
  if (affordableTo >= seedRow.max) {
    return undefined; // already maxed on its own, nothing further to reach for
  }

  const extendedTo = affordableTo + 1;
  const extendedCost = computeConversionMats(
    seedRow.equipment,
    seedRow.from,
    extendedTo
  );
  if (canAffordMats(ownedResources, extendedCost)) {
    return undefined; // already affordable — belongs in the main table, not here
  }

  const levels = new Map<string, number>();
  dataSource.forEach((row) => levels.set(row.key, row.from));
  levels.set(seedKey, extendedTo);

  const leftover = clampSubtractMats(ownedResources, extendedCost);
  const filledLevels = runGreedyFill(
    dataSource.filter((row) => row.key !== seedKey),
    levels,
    leftover,
    statKey
  );

  const rows: SuggestionRow[] = dataSource
    .filter((row) => (filledLevels.get(row.key) ?? row.from) > row.from)
    .map((row) => {
      const to = filledLevels.get(row.key) ?? row.from;
      return {
        key: row.key,
        equipment: row.equipment,
        from: row.from,
        to,
        gain: getStatGain(row.equipment, row.from, to, statKey),
        cost: computeConversionMats(row.equipment, row.from, to),
      };
    })
    .sort((a, b) => b.gain - a.gain);

  const option: SuggestionOption = {
    key: rows
      .map((row) => `${row.key}:${row.to}`)
      .sort()
      .join("|"),
    rows,
    totalGain: rows.reduce((sum, row) => sum + row.gain, 0),
    totalCost: rows.reduce(
      (sum, row) => sumMats(sum, row.cost),
      EMPTY_CONVERSION_MATS
    ),
  };

  return {
    option,
    shortfall: materialMagnitude(excessMats(extendedCost, ownedResources)),
  };
};

const computeSuggestionPlanB = (
  dataSource: CommonEquipmentCalculator[],
  ownedResources: TableMaterialList,
  statKey: keyof CommonItemStats,
  bestOptionTotalGain: number
): SuggestionOption[] => {
  const bySignature = new Map<
    string,
    { option: SuggestionOption; shortfall: number }
  >();

  dataSource.forEach((row) => {
    const built = buildPlanBOption(dataSource, ownedResources, statKey, row.key);
    if (!built || built.option.totalGain <= bestOptionTotalGain) {
      return;
    }
    const existing = bySignature.get(built.option.key);
    if (!existing || built.shortfall < existing.shortfall) {
      bySignature.set(built.option.key, built);
    }
  });

  return Array.from(bySignature.values())
    .sort((a, b) => a.shortfall - b.shortfall)
    .slice(0, MAX_PLAN_B_OPTIONS)
    .map((entry) => entry.option);
};

const computeSuggestionPlan = (
  dataSource: CommonEquipmentCalculator[],
  ownedResources: TableMaterialList,
  statKey: keyof CommonItemStats
): { options: SuggestionOption[]; planB: SuggestionOption[] } => {
  const options = computeSuggestionOptions(
    dataSource,
    ownedResources,
    statKey
  );
  const bestOptionTotalGain = options[0]?.totalGain ?? 0;
  const planB = computeSuggestionPlanB(
    dataSource,
    ownedResources,
    statKey,
    bestOptionTotalGain
  );
  return { options, planB };
};

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataConversionCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);
  const [selectStat, setSelectStat] = useState<{
    label: string;
    value: string;
  }>();
  const [selectPrev, setSelectPrev] = useState<{
    label: string;
    value: string;
  }>();

  // Suggestion tool: what the player currently owns/holds. Current levels
  // are NOT tracked separately — they're read straight off `dataSource`'s
  // own "From" column, the same one the Calculate table already edits.
  const [ownedResources, setOwnedResources] = useState<TableMaterialList>({
    ...EMPTY_CONVERSION_MATS,
  });
  const [priorityStat, setPriorityStat] = useState<{
    label: string;
    value: string;
  }>();

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);

  const getConversionMatsTable = useCallback(() => [], []);

  const reduceConversionRow = useCallback(
    (
      acc: TableMaterialList,
      _slice: never[],
      row: CommonEquipmentCalculator
    ): TableMaterialList =>
      sumMats(acc, computeConversionMats(row.equipment, row.from, row.to)),
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getConversionMatsTable,
    EMPTY_CONVERSION_MATS,
    reduceConversionRow
  );

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = getResource(TAB_KEY.miscConversion, equipment);
        const { dt1, dt2 } = getComparedData(tableHolder, from, to);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const tempComp = (str: string, arr: number[]) =>
    arr.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text>{str} succes rate from the smaller enhancement</Text>
        <Text>{arr.map((it) => `${it}%`).join(", ")}</Text>
      </div>
    ) : undefined;

  const weaponNotes = useMemo(() => {
    if (invalidDtSrc) {
      return;
    }
    let temp: {
      main: JSX.Element | undefined;
      second: JSX.Element | undefined;
    } = {
      main: undefined,
      second: undefined,
    };
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tempSlice = WEAP_ENH_SUC_RATE.slice(
          Math.max(from, 1) - 1,
          Math.min(to, 11) - 1
        );

        switch (equipment) {
          case EQUIPMENT.MAIN_WEAPON:
            temp.main = tempComp("Main Weapon", tempSlice);
            break;
          case EQUIPMENT.SECOND_WEAPON:
            temp.second = tempComp("Second Weapon", tempSlice);
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from:
        selectFrom < item.min
          ? item.min
          : selectFrom >= item.max
            ? item.max
            : selectFrom,
      to: selectTo > item.max ? item.max : selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const chartItems = useMemo((): ChartItem[] => {
    const stat = selectStat?.value.replace("Desc", "") as keyof CommonItemStats;
    const holder: ChartItem[] = [];

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = [{ ...EmptyCommonnStat, encLevel: "Buy" }].concat(
          getResource(TAB_KEY.miscConversion, equipment)
        );
        const clippedTable = tableHolder.slice(from, to + 1);
        let prevStatVal: number = 0;
        clippedTable.forEach((it, idx) => {
          const val =
            it[stat] !== undefined && typeof it?.[stat] === "number"
              ? (it[stat] as number)
              : 0;

          const dif = idx !== 0 ? val - prevStatVal : 0;
          prevStatVal = val;

          holder.push({
            enhance: it.encLevel,
            total: val,
            step: dif,
            type: equipment,
          });
        });
      }
    });
    return holder;
  }, [selectStat, selectedRowKeys, dataSource]);

  const statOptions = useMemo(
    () =>
      Object.entries(getAllStatDesc())
        .map(([key, value]) => ({ label: value.long, value: key }))
        .filter((it) => it.label !== "-"),
    []
  );

  // Reads current levels straight off dataSource's own "From" column (the
  // same column the Calculate table lets the player edit) and generates up
  // to MAX_OPTIONS ways to spend the owned resource pool — see
  // computeSuggestionPlan for the allocation itself.
  const suggestionPlan = useMemo((): {
    options: SuggestionOption[];
    planB: SuggestionOption[];
  } => {
    const statKey = priorityStat?.value.replace("Desc", "") as
      | keyof CommonItemStats
      | undefined;
    if (!statKey) {
      return { options: [], planB: [] };
    }
    return computeSuggestionPlan(dataSource, ownedResources, statKey);
  }, [priorityStat, dataSource, ownedResources]);

  // Pre-formats the suggestion engine's raw numeric rows into the display
  // strings ConversionSuggestionPanel expects — it's a purely presentational
  // component with no knowledge of this screen's level/material shapes.
  const statSuffix = priorityStat?.value.toLowerCase().includes("percent")
    ? "%"
    : "";

  const suggestionMaterials: ConversionSuggestionMaterialInput[] =
    MATERIAL_KEYS.map((key) => ({
      key,
      label: key,
      value: ownedResources[key],
      onChange: (value) =>
        setOwnedResources((prev) => ({ ...prev, [key]: value })),
    }));

  const formatOptions = (
    options: SuggestionOption[]
  ): ConversionSuggestionOption[] =>
    options.map((option, idx) => ({
      key: option.key,
      label: `Option ${idx + 1}`,
      totalLabel: `Total: +${option.totalGain.toLocaleString()}${statSuffix} using ${formatMats(
        option.totalCost
      )}`,
      rows: option.rows.map((row) => ({
        key: row.key,
        equipment: row.equipment,
        from: getLabel(row.from),
        to: getLabel(row.to),
        gainLabel: `+${row.gain.toLocaleString()}${statSuffix}`,
        materialsLabel: formatMats(row.cost),
      })),
    }));

  const suggestionOptions = formatOptions(suggestionPlan.options);
  const suggestionPlanB = formatOptions(suggestionPlan.planB);

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      customLabeling={(item) => getLabel(item)}
      invalid={invalidDtSrc}
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
        { label: "Accessories", keys: ["8", "9", "10", "11"] },
        { label: "WTD", keys: ["12", "13", "14"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 19,
        customLabeling: getLabel,
      }}
      mats={{ data: tableResource, hideZero: true }}
      stats={{ statDif }}
      extra={
        <>
          {weaponNotes?.main}
          {weaponNotes?.second}
          <ChartsCard
            title="Status Charts"
            data={chartItems}
            statVal={selectStat}
            setStatVal={setSelectStat}
            statPrev={selectPrev}
            setStatPrev={setSelectPrev}
          />
        </>
      }
      suggestion={
        <ConversionSuggestionPanel
          materials={suggestionMaterials}
          statOptions={statOptions}
          priorityStat={priorityStat}
          onPriorityStatChange={setPriorityStat}
          options={suggestionOptions}
          planB={suggestionPlanB}
        />
      }
    />
  );

  // Pure reference data — doesn't depend on any state, so this must not be
  // rebuilt on every click in the Calculate tab (antd's Collapse keeps
  // inactive panels mounted, so an unmemoized rebuild here still gets
  // reconciled on every state change elsewhere in the screen).
  const statContent = useMemo(
    () => (
    <StatReferenceTables
      entries={[
        {
          key: "1",
          label: "Armor",
          tables: [
            {
              label: "Helm",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.HELM),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Upper",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.UPPER),
              flags: {
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Lower",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.LOWER),
              flags: {
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Glove",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.GLOVE),
              flags: {
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Shoes",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.SHOES),
              flags: {
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
                moveSpeedPercentFlag: true,
              },
            },
          ],
        },
        {
          key: "2",
          label: "Weapon",
          tables: [
            {
              label: "Main",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.MAIN_WEAPON
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                cdmFlag: true,
              },
            },
            {
              label: "Second",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.SECOND_WEAPON
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                crtFlag: true,
              },
            },
          ],
        },
        {
          key: "3",
          label: "Accesories",
          tables: [
            {
              label: "Necklace",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.NECKLACE
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defFlag: true,
                magdefFlag: true,
              },
            },
            {
              label: "Earring",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.EARRING
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Ring",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.RING1),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
              },
            },
          ],
        },
        {
          key: "4",
          label: "WTD",
          tables: [
            {
              label: "Wing",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.WING),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                vitFlag: true,
                moveSpeedPercentFlag: true,
                moveSpeedPercentTownFlag: true,
              },
            },
            {
              label: "Tail",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.TAIL),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              },
            },
            {
              label: "Decal",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.DECAL),
              flags: {
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              },
            },
          ],
        },
      ]}
    />
    ),
    []
  );

  // Every equipment category's Mats panel is the same 3-table shape: an
  // Enhancement resource table (with its own note/success-rate blurb), an
  // Evo Legend table, and an Enhancement Legend table.
  const getEnhanceMatsGroup = ({
    enhanceFooter,
    enhanceData,
    enhanceNote,
    evoData,
    encLegendTiers,
  }: {
    enhanceFooter: string;
    enhanceData: Record<string, number>;
    enhanceNote: React.ReactNode;
    evoData: Record<string, number>;
    encLegendTiers: { title: string; data: Record<string, number> }[];
  }) => (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <div style={{ marginRight: 10, marginBottom: 10 }}>
        <MaterialListTable
          title="Enhancement"
          footer={enhanceFooter}
          data={enhanceData}
        />
        {enhanceNote}
      </div>
      <div style={{ marginRight: 10, marginBottom: 10 }}>
        <MaterialListTable title="Evo Legend" data={evoData} />
      </div>
      {encLegendTiers.map((tier) => (
        <div key={tier.title} style={{ marginRight: 10, marginBottom: 10 }}>
          <MaterialListTable title={tier.title} data={tier.data} />
        </div>
      ))}
    </div>
  );

  // Also pure reference data — same reasoning as statContent above.
  const matsContent = useMemo(() => {
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <>
            {getEnhanceMatsGroup({
              enhanceFooter: "Using Armor Fragment",
              enhanceData: {
                "Buy from Store": CONV_FRAG,
                "Every tap from +0 to +10": CONV_FRAG,
              },
              enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
              evoData: {
                "Astral Powder": EV_AST_POW_ARMOR,
                "Astral Stone": EV_AST_STONE,
              },
              encLegendTiers: [
                {
                  title: "Enhancement Legend (+1~+3)",
                  data: {
                    "Astral Powder": ENC_AST_POW_ARMOR,
                    "Astral Stone": ENC_AST_STONE_ARMOR,
                  },
                },
                {
                  title: "Enhancement Legend (+4~+6)",
                  data: {
                    "Astral Powder": ENC_AST_POW_ARMOR,
                    "Astral Stone": ENC_AST_STONE_ARMOR_MID,
                  },
                },
                {
                  title: "Enhancement Legend (+7)",
                  data: {
                    "Astral Powder": ENC_AST_POW_ARMOR_TOP,
                    "Astral Jewel": ENC_AST_JEWEL_ARMOR_TOP,
                  },
                },
              ],
            })}
            <Text>
              * Astral Jewel can be bought from the Conversion Shop: 1 Astral
              Jewel costs 5 Astral Stone (10/week limit), and 1 Astral Jewel
              can be exchanged back for 50 Astral Powder (unlimited).
            </Text>
          </>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Weapon Fragment",
          enhanceData: { "Every tap from +0 to +10": WEAP_FRAG },
          enhanceNote: (
            <>
              <Text>
                * You can buy Conversion Weapon box via Trading House, or Cherry
                store
              </Text>
              {tempComp("Conversion Weapon", WEAP_ENH_SUC_RATE)}
            </>
          ),
          evoData: { "Astral Powder": EV_AST_POW_WEAP, "Astral Stone": EV_AST_STONE },
          encLegendTiers: [
            {
              title: "Enhancement Legend (+1~+3)",
              data: {
                "Astral Powder": ENC_AST_POW_WEAP,
                "Astral Stone": ENC_AST_STONE_WEAP,
              },
            },
            {
              title: "Enhancement Legend (+4~+6)",
              data: {
                "Astral Powder": ENC_AST_POW_WEAP,
                "Astral Stone": ENC_AST_STONE_WEAP_MID,
              },
            },
          ],
        }),
      },
      {
        key: "3",
        label: "Accesories",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Acc Fragment",
          enhanceData: {
            "Buy from Store": CONV_FRAG,
            "Every tap from +0 to +10": CONV_FRAG,
          },
          enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
          evoData: { "Astral Powder": EV_AST_POW_ACC, "Astral Stone": EV_AST_STONE },
          encLegendTiers: [
            {
              title: "Enhancement Legend (+1~+3)",
              data: {
                "Astral Powder": ENC_AST_POW_ACC,
                "Astral Stone": ENC_AST_STONE_ACC,
              },
            },
            {
              title: "Enhancement Legend (+4~+6)",
              data: {
                "Astral Powder": ENC_AST_POW_ACC,
                "Astral Stone": ENC_AST_STONE_ACC_MID,
              },
            },
          ],
        }),
      },
      {
        key: "4",
        label: "WTD",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Wtd Fragment",
          enhanceData: {
            "Buy from Store": CONV_FRAG,
            "Every tap from +0 to +10": CONV_FRAG,
          },
          enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
          evoData: { "Astral Powder": EV_AST_POW_WTD, "Astral Stone": EV_AST_STONE },
          encLegendTiers: [
            {
              title: "Enhancement Legend (+1~+3)",
              data: {
                "Astral Powder": ENC_AST_POW_WTD,
                "Astral Stone": ENC_AST_STONE_WTD,
              },
            },
            {
              title: "Enhancement Legend (+4~+6)",
              data: {
                "Astral Powder": ENC_AST_POW_WTD,
                "Astral Stone": ENC_AST_STONE_WTD_MID,
              },
            },
          ],
        }),
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemMats} size="small" />
      </div>
    );
  }, []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: statContent,
    },
    {
      key: "2",
      label: "Mats",
      children: matsContent,
    },
    {
      key: "3",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default ConversionContent;
