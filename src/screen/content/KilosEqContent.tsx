import {
  Alert,
  Collapse,
  CollapseProps,
  Divider,
  Form,
  FormInstance,
  Radio,
  Select,
  Table,
  Checkbox
} from "antd";
import { ColumnGroupType, ColumnType, ColumnsType } from "antd/es/table";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { KilosCalculator } from "../../interface/Common.interface";
import { KilosArmorCraftMaterial } from "../../interface/Item.interface";
import { dataKilosCalculator } from "../../data/KilosCalculatorData";
import { KilosT1ArmorEnhanceMaterialTable, KilosT2ArmorEnhanceMaterialTable } from "../../data/KilosData";
import { isNumberObject } from "util/types";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Joys & Sorrow of Kilos": number;
  "High Grade Joys & Sorrow of Kilos": number;
  "Thread of Intellect": number;
  Gold: number;
}

const getLabel = (item: number) => {
  return item <= 20 ? `Tier 1 +${item}` : `Tier 2 +${item - 20}`
}

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: getLabel(item),
    value: item,
  }));

interface TableResource {
  mats: string;
  amount: number;
}

enum TAB {
  EQ = "Equipment",
  FR = "From",
  TO = "To",
  EVO2 = 'Evo to Tier 2'
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

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof KilosCalculator;
  record: KilosCalculator;
  handleSave: (record: KilosCalculator) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const [inputNumb, setInputNumb] = useState<number>(0);
  const [selectItem, setSelectItem] = useState<number>(0);
  const [evoItem, setEvoItem] = useState<boolean>(false);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (record?.from && title === TAB.FR) {
      setSelectItem(record.from);
    }
    if (record?.to && title === TAB.TO) {
      setSelectItem(record.to);
    }
    if (record?.evoTier2 && title === TAB.EVO2) {
      setEvoItem(record.evoTier2);
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
    if (title === TAB.EVO2) {
      handleSave({ ...record, evoTier2: evoItem });
    }
  };

  console.log({ children, restProps, evoItem });
  let childNode = children;


  const findFr = record?.from ?? 0;
  const findTo = record?.to ?? 0;

  const renderCustom = (cust: any) => {
    if (Array.isArray(cust) && cust.length > 0) {
      if (typeof cust[1] === 'number') {
        return getLabel(cust[1])
      }
      if (typeof cust[1] === 'boolean') {
        return cust[1] ? 'Yes' : 'No'
      }
    }
    return cust
  }

  if (editable) {
    childNode = editing ? (
      <>
        {title === TAB.FR && (
          <Select
            defaultValue={selectItem}
            style={{ width: 120 }}
            onChange={handleChange}
            options={opt(record.min, record.max)}
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
            options={opt(record.min, record.max)}
            onBlur={saveSelect}
            autoFocus
            status={findFr >= findTo ? "error" : undefined}
            size="small"
          ></Select>
        )}
        {title === TAB.EVO2 && (
          <div onBlur={saveSelect}>
            <Checkbox onChange={(e) => setEvoItem(e.target.checked)} checked={evoItem}>Checkbox</Checkbox>
          </div>
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
              : "black",
          minWidth: title === TAB.FR || title === TAB.TO ? 120 : undefined,
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

type ColumnTypes = (
  | ColumnGroupType<KilosCalculator>
  | ColumnType<KilosCalculator>
)[];

const KilosEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<KilosCalculator[]>(dataKilosCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: KilosCalculator[]
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
      {
        title: TAB.EVO2,
        dataIndex: "evoTier2",
        editable: true,
      },
    ];

  const handleSave = (row: KilosCalculator) => {
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
      onCell: (record: KilosCalculator) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const showWarningAcc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (
        !flag &&
        found &&
        (found.equipment === EQUIPMENT.NECKLACE ||
          found.equipment === EQUIPMENT.EARRING ||
          found.equipment === EQUIPMENT.RING)
      ) {
        if (found.from > 10 || found.to > 10) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
      "Helm Fragment": 0,
      "Upper Fragment": 0,
      "Lower Fragment": 0,
      "Gloves Fragment": 0,
      "Shoes Fragment": 0,
      'Joys & Sorrow of Kilos': 0,
      'High Grade Joys & Sorrow of Kilos': 0,
      'Thread of Intellect': 0,
      Gold: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, max, min } = found;
        let tempSlice: KilosArmorCraftMaterial[] = [];
        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            tempSlice = KilosT1ArmorEnhanceMaterialTable.slice(from, to);
            break;


          default:
            break;
        }

        // const sumWithInitial = temp.reduce(
        //   (accumulator, currentValue) => accumulator + currentValue,
        //   initialValue
        // );

        let tempFragment = 0;
        let tempJoySorrow = 0;
        let tempHGJoySorrow = 0;
        let tempThreadIntel = 0;
        let tempGold = 0;

        tempSlice.forEach((slicedItem) => {
          tempFragment += slicedItem.eqTypeFragment;
          tempJoySorrow += slicedItem.joySorrow;
          tempHGJoySorrow += slicedItem.joySorrowHG;
          tempThreadIntel += slicedItem.threadIntelect;
          tempGold += slicedItem.gold;
        });

        temp['Joys & Sorrow of Kilos'] += tempJoySorrow;
        temp['High Grade Joys & Sorrow of Kilos'] += tempHGJoySorrow;
        temp['Thread of Intellect'] += tempThreadIntel;
        temp["Gold"] += tempGold;
        switch (equipment) {
          case EQUIPMENT.HELM:
            temp["Helm Fragment"] += tempFragment;
            break;
          case EQUIPMENT.UPPER:
            temp["Upper Fragment"] += tempFragment;
            break;
          case EQUIPMENT.LOWER:
            temp["Lower Fragment"] += tempFragment;
            break;
          case EQUIPMENT.GLOVE:
            temp["Gloves Fragment"] += tempFragment;
            break;
          case EQUIPMENT.SHOES:
            temp["Shoes Fragment"] += tempFragment;
            break;


          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: 'auto' }}>
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
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: 'auto' }}>
          {invalidDtSrc && (
            <div>
              <Alert
                banner
                message="From cannot exceed the To option"
                type="error"
              />
            </div>
          )}
          {showWarningAcc && (
            <div>
              <Alert
                banner
                message="From +11 onward, your accessory might break"
                type="warning"
              />
            </div>
          )}
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            From
            <Divider type="vertical" />
            <Select
              defaultValue={selectFrom}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectFrom(val);
              }}
              options={opt(0, 20)}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            To
            <Divider type="vertical" />
            <Select
              defaultValue={selectTo}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectTo(val);
              }}
              options={opt(0, 20)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            // dataSource={tableResource}
            dataSource={Object.entries(tableResource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
        </div>
      </div>
    );
  };

  const columnsArmorT1: ColumnsType<KilosArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: <div>
        <p>Eq. Fragment</p>
        <p>Joys & Sorrow</p>
        <p>Thread of Intellect</p>
        <p>Gold</p>
      </div>,
      responsive: ['xs'],
      render: (_, { eqTypeFragment, joySorrow, threadIntelect, gold }) => (
        <div>
          <p >{eqTypeFragment}(Fragment)</p>
          <p >{joySorrow}(Joy)</p>
          <p >{threadIntelect}(Thr)</p>
          <p >{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
      responsive: ['sm']
    },
    {
      title: "Joys & Sorrow",
      dataIndex: "joySorrow",
      responsive: ['sm']
    },
    {
      title: "Thread of Intellect",
      dataIndex: "threadIntelect",
      responsive: ['sm']
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ['sm']
    },
  ];

  const columnsArmorT2: ColumnsType<KilosArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: <div>
        <p>Eq. Fragment</p>
        <p>HG Joys & Sorrow</p>
        <p>Thread of Intellect</p>
        <p>Gold</p>
      </div>,
      responsive: ['xs'],
      render: (_, { eqTypeFragment, joySorrowHG, threadIntelect, gold }) => (
        <div>
          <p >{eqTypeFragment}(Fragment)</p>
          <p >{joySorrowHG}(HG Joy)</p>
          <p >{threadIntelect}(Thr)</p>
          <p >{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
      responsive: ['sm']
    },
    {
      title: "HG Joys & Sorrow",
      dataIndex: "joySorrowHG",
      responsive: ['sm']
    },
    {
      title: "Thread of Intellect",
      dataIndex: "threadIntelect",
      responsive: ['sm']
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ['sm']
    },
  ];

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Armor Tier 1 Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={KilosT1ArmorEnhanceMaterialTable}
              columns={columnsArmorT1}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Armor Tier 2 Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={KilosT2ArmorEnhanceMaterialTable}
              columns={columnsArmorT2}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default KilosEqContent;