import { ColumnsType } from "antd/es/table";

export interface CraftMaterialField<T> {
  dataIndex: keyof T;
  label: string;
  shortLabel: string;
}

export const makeCraftMaterialColumns = <T extends { encLevel: number }>(
  fields: CraftMaterialField<T>[]
): ColumnsType<T> => [
  {
    title: "Enhancement",
    dataIndex: "encLevel",
  },
  {
    title: (
      <div>
        {fields.map((field) => (
          <p key={String(field.dataIndex)}>{field.label}</p>
        ))}
      </div>
    ),
    responsive: ["xs"],
    render: (_, record) => (
      <div>
        {fields.map((field) => (
          <p key={String(field.dataIndex)}>
            {String(record[field.dataIndex])}
            {field.shortLabel}
          </p>
        ))}
      </div>
    ),
  },
  ...fields.map((field) => ({
    title: field.label,
    dataIndex: field.dataIndex as string,
    responsive: ["sm"] as Array<"sm">,
  })),
];
