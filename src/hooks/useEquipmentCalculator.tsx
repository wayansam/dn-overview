import { useMemo } from "react";
import { EmptyCommonnStat } from "../constants/Common.constants";
import { EQUIPMENT } from "../constants/InGame.constants";
import { CommonItemStats } from "../interface/ItemStat.interface";
import { combineEqStats, getComparedData } from "../utils/common.util";

interface RangeRow {
  key: string;
  from: number;
  to: number;
}

// Resolves selectedRowKeys to their full dataSource rows — the "find each
// selected key, skip the ones that no longer exist" boilerplate every
// equipment calculator repeats before it can aggregate materials/stats.
export function useSelectedRows<T extends { key: string }>(
  selectedRowKeys: React.Key[],
  dataSource: T[]
): T[] {
  return useMemo(() => {
    const rows: T[] = [];
    selectedRowKeys.forEach((key) => {
      const found = dataSource.find((dt) => dt.key === key);
      if (found) {
        rows.push(found);
      }
    });
    return rows;
  }, [selectedRowKeys, dataSource]);
}

// True if any selected row matches the predicate — the shared shape behind
// invalid-range checks and the "might fail / might break" threshold alerts.
export function useSelectionFlag<T extends RangeRow>(
  selectedRowKeys: React.Key[],
  dataSource: T[],
  predicate: (row: T) => boolean
): boolean {
  return useMemo(
    () =>
      selectedRowKeys.some((item) => {
        const found = dataSource.find((dt) => dt.key === item);
        return !!found && predicate(found);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedRowKeys, dataSource]
  );
}

export function useInvalidRange<T extends RangeRow>(
  selectedRowKeys: React.Key[],
  dataSource: T[]
): boolean {
  return useSelectionFlag(selectedRowKeys, dataSource, (row) => row.to <= row.from);
}

interface EquipmentRow extends RangeRow {
  equipment: EQUIPMENT;
}

// The repeated "diff the stat table between From and To, sum across all
// selected rows" computation used by every equipment calculator that has a
// stat table to diff against. Pass the per-equipment table lookup as
// `getStatsTable` — the aggregation loop itself is identical everywhere.
export function useEquipmentStatDiff<T extends EquipmentRow>(
  selectedRowKeys: React.Key[],
  dataSource: T[],
  invalid: boolean,
  getStatsTable: (equipment: EQUIPMENT) => CommonItemStats[]
): CommonItemStats {
  const selectedRows = useSelectedRows(selectedRowKeys, dataSource);

  return useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalid) {
      return temp;
    }

    selectedRows.forEach(({ equipment, from, to }) => {
      const tableHolder = getStatsTable(equipment);
      const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
      if (dt2) {
        const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
        temp = combineEqStats(temp, dt, "add");
      }
    });

    return temp;
  }, [selectedRows, invalid, getStatsTable]);
}
