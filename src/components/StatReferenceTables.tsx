import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import { columnCommonItemFlag, CommonItemStats } from "../interface/ItemStat.interface";
import { getColumnsStats } from "../utils/common.util";

export interface StatReferenceEntry {
  key: string;
  label: string;
  dataSource: CommonItemStats[];
  flags: columnCommonItemFlag;
}

interface StatReferenceTablesProps {
  entries: StatReferenceEntry[];
}

const StatReferenceTables: React.FC<StatReferenceTablesProps> = ({
  entries,
}) => {
  const items: CollapseProps["items"] = entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    children: (
      <Table
        style={{ marginRight: 10, marginBottom: 10 }}
        size={"small"}
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
