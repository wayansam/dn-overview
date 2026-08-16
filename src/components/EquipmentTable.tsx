import { Form, FormInstance, Select, Switch } from "antd";
import Table, { ColumnGroupType, ColumnType } from "antd/es/table";
import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { EQUIPMENT } from "../constants/InGame.constants";

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export interface EquipmentTableCalculator {
  key: string;
  min: number;
  max: number;
  from: number;
  to: number;
  equipment: EQUIPMENT;
}

export interface BasicOpt {
  option: Array<{ label: string; value: number }>;
  key: EQUIPMENT[];
}

export interface SelectColumnConfig<T> {
  type: "select";
  dataIndex: keyof T;
  label: string;
  getOptions: (record: T) => Array<{ label: string; value: number }>;
}

export interface SwitchColumnConfig<T> {
  type: "switch";
  dataIndex: keyof T;
  label: string;
}

export type ExtraColumnConfig<T> = SelectColumnConfig<T> | SwitchColumnConfig<T>;

// Builds a select-column config from a per-equipment option list, e.g. craft tiers.
export const makeEquipmentSelectColumn = <T extends EquipmentTableCalculator>(
  dataIndex: keyof T,
  label: string,
  list: BasicOpt[]
): SelectColumnConfig<T> => ({
  type: "select",
  dataIndex,
  label,
  getOptions: (record) =>
    list.find((it) => it.key.includes(record.equipment))?.option ?? [],
});

interface EquipmentTableProps<T extends EquipmentTableCalculator> {
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
  dataSource: T[];
  setDataSource: React.Dispatch<React.SetStateAction<T[]>>;
  customLabeling?: (item: number) => string;
  // Opt-in columns beyond Equipment/From/To — e.g. a craft tier select or a boolean toggle.
  // Items only appear on tables whose data actually provides the field, so older
  // equipment calculators are unaffected unless they opt in.
  extraColumns?: ExtraColumnConfig<T>[];
}

const getLabel = (item: number) => {
  return `+${item}`;
};

export const getListOpt = (
  start: number,
  end: number,
  customLabeling?: (item: number) => string
) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: customLabeling ? customLabeling(item) : getLabel(item),
    value: item,
  }));

type RangeKind = "from" | "to";

const EquipmentTable = <T extends EquipmentTableCalculator>({
  selectedRowKeys,
  setSelectedRowKeys,
  dataSource,
  setDataSource,
  customLabeling,
  extraColumns = [],
}: EquipmentTableProps<T>) => {
  interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T) => void;
    rangeKind?: RangeKind;
    selectConfig?: SelectColumnConfig<T>;
    isSwitch?: boolean;
  }

  const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    rangeKind,
    selectConfig,
    isSwitch,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const [selectItem, setSelectItem] = useState<number>(0);
    const form = useContext(EditableContext)!;

    useEffect(() => {
      if (rangeKind === "from") {
        setSelectItem(record.from);
      }
      if (rangeKind === "to") {
        setSelectItem(record.to);
      }
      if (selectConfig) {
        setSelectItem(Number(record[selectConfig.dataIndex]) || 0);
      }
    }, [record, rangeKind, selectConfig]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const handleChange = (value: number) => {
      setSelectItem(value);
    };

    const saveSelect = () => {
      toggleEdit();
      handleSave({ ...record, [dataIndex]: selectItem });
    };

    let childNode = children;

    const findFr = record?.from ?? 0;
    const findTo = record?.to ?? 0;

    const renderCustom = (cust: any) => {
      if (Array.isArray(cust) && cust.length > 0 && typeof cust[1] === "number") {
        if (selectConfig) {
          const found = selectConfig
            .getOptions(record)
            .find((it) => it.value === cust[1]);
          return found ? found.label : "No Option";
        }
        if (rangeKind) {
          return customLabeling ? customLabeling(cust[1]) : getLabel(cust[1]);
        }
      }
      return cust;
    };

    if (isSwitch) {
      childNode = (
        <Switch
          checked={!!record[dataIndex]}
          onChange={(checked) =>
            handleSave({ ...record, [dataIndex]: checked } as T)
          }
        />
      );
    } else if (editable) {
      childNode = editing ? (
        <Select
          defaultValue={selectItem}
          style={{ width: 120 }}
          onChange={handleChange}
          options={
            rangeKind
              ? getListOpt(record.min, record.max, customLabeling)
              : selectConfig?.getOptions(record)
          }
          onBlur={saveSelect}
          autoFocus
          status={
            rangeKind === "from"
              ? findTo <= findFr
                ? "error"
                : undefined
              : rangeKind === "to"
                ? findFr >= findTo
                  ? "error"
                  : undefined
                : undefined
          }
          size="small"
        ></Select>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
            color: rangeKind && findTo <= findFr ? "red" : "unset",
            minWidth: 120,
            paddingTop: 1,
            paddingBottom: 1,
          }}
          onClick={toggleEdit}
        >
          {renderCustom(children)}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  };

  type ColumnTypes = (ColumnGroupType<T> | ColumnType<T>)[];

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: T[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  interface ColDef {
    title: React.ReactNode;
    dataIndex: string;
    editable?: boolean;
    rangeKind?: RangeKind;
    selectConfig?: SelectColumnConfig<T>;
    isSwitch?: boolean;
  }

  const columnsCalculator: ColDef[] = [
    {
      title: "Equipment",
      dataIndex: "equipment",
    },
    ...extraColumns.map(
      (col): ColDef =>
        col.type === "select"
          ? {
              title: col.label,
              dataIndex: col.dataIndex as string,
              editable: true,
              selectConfig: col,
            }
          : {
              title: col.label,
              dataIndex: col.dataIndex as string,
              editable: true,
              isSwitch: true,
            }
    ),
    {
      title: "From",
      dataIndex: "from",
      editable: true,
      rangeKind: "from",
    },
    {
      title: "To",
      dataIndex: "to",
      editable: true,
      rangeKind: "to",
    },
  ];

  const handleSave = (row: T) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const columns = columnsCalculator.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: T) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        rangeKind: col.rangeKind,
        selectConfig: col.selectConfig,
        isSwitch: col.isSwitch,
      }),
    };
  });

  return (
    <Table
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
      components={components}
      rowClassName={() => "editable-row"}
      bordered
      dataSource={dataSource}
      columns={columns as ColumnTypes}
      pagination={false}
    />
  );
};

export default EquipmentTable;
