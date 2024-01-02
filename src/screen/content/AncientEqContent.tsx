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
} from "antd";
import { ColumnGroupType, ColumnType, ColumnsType } from "antd/es/table";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { EQUIPMENT } from "../../constants/InGame.constants";
import { dataAncCalculator } from "../../data/AncientCalculatorData";
import {
  AncientAccessoryCraftMaterialTable,
  AncientArmorCraftMaterialTable,
  AncientWeaponT2CraftMaterialTable,
} from "../../data/AncientData";
import { AncientCalculator } from "../../interface/Common.interface";
import { AncientArmorCraftMaterial } from "../../interface/Item.interface";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Otherworldly Ancient Weapon Fragment": number;
  "Unknown Ancient Accessory Fragment": number;
  "Ancient Knowledge": number;
  "Ancient Insignia": number;
  Gold: number;
}

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: item,
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
  dataIndex: keyof AncientCalculator;
  record: AncientCalculator;
  handleSave: (record: AncientCalculator) => void;
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
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (record?.from && title === TAB.FR) {
      setSelectItem(record.from);
    }
    if (record?.to && title === TAB.TO) {
      setSelectItem(record.to);
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
  };

  let childNode = children;

  const findFr = record?.from ?? 0;
  const findTo = record?.to ?? 0;

  if (editable) {
    childNode = editing ? (
      <>
        {title === TAB.FR && (
          <Select
            defaultValue={selectItem}
            style={{ width: 80 }}
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
            style={{ width: 80 }}
            onChange={handleChange}
            options={opt(record.min, record.max)}
            onBlur={saveSelect}
            autoFocus
            status={findFr >= findTo ? "error" : undefined}
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
              : "black",
          minWidth: title === TAB.FR || title === TAB.TO ? 80 : undefined,
          paddingTop: 1,
          paddingBottom: 1,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type ColumnTypes = (
  | ColumnGroupType<AncientCalculator>
  | ColumnType<AncientCalculator>
)[];

const AncientEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<AncientCalculator[]>(dataAncCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: AncientCalculator[]
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
    ];

  const handleSave = (row: AncientCalculator) => {
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
      onCell: (record: AncientCalculator) => ({
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
      "Otherworldly Ancient Weapon Fragment": 0,
      "Unknown Ancient Accessory Fragment": 0,
      "Ancient Knowledge": 0,
      "Ancient Insignia": 0,
      Gold: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, max, min } = found;
        let tempSlice: AncientArmorCraftMaterial[] = [];
        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            tempSlice = AncientArmorCraftMaterialTable.slice(from, to);
            break;
          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            tempSlice = AncientWeaponT2CraftMaterialTable.slice(from, to);
            break;
          case EQUIPMENT.NECKLACE:
          case EQUIPMENT.EARRING:
          case EQUIPMENT.RING:
            tempSlice = AncientAccessoryCraftMaterialTable.slice(from, to);
            break;

          default:
            break;
        }

        // const sumWithInitial = temp.reduce(
        //   (accumulator, currentValue) => accumulator + currentValue,
        //   initialValue
        // );

        let tempFragment = 0;
        let tempAncKnowledge = 0;
        let tempAncInsignia = 0;
        let tempGold = 0;

        tempSlice.forEach((slicedItem) => {
          tempFragment += slicedItem.eqTypeFragment;
          tempAncKnowledge += slicedItem.ancKnowledge;
          tempAncInsignia += slicedItem.ancInsignia;
          tempGold += slicedItem.gold;
        });

        temp["Ancient Knowledge"] += tempAncKnowledge;
        temp["Ancient Insignia"] += tempAncInsignia;
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
          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            temp["Otherworldly Ancient Weapon Fragment"] += tempFragment;
            break;
          case EQUIPMENT.NECKLACE:
          case EQUIPMENT.EARRING:
          case EQUIPMENT.RING:
            temp["Unknown Ancient Accessory Fragment"] += tempFragment;
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const columnsResource: ColumnsType<TableResource> = [
    // {
    //   title: "Enhancement",
    //   dataIndex: "encLevel",
    // },
    // {
    //   title: "Eq. Fragment",
    //   dataIndex: "eqTypeFragment",
    // },
    // {
    //   title: "A. Knowledge",
    //   dataIndex: "ancKnowledge",
    // },
    // {
    //   title: "A. Insignia",
    //   dataIndex: "ancInsignia",
    // },
    // {
    //   title: "Gold",
    //   dataIndex: "gold",
    // },

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
        <div style={{ marginRight: 10, marginBottom: 10 }}>
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
        <div style={{ marginRight: 10, marginBottom: 10 }}>
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
            Spesific Type
            <Divider type="vertical" />
            <Radio.Group
              value={selectedRowKeys}
              onChange={(e) => {
                setSelectedRowKeys(e.target.value);
              }}
            >
              <Radio.Button value={['1', '2', '3', '4', '5']} onClick={() => setSelectedRowKeys(['1', '2', '3', '4', '5'])}>
                Armor
              </Radio.Button>
              <Radio.Button value={['6', '7']} onClick={() => setSelectedRowKeys(['6', '7'])}>
                Weapon
              </Radio.Button>
              <Radio.Button value={['8', '9', '10', '11']} onClick={() => setSelectedRowKeys(['8', '9', '10', '11'])}>
                Accessories
              </Radio.Button>
            </Radio.Group>
          </div>
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

  const columnsArmor: ColumnsType<AncientArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
    },
    {
      title: "A. Knowledge",
      dataIndex: "ancKnowledge",
    },
    {
      title: "A. Insignia",
      dataIndex: "ancInsignia",
    },
    {
      title: "Gold",
      dataIndex: "gold",
    },
  ];
  const columnsWeapon: ColumnsType<AncientArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Otherworldly A. Weapon Fragment",
      dataIndex: "eqTypeFragment",
    },
    {
      title: "A. Knowledge",
      dataIndex: "ancKnowledge",
    },
    {
      title: "A. Insignia",
      dataIndex: "ancInsignia",
    },
    {
      title: "Gold",
      dataIndex: "gold",
    },
  ];
  const columnsAccessory: ColumnsType<AncientArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Unknown Ancient Accessory Fragment",
      dataIndex: "eqTypeFragment",
    },
    {
      title: "A. Knowledge",
      dataIndex: "ancKnowledge",
    },
    {
      title: "A. Insignia",
      dataIndex: "ancInsignia",
    },
    {
      title: "Gold",
      dataIndex: "gold",
    },
  ];
  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Armor Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientArmorCraftMaterialTable}
              columns={columnsArmor}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Weapon Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientWeaponT2CraftMaterialTable}
              columns={columnsWeapon}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Accessories Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={AncientAccessoryCraftMaterialTable}
              columns={columnsAccessory}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "4",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["4"]} />
    </div>
  );
};

export default AncientEqContent;
