import { renderHook } from "@testing-library/react";
import { CommonItemStats } from "../interface/ItemStat.interface";
import {
  JadeEnhanceGroup,
  JadeEnhanceListItem,
  reduceJadeEnhanceList,
  useRangeAccumulator,
  useRangeStatDiff,
} from "./useJadeCalculator";

// Cumulative stats per level: index = enhancement level.
const table: CommonItemStats[] = [
  { encLevel: "0", crt: 0, fd: 0 },
  { encLevel: "1", crt: 10, fd: 1 },
  { encLevel: "2", crt: 25, fd: 3 },
  { encLevel: "3", crt: 45, fd: 6 },
];

describe("useRangeStatDiff", () => {
  test("returns the stat gain between From and To", () => {
    const { result } = renderHook(() => useRangeStatDiff([1, 3], false, table));
    expect(result.current).toMatchObject({ crt: 35, fd: 5 });
  });

  test("starting from level 0 gives the full value at To", () => {
    const { result } = renderHook(() => useRangeStatDiff([0, 2], false, table));
    expect(result.current).toMatchObject({ crt: 25, fd: 3 });
  });

  test("returns zero stats when the range is invalid or out of the table", () => {
    const invalid = renderHook(() => useRangeStatDiff([1, 3], true, table));
    expect(invalid.result.current).toMatchObject({ crt: 0, fd: 0 });

    const outside = renderHook(() => useRangeStatDiff([0, 10], false, table));
    expect(outside.result.current).toMatchObject({ crt: 0, fd: 0 });
  });
});

describe("useRangeAccumulator", () => {
  // Materials per step: index i = cost to go from level i to i + 1.
  const mats = [{ gold: 1 }, { gold: 2 }, { gold: 4 }, { gold: 8 }];
  const sumGold = (acc: number, slice: { gold: number }[]) =>
    slice.reduce((total, item) => total + item.gold, acc);

  test("sums the steps between From and To", () => {
    const { result } = renderHook(() =>
      useRangeAccumulator([1, 3], false, mats, 0, sumGold)
    );
    expect(result.current).toBe(6);
  });

  test("returns the initial value when invalid", () => {
    const { result } = renderHook(() =>
      useRangeAccumulator([1, 3], true, mats, 0, sumGold)
    );
    expect(result.current).toBe(0);
  });

  test("passes ctx to finalize", () => {
    const { result } = renderHook(() =>
      useRangeAccumulator(
        [0, 2],
        false,
        mats,
        0,
        sumGold,
        { multiplier: 10 },
        (acc, ctx) => acc * ctx.multiplier
      )
    );
    expect(result.current).toBe(30);
  });
});

describe("reduceJadeEnhanceList", () => {
  type Group = JadeEnhanceGroup<JadeEnhanceListItem>;

  const collect = (
    groups: Group[],
    options?: Parameters<typeof reduceJadeEnhanceList>[2]
  ) => {
    const calls: { type: string; amt: number; range: [number, number] }[] = [];
    const errors = reduceJadeEnhanceList(
      groups,
      ({ type, amt, range }) => calls.push({ type, amt, range }),
      options
    );
    return { calls, errors };
  };

  test("passes every filled row to onItem with no errors", () => {
    const { calls, errors } = collect([
      {
        type: "Attack",
        listEnhance: [
          { amt: 2, range: [0, 5] },
          { amt: 1, range: [5, 10] },
        ],
      },
      { type: "Defense", listEnhance: [{ amt: 3, range: [1, 2] }] },
    ]);
    expect(errors).toEqual([]);
    expect(calls).toEqual([
      { type: "Attack", amt: 2, range: [0, 5] },
      { type: "Attack", amt: 1, range: [5, 10] },
      { type: "Defense", amt: 3, range: [1, 2] },
    ]);
  });

  test("reports empty groups", () => {
    const { errors } = collect([
      { type: null, listEnhance: null },
      { type: null, listEnhance: [{ amt: 1, range: [0, 1] }] },
      { type: "Attack", listEnhance: [] },
    ]);
    expect(errors).toEqual([
      "Nothing to calculate in Enhance 1",
      "Empty Type in Enhance 2",
      "Empty List in Enhance 3",
    ]);
  });

  test("reports untouched and half-filled rows by position", () => {
    const { calls, errors } = collect([
      {
        type: "Attack",
        listEnhance: [
          { amt: null, range: null },
          { amt: null, range: [0, 3] },
          { amt: 2, range: [0, 3] },
        ],
      },
    ]);
    expect(errors).toEqual([
      "Nothing to calculate on Enhance 1 list 1",
      "The Amount in Enhance 1, item 2 haven't inputted properly",
    ]);
    expect(calls).toHaveLength(1);
  });

  test("defaults a missing range to [0, 0] unless a range is required", () => {
    const groups: Group[] = [{ type: "Attack", listEnhance: [{ amt: 4 }] }];

    const optional = collect(groups);
    expect(optional.errors).toEqual([]);
    expect(optional.calls).toEqual([{ type: "Attack", amt: 4, range: [0, 0] }]);

    const required = collect(groups, { requireRange: true });
    expect(required.calls).toEqual([]);
    expect(required.errors).toEqual([
      "The Range in Enhance 1, item 1 haven't inputted properly",
    ]);
  });

  test("emptyRow 'amount' treats a row without amount as untouched", () => {
    const groups: Group[] = [
      { type: "Attack", listEnhance: [{ amt: null, range: [0, 3] }] },
    ];
    expect(collect(groups, { emptyRow: "amount" }).errors).toEqual([
      "Nothing to calculate on Enhance 1 list 1",
    ]);
  });

  test("collects errors pushed from onItem", () => {
    const errors = reduceJadeEnhanceList(
      [{ type: "Attack", listEnhance: [{ amt: 1, range: [3, 1] }] }],
      ({ range, groupNo, itemNo, pushError }) => {
        if (range[1] <= range[0]) {
          pushError(`Bad range in Enhance ${groupNo}, item ${itemNo}`);
        }
      }
    );
    expect(errors).toEqual(["Bad range in Enhance 1, item 1"]);
  });
});
