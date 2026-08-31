import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import { columnCommonItemFlag, CommonItemStats } from "../interface/ItemStat.interface";
import { getColumnsStats } from "../utils/common.util";

export interface StatReferenceSingleEntry {
  key: string;
  label: string;
  dataSource: CommonItemStats[];
  flags: columnCommonItemFlag;
}

// A group of tables shown side-by-side under one panel (e.g. Conversion's
// "Armor" panel showing Helm/Upper/Lower/Glove/Shoes together) instead of
// one table per panel.
export interface StatReferenceGroupEntry {
  key: string;
  label: string;
  tables: {
    label: string;
    dataSource: CommonItemStats[];
    flags: columnCommonItemFlag;
    footer?: string;
  }[];
}

export type StatReferenceEntry = StatReferenceSingleEntry | StatReferenceGroupEntry;

const isGroupEntry = (
  entry: StatReferenceEntry
): entry is StatReferenceGroupEntry => "tables" in entry;

interface StatReferenceTablesProps {
  entries: StatReferenceEntry[];
}

const StatReferenceTables: React.FC<StatReferenceTablesProps> = ({
  entries,
}) => {
  const items: CollapseProps["items"] = entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    children: isGroupEntry(entry) ? (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {entry.tables.map((table) => (
          <Table
            key={table.label}
            style={{ marginRight: 10, marginBottom: 10 }}
            title={() => table.label}
            footer={table.footer ? () => table.footer : undefined}
            size={"small"}
            rowKey="encLevel"
            dataSource={table.dataSource}
            columns={getColumnsStats(table.flags)}
            pagination={false}
            bordered
          />
        ))}
      </div>
    ) : (
      <Table
        style={{ marginRight: 10, marginBottom: 10 }}
        size={"small"}
        rowKey="encLevel"
        dataSource={entry.dataSource}
        columns={getColumnsStats(entry.flags)}
        pagination={false}
        bordered
      />
    ),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <Collapse items={items} size="small" />
    </div>
  );
};

export default StatReferenceTables;
