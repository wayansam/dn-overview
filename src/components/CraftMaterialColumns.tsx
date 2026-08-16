import { ColumnsType } from "antd/es/table";
import { getTextEmpty } from "../utils/common.util";

export interface CraftMaterialField<T> {
  dataIndex: keyof T;
  label: string;
  shortLabel: string;
  tailText?: string;
}

export const makeCraftMaterialColumns = <T extends { encLevel: number | string }>(
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
            {getTextEmpty({
              txt: record[field.dataIndex] as unknown as string | number,
              tailText: field.tailText,
            })}
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
    render: (_: unknown, record: T) =>
      getTextEmpty({
        txt: record[field.dataIndex] as unknown as string | number,
        tailText: field.tailText,
      }),
  })),
];
