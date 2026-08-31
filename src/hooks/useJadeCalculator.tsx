import { useMemo } from "react";
import { EmptyCommonnStat } from "../constants/Common.constants";
import { CommonItemStats } from "../interface/ItemStat.interface";
import { combineEqStats, getComparedData } from "../utils/common.util";

// The single-range sibling of useEquipmentStatDiff: diffs one stat table
// between From and To instead of summing that diff across selected
// equipment rows. Jade screens whose stat calc is a plain range diff (no
// screen-level override) can use this directly; ones with a bespoke
// adjustment (e.g. a craft toggle that shows an absolute value instead of a
// diff) keep their own useMemo rather than being forced through here.
export function useRangeStatDiff(
  range: [number, number],
  invalid: boolean,
  table: CommonItemStats[]
): CommonItemStats {
  return useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalid) {
      return temp;
    }
    const { dt1, dt2 } = getComparedData(table, range[0] + 1, range[1] + 1);
    if (dt2) {
      const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
      temp = combineEqStats(temp, dt, "add");
    }
    return temp;
  }, [range, invalid, table]);
}

// Jade calculators work over a single enhancement range (a vertical Slider,
// or a From/To Select pair), not a multi-row equipment table — so unlike
// useEquipmentAccumulator there's no row/equipment lookup, just "slice one
// table by one range and fold it." `ctx`/`finalize` carry the same
// screen-level state (e.g. a craft-mats checkbox) through to a post-slice
// adjustment, same role they play in useEquipmentAccumulator.
export function useRangeAccumulator<TSlice, TAcc, Ctx = undefined>(
  range: [number, number],
  invalid: boolean,
  table: TSlice[],
  initial: TAcc,
  reduceSlice: (acc: TAcc, slice: TSlice[]) => TAcc,
  ctx?: Ctx,
  finalize?: (acc: TAcc, ctx: Ctx) => TAcc
): TAcc {
  return useMemo(() => {
    if (invalid) {
      return initial;
    }
    const slice = table.slice(range[0], range[1]);
    const acc = reduceSlice(initial, slice);
    return finalize ? finalize(acc, ctx as Ctx) : acc;
  }, [range, invalid, table, initial, reduceSlice, ctx, finalize]);
}
