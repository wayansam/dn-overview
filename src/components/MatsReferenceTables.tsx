import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import {
  CraftMaterialField,
  makeCraftMaterialColumns,
} from "./CraftMaterialColumns";

export interface MatsTableEntry<T> {
  key: string;
  label: string;
  dataSource: T[];
  fields: CraftMaterialField<T>[];
  footer?: string;
}

export interface MatsNoteEntry {
  key: string;
  label: string;
  content: React.ReactNode;
}

export type MatsReferenceEntry<T> = MatsTableEntry<T> | MatsNoteEntry;

const isNoteEntry = <T,>(
  entry: MatsReferenceEntry<T>
): entry is MatsNoteEntry => "content" in entry;

interface MatsReferenceTablesProps<T extends { encLevel: number | string }> {
  entries: MatsReferenceEntry<T>[];
  defaultActiveKey?: string | string[];
}

const MatsReferenceTables = <T extends { encLevel: number | string }>({
  entries,
  defaultActiveKey,
}: MatsReferenceTablesProps<T>) => {
  const items: CollapseProps["items"] = entries.map((entry) =>
    isNoteEntry(entry)
      ? { key: entry.key, label: entry.label, children: entry.content }
      : {
          key: entry.key,
          label: entry.label,
          children: (
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              size={"small"}
              dataSource={entry.dataSource}
              columns={makeCraftMaterialColumns(entry.fields)}
              pagination={false}
              bordered
              footer={entry.footer ? () => entry.footer : undefined}
            />
          ),
        }
  );

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <Collapse
        items={items}
        size="small"
        defaultActiveKey={defaultActiveKey}
      />
    </div>
  );
};

export default MatsReferenceTables;
