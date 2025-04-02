import {
  Alert,
  Checkbox,
  Collapse,
  CollapseProps,
  Divider,
  Form,
  FormInstance,
  Select,
  Switch,
  Table,
  Tooltip,
  Radio,
  Typography,
} from "antd";
import { ColumnGroupType, ColumnType, ColumnsType } from "antd/es/table";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { CONVERSION_TYPE } from "../../constants/InGame.constants";
import { dataConversionCalculator } from "../../data/ConversionCalculatorData";
import {
  KilosT1ArmorCraftMaterial,
  KilosT1ArmorEnhanceMaterialTable,
  KilosT2ArmorEnhanceMaterialTable,
  NeedleOfIntelectCraftMaterial,
} from "../../data/KilosData";
import { ConversionCalculator } from "../../interface/Common.interface";
import { KilosArmorCraftMaterial } from "../../interface/Item.interface";
import { columnsResource } from "../../utils/common.util";

const { Text } = Typography;

interface TableMaterialList {
  "Armor Fragment": number;
  "Acc Fragment": number;
  "Wtd Fragment": number;
  "Weapon Fragment": number;
  "Astral Powder": number;
  "Astral Stone": number;
}

const getLabel = (item: number) => {
  if (item === 0) {
    return "Buy";
  }
  if (item === 12) {
    return "Evo Legend";
  }
  return `+${item - 1}`;
};

const opt = (start: number, end: number) =>
  Array.from({ length: end + 1 - start }, (_, k) => k + start).map((item) => ({
    label: getLabel(item),
    value: item,
  }));

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
  dataIndex: keyof ConversionCalculator;
  record: ConversionCalculator;
  handleSave: (record: ConversionCalculator) => void;
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

  const renderCustom = (cust: any) => {
    if (Array.isArray(cust) && cust.length > 0) {
      if (typeof cust[1] === "number") {
        return getLabel(cust[1]);
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
  | ColumnGroupType<ConversionCalculator>
  | ColumnType<ConversionCalculator>
)[];

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<ConversionCalculator[]>(
    dataConversionCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);
  const [checkedChange, setCheckedChange] = useState(false);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvo, setCheckedEvo] = useState(false);

  const CONV_FRAG = 3500;
  const WEAP_FRAG = 1;
  const EV_AST_STONE = 3;
  const EV_AST_POW_ARMOR = 1000;
  const EV_AST_POW_WEAP = 1500;
  const EV_AST_POW_ACC = 1150;
  const EV_AST_POW_WTD = 1150;
  const WEAP_ENH_SUC_RATE = [50, 40, 35, 20, 10, 7, 5, 5, 3, 3];

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: ConversionCalculator[]
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

  // const encTable = [
  //   ...KilosT1ArmorEnhanceMaterialTable,
  //   ...KilosT2ArmorEnhanceMaterialTable,
  // ];

  const handleSave = (row: ConversionCalculator) => {
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
      onCell: (record: ConversionCalculator) => ({
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

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
      "Armor Fragment": 0,
      "Acc Fragment": 0,
      "Wtd Fragment": 0,
      "Weapon Fragment": 0,
      "Astral Powder": 0,
      "Astral Stone": 0,
    };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const isBuy = from === 0;
        const isEvo = to === 12;
        let frag =
          (Math.min(to, 11) - Math.max(from, 1)) * CONV_FRAG +
          (isBuy ? CONV_FRAG : 0);

        let lgFrag = 0;
        switch (equipment) {
          case CONVERSION_TYPE.HELM:
          case CONVERSION_TYPE.UPPER:
          case CONVERSION_TYPE.LOWER:
          case CONVERSION_TYPE.GLOVE:
          case CONVERSION_TYPE.SHOES:
            temp["Armor Fragment"] += frag;
            lgFrag = EV_AST_POW_ARMOR;
            break;

          case CONVERSION_TYPE.MAIN_WEAPON:
          case CONVERSION_TYPE.SECOND_WEAPON:
            lgFrag = EV_AST_POW_WEAP;
            break;

          case CONVERSION_TYPE.NECKLACE:
          case CONVERSION_TYPE.EARRING:
          case CONVERSION_TYPE.RING:
            temp["Acc Fragment"] += frag;
            lgFrag = EV_AST_POW_ACC;
            break;

          case CONVERSION_TYPE.WING:
          case CONVERSION_TYPE.TAIL:
          case CONVERSION_TYPE.DECAL:
            temp["Wtd Fragment"] += frag;
            lgFrag = EV_AST_POW_WTD;
            break;

          default:
            break;
        }
        if (isEvo) {
          temp["Astral Powder"] += lgFrag;
          temp["Astral Stone"] += EV_AST_STONE;
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc, checkedChange]);

  const weaponNotes = useMemo(() => {
    if (invalidDtSrc) {
      return;
    }
    let temp: {
      main: JSX.Element | undefined;
      second: JSX.Element | undefined;
    } = {
      main: undefined,
      second: undefined,
    };
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tempSlice = WEAP_ENH_SUC_RATE.slice(
          Math.max(from, 1) - 1,
          Math.min(to, 11) - 1
        );
        const tempComp = (str: string) =>
          tempSlice.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text>{str} succes rate from the smaller enhancement</Text>
              <Text>{tempSlice.map((it) => `${it}%`).join(", ")}</Text>
            </div>
          ) : undefined;
        switch (equipment) {
          case CONVERSION_TYPE.MAIN_WEAPON:
            temp.main = tempComp("Main Weapon");
            break;
          case CONVERSION_TYPE.SECOND_WEAPON:
            temp.second = tempComp("Second Weapon");
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

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
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
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
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          {invalidDtSrc && (
            <div>
              <Alert
                banner
                message="From cannot exceed the To option"
                type="error"
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
              <Radio.Button
                value={["1", "2", "3", "4", "5"]}
                onClick={() => setSelectedRowKeys(["1", "2", "3", "4", "5"])}
              >
                Armor
              </Radio.Button>
              <Radio.Button
                value={["6", "7"]}
                onClick={() => setSelectedRowKeys(["6", "7"])}
              >
                Weapon
              </Radio.Button>
              <Radio.Button
                value={["8", "9", "10", "11"]}
                onClick={() => setSelectedRowKeys(["8", "9", "10", "11"])}
              >
                Accessories
              </Radio.Button>
              <Radio.Button
                value={["12", "13", "14"]}
                onClick={() => setSelectedRowKeys(["12", "13", "14"])}
              >
                WTD
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
              options={opt(0, 12)}
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
              options={opt(0, 12)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(tableResource)
              .filter(([_, value]) => {
                if (typeof value === "number") {
                  return value !== 0;
                }
                return value.amt !== 0;
              })
              .map(([key, value]) => ({
                mats: key,
                amount: value,
              }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
          {weaponNotes?.main}
          {weaponNotes?.second}
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
      title: (
        <div>
          <p>Eq. Fragment</p>
          <p>Joys & Sorrow</p>
          <p>Thread of Intellect</p>
          <p>Gold</p>
        </div>
      ),
      responsive: ["xs"],
      render: (_, { eqTypeFragment, joySorrow, threadIntelect, gold }) => (
        <div>
          <p>{eqTypeFragment}(Fragment)</p>
          <p>{joySorrow}(Joy)</p>
          <p>{threadIntelect}(Thr)</p>
          <p>{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
      responsive: ["sm"],
    },
    {
      title: "Joys & Sorrow",
      dataIndex: "joySorrow",
      responsive: ["sm"],
    },
    {
      title: "Thread of Intellect",
      dataIndex: "threadIntelect",
      responsive: ["sm"],
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ["sm"],
    },
  ];

  const columnsArmorT2: ColumnsType<KilosArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          <p>Eq. Fragment</p>
          <p>HG Joys & Sorrow</p>
          <p>Thread of Intellect</p>
          <p>Gold</p>
        </div>
      ),
      responsive: ["xs"],
      render: (_, { eqTypeFragment, joySorrowHG, threadIntelect, gold }) => (
        <div>
          <p>{eqTypeFragment}(Fragment)</p>
          <p>{joySorrowHG}(HG Joy)</p>
          <p>{threadIntelect}(Thr)</p>
          <p>{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
      responsive: ["sm"],
    },
    {
      title: "HG Joys & Sorrow",
      dataIndex: "joySorrowHG",
      responsive: ["sm"],
    },
    {
      title: "Thread of Intellect",
      dataIndex: "threadIntelect",
      responsive: ["sm"],
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ["sm"],
    },
  ];

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div style={{ marginRight: 10 }}>
            {/* <Table
              size={"small"}
              dataSource={BDBaofaTalismanStatTable}
              columns={columnsBaofaMats}
              pagination={false}
              bordered
            /> */}
          </div>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: <div style={{ marginRight: 10 }}></div>,
      },
      {
        key: "3",
        label: "Accesories",
        children: <div style={{ marginRight: 10 }}></div>,
      },
      {
        key: "4",
        label: "WTD",
        children: <div style={{ marginRight: 10 }}></div>,
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemStat} size="small" />
      </div>
    );
  };

  const getMatsContent = () => {
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Armor Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_ARMOR,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "2",
        label: "Weapon",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Weapon Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Every tap from +0 to +10": WEAP_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_WEAP,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "3",
        label: "Accesories",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Acc Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_ACC,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
      {
        key: "4",
        label: "WTD",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement"}
                footer={() => "Using Wtd Fragment"}
                size={"small"}
                dataSource={Object.entries({
                  "Buy from Store": CONV_FRAG,
                  "Every tap from +0 to +10": CONV_FRAG,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Evo Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": EV_AST_POW_WTD,
                  "Astral Stone": EV_AST_STONE,
                }).map(([key, value]) => ({
                  mats: key,
                  amount: value,
                }))}
                columns={columnsResource}
                pagination={false}
                bordered
              />
            </div>
          </div>
        ),
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemMats} size="small" />
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats",
      children: getMatsContent(),
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

export default ConversionContent;
