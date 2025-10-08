import { Form, FormInstance, Select } from "antd";
import Table, { ColumnGroupType, ColumnType } from "antd/es/table";
import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { EQUIPMENT } from "../constants/InGame.constants";

enum TAB {
  EQ = "Equipment",
  CR = "Craft",
  FR = "From",
  TO = "To",
}

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
  craft?: number;
  equipment: EQUIPMENT;
}

export interface BasicOpt {
  option: Array<{ label: string; value: number }>;
  key: EQUIPMENT[];
}

interface EquipmentTableProps<T extends EquipmentTableCalculator> {
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
  dataSource: T[];
  setDataSource: React.Dispatch<React.SetStateAction<T[]>>;
  customLabeling?: (item: number) => string;
  craftData?: {
    list: BasicOpt[];
  };
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

const EquipmentTable = <T extends EquipmentTableCalculator>({
  selectedRowKeys,
  setSelectedRowKeys,
  dataSource,
  setDataSource,
  customLabeling,
  craftData,
}: EquipmentTableProps<T>) => {
  interface EditableCellProps<T> {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T) => void;
  }

  const EditableCell: React.FC<EditableCellProps<T>> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const [selectItem, setSelectItem] = useState<number>(0);
    const form = useContext(EditableContext)!;
    const craftOpt = (craftData?.list ?? []).find((it) =>
      it.key.includes(record?.equipment)
    );

    useEffect(() => {
      if (record?.from && title === TAB.FR) {
        setSelectItem(record.from);
      }
      if (record?.to && title === TAB.TO) {
        setSelectItem(record.to);
      }
      if (record?.craft && title === TAB.CR) {
        setSelectItem(record.craft ?? 0);
      }
    }, [record, title]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const handleChange = (value: number) => {
      setSelectItem(value);
    };

    const saveSelect = () => {
      toggleEdit();
      if (title === TAB.FR) {
        handleSave({ ...record, from: selectItem });
      }
      if (title === TAB.TO) {
        handleSave({ ...record, to: selectItem });
      }
      if (title === TAB.CR) {
        handleSave({ ...record, craft: selectItem });
      }
    };

    let childNode = children;

    const findFr = record?.from ?? 0;
    const findTo = record?.to ?? 0;

    const renderCustom = (cust: any) => {
      if (Array.isArray(cust) && cust.length > 0) {
        if (typeof cust[1] === "number") {
          const found = (craftOpt?.option ?? []).find(
            (it) => it.value === cust[1]
          );
          if (title === TAB.CR) {
            return found ? found.label : "No Option";
          } else {
            return getLabel(cust[1]);
          }
        }
      }
      return cust;
    };

    if (editable) {
      childNode = editing ? (
        <>
          {title === TAB.FR && (
            <Select
              defaultValue={selectItem}
              style={{ width: 120 }}
              onChange={handleChange}
              options={getListOpt(record.min, record.max)}
              onBlur={saveSelect}
              autoFocus
              status={findTo <= findFr ? "error" : undefined}
              size="small"
            ></Select>
          )}
          {title === TAB.TO && (
            <Select
              defaultValue={selectItem}
              style={{ width: 120 }}
              onChange={handleChange}
              options={getListOpt(record.min, record.max)}
              onBlur={saveSelect}
              autoFocus
              status={findFr >= findTo ? "error" : undefined}
              size="small"
            ></Select>
          )}
          {title === TAB.CR && (
            <Select
              defaultValue={selectItem}
              style={{ width: 120 }}
              onChange={handleChange}
              options={craftOpt?.option}
              onBlur={saveSelect}
              autoFocus
              size="small"
            ></Select>
          )}
        </>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{
            paddingRight: 24,
            color:
              (title === TAB.FR || title === TAB.TO) && findTo <= findFr
                ? "red"
                : "unset",
            minWidth:
              title === TAB.FR || title === TAB.TO || title === TAB.CR
                ? 120
                : undefined,
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

  const columnsCalculator: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: TAB.EQ,
      dataIndex: "equipment",
    },
    ...(craftData
      ? [
          {
            title: TAB.CR,
            dataIndex: "craft",
            editable: true,
          },
        ]
      : []),
    {
      title: TAB.FR,
      dataIndex: "from",
      editable: true,
    },
    {
      title: TAB.TO,
      dataIndex: "to",
      editable: true,
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
