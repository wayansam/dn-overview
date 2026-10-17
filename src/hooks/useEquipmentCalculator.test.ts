import { renderHook } from "@testing-library/react";
import { EQUIPMENT } from "../constants/InGame.constants";
import { CommonItemStats } from "../interface/ItemStat.interface";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
  useSelectedRows,
  useSelectionFlag,
} from "./useEquipmentCalculator";

interface Row {
  key: string;
  equipment: EQUIPMENT;
  from: number;
  to: number;
}

const rows: Row[] = [
  { key: "helm", equipment: EQUIPMENT.HELM, from: 0, to: 2 },
  { key: "upper", equipment: EQUIPMENT.UPPER, from: 1, to: 3 },
  { key: "broken", equipment: EQUIPMENT.LOWER, from: 3, to: 3 },
];

// Cumulative stats per level; Upper gives twice what Helm does.
const statTables: Partial<Record<EQUIPMENT, CommonItemStats[]>> = {
  [EQUIPMENT.HELM]: [
    { encLevel: "0", crt: 0 },
    { encLevel: "1", crt: 10 },
    { encLevel: "2", crt: 30 },
    { encLevel: "3", crt: 60 },
  ],
  [EQUIPMENT.UPPER]: [
    { encLevel: "0", crt: 0 },
    { encLevel: "1", crt: 20 },
    { encLevel: "2", crt: 60 },
    { encLevel: "3", crt: 120 },
  ],
};
const getStatsTable = (eq: EQUIPMENT) => statTables[eq] ?? [];

describe("useSelectedRows", () => {
  test("resolves keys in selection order and skips missing ones", () => {
    const { result } = renderHook(() =>
      useSelectedRows(["upper", "gone", "helm"], rows)
    );
    expect(result.current.map((r) => r.key)).toEqual(["upper", "helm"]);
  });
});

describe("useSelectionFlag / useInvalidRange", () => {
  test("is true only if a selected row matches", () => {
    const { result } = renderHook(() =>
      useSelectionFlag(["helm", "upper"], rows, (row) => row.to === 3)
    );
    expect(result.current).toBe(true);
  });

  test("flags selected rows whose To is not above From", () => {
    expect(renderHook(() => useInvalidRange(["helm"], rows)).result.current).toBe(
      false
    );
    expect(
      renderHook(() => useInvalidRange(["helm", "broken"], rows)).result.current
    ).toBe(true);
  });

  test("ignores invalid rows that are not selected", () => {
    expect(
      renderHook(() => useInvalidRange(["helm", "upper"], rows)).result.current
    ).toBe(false);
  });
});

describe("useEquipmentStatDiff", () => {
  test("sums the From→To gain across selected equipment", () => {
    const { result } = renderHook(() =>
      useEquipmentStatDiff(["helm", "upper"], rows, false, getStatsTable)
    );
    // Helm 0→2: 30, Upper 1→3: 120 - 20 = 100
    expect(result.current.crt).toBe(130);
  });

  test("returns zero stats when invalid", () => {
    const { result } = renderHook(() =>
      useEquipmentStatDiff(["helm"], rows, true, getStatsTable)
    );
    expect(result.current.crt).toBe(0);
  });

  test("skips equipment without a stat table", () => {
    const { result } = renderHook(() =>
      useEquipmentStatDiff(["helm", "broken"], rows, false, getStatsTable)
    );
    expect(result.current.crt).toBe(30);
  });
});

describe("useEquipmentAccumulator", () => {
  // Materials per step: index i = cost from level i to i + 1.
  const matTable = [{ gold: 1 }, { gold: 2 }, { gold: 4 }];
  const getTable = () => matTable;
  const reduceRow = (acc: number, slice: { gold: number }[]) =>
    slice.reduce((total, item) => total + item.gold, acc);

  test("folds each selected row's From→To slice", () => {
    const { result } = renderHook(() =>
      useEquipmentAccumulator(["helm", "upper"], rows, false, getTable, 0, reduceRow)
    );
    // Helm 0→2: 1 + 2, Upper 1→3: 2 + 4
    expect(result.current).toBe(9);
  });

  test("passes the row itself to reduceRow", () => {
    const seen: string[] = [];
    renderHook(() =>
      useEquipmentAccumulator(
        ["upper", "helm"],
        rows,
        false,
        getTable,
        0,
        (acc: number, _slice: unknown[], row: Row) => {
          seen.push(row.key);
          return acc;
        }
      )
    );
    expect(seen).toEqual(["upper", "helm"]);
  });

  test("applies finalize with ctx once", () => {
    const finalize = vi.fn((acc: number, ctx: { bonus: number }) => acc + ctx.bonus);
    const { result } = renderHook(() =>
      useEquipmentAccumulator(
        ["helm"],
        rows,
        false,
        getTable,
        0,
        reduceRow,
        { bonus: 100 },
        finalize
      )
    );
    expect(result.current).toBe(103);
    expect(finalize).toHaveBeenCalledTimes(1);
  });

  test("returns the initial value when invalid", () => {
    const { result } = renderHook(() =>
      useEquipmentAccumulator(["helm"], rows, true, getTable, 0, reduceRow)
    );
    expect(result.current).toBe(0);
  });
});
