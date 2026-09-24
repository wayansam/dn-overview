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

export interface JadeEnhanceListItem {
  range?: [number, number] | null;
  amt?: number | null;
}

export interface JadeEnhanceGroup<
  TItem extends JadeEnhanceListItem = JadeEnhanceListItem
> {
  type: string | null;
  listEnhance: TItem[] | null;
}

// The "Enhance" tab's nested form list (one group per jade type, each with a
// list of amount+range rows) validated the same way on every jade screen:
// report what's missing per group and per row, and hand the rows that are
// filled in to the caller. Only the per-row accumulation differs per jade,
// so that stays in the screen as `onItem` — this owns the walk and the
// warning messages shown under the form.
export function reduceJadeEnhanceList<TItem extends JadeEnhanceListItem>(
  groups: Array<JadeEnhanceGroup<TItem>>,
  onItem: (ctx: {
    type: string;
    item: TItem;
    amt: number;
    range: [number, number];
    // 1-based positions, for messages that name the row (e.g. "in Enhance 1, item 2")
    groupNo: number;
    itemNo: number;
    pushError: (message: string) => void;
  }) => void,
  // Screens whose rows always span a range (Lunar) treat a missing range as
  // incomplete input; ones where it is optional (Collapse) default to [0, 0].
  options: {
    requireRange?: boolean;
    // What counts as an untouched row: Lunar's rows need both amount and
    // range, Collapse's only an amount.
    emptyRow?: "amountAndRange" | "amount";
  } = {}
): string[] {
  const errors: string[] = [];
  const pushError = (message: string) => errors.push(message);

  groups.forEach((group, idx) => {
    if (!group || (!group?.type && !group?.listEnhance)) {
      errors.push(`Nothing to calculate in Enhance ${idx + 1}`);
      return;
    }
    if (!group?.type || !group?.listEnhance || group.listEnhance.length === 0) {
      const msg = !group?.type ? "Type" : "List";
      errors.push(`Empty ${msg} in Enhance ${idx + 1}`);
      return;
    }

    group.listEnhance.forEach((item, i) => {
      const missingRange = options.requireRange && !item?.range;
      const untouched =
        options.emptyRow === "amount"
          ? !item?.amt
          : !item?.amt && !item?.range;
      if (!item || untouched) {
        errors.push(
          `Nothing to calculate on Enhance ${idx + 1} list ${i + 1}`
        );
      } else if (item?.amt && !missingRange) {
        onItem({
          type: group.type as string,
          item,
          amt: item.amt,
          range: item.range ?? [0, 0],
          groupNo: idx + 1,
          itemNo: i + 1,
          pushError,
        });
      } else {
        const emsg = !item?.amt ? "Amount" : "Range";
        errors.push(
          `The ${emsg} in Enhance ${idx + 1}, item ${
            i + 1
          } haven't inputted properly`
        );
      }
    });
  });

  return errors;
}
