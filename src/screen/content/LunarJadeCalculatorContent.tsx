import { CloseOutlined } from "@ant-design/icons";
import type { CollapseProps } from "antd";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Form,
  Grid,
  InputNumber,
  Radio,
  Select,
  Space,
  Table,
  Typography,
  theme,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { ColumnGroupType, ColumnType, ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import CustomSlider from "../../components/CustomSlider";
import ListingCard from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { TableResource } from "../../constants/Common.constants";
import {
  EQUIPMENT,
  ITEM_RARITY,
  LUNAR_JADE_TYPE,
} from "../../constants/InGame.constants";
import { dataCalculator } from "../../data/lunarCalculatorData";
import {
  LunarFragmentList,
  LunarJadeAttEnhancementMatsTable,
  LunarJadeAttEnhancementStatsTable,
  LunarJadeCraftAmountTable,
  LunarJadeCraftMaterialList,
  LunarJadeDefEnhancementMatsTable,
  LunarJadeDefEnhancementStatsTable,
  LunarJadeEnhanceMaterialList,
  concentratedDimensionalEnergyCraftMats,
  tigerIntactOrbCraftMats,
} from "../../data/lunarData";
import { useAppSelector } from "../../hooks";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import {
  LunarFragmentData,
  LunarJadeCraftAmount,
  LunarJadeCraftMaterial,
  LunarJadeEnhanceMaterial,
  LunarJadeEnhancementMats,
} from "../../interface/Item.interface";
import { LunarJadeEnhancementStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  getColor,
  getTextEmpty,
} from "../../utils/common.util";

const { useBreakpoint } = Grid;
const { Text } = Typography;
const { Option } = Select;

interface TableLunarResource {
  lunarFragment: LunarFragmentData;
  amountFragment: number;
  amountHGFragment: number;
}
enum TAB {
  EQ = "Equipment",
  QT = "Quantity",
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

interface optItem {
  value: ITEM_RARITY;
  label: ITEM_RARITY;
  rateValue: number;
}

export const equipmentCraftOpt: optItem[] = [
  {
    value: ITEM_RARITY.CRAFT,
    label: ITEM_RARITY.CRAFT,
    rateValue: 1,
  },
  {
    value: ITEM_RARITY.NORMAL,
    label: ITEM_RARITY.NORMAL,
    rateValue: 2,
  },
  {
    value: ITEM_RARITY.MAGIC,
    label: ITEM_RARITY.MAGIC,
    rateValue: 3,
  },
  {
    value: ITEM_RARITY.RARE,
    label: ITEM_RARITY.RARE,
    rateValue: 4,
  },
  {
    value: ITEM_RARITY.EPIC,
    label: ITEM_RARITY.EPIC,
    rateValue: 5,
  },
  {
    value: ITEM_RARITY.UNIQUE,
    label: ITEM_RARITY.UNIQUE,
    rateValue: 6,
  },
  {
    value: ITEM_RARITY.LEGEND,
    label: ITEM_RARITY.LEGEND,
    rateValue: 7,
  },
  {
    value: ITEM_RARITY.ANCIENT,
    label: ITEM_RARITY.ANCIENT,
    rateValue: 8,
  },
];

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof LunarJadeCalculator;
  record: LunarJadeCalculator;
  handleSave: (record: LunarJadeCalculator) => void;
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
  const [selectItem, setSelectItem] = useState<ITEM_RARITY>(ITEM_RARITY.CRAFT);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (record?.defaultValue && title === TAB.QT) {
      setInputNumb(record.defaultValue);
    }
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

  const onChange = (value: number | null) => {
    if (typeof value === "number") {
      setInputNumb(value);
    }
  };

  const saveInput = () => {
    toggleEdit();
    handleSave({ ...record, defaultValue: inputNumb });
  };

  const handleChange = (value: ITEM_RARITY) => {
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
  const findFr = equipmentCraftOpt.find((item) => item.value === record?.from);
  const findTo = equipmentCraftOpt.find((item) => item.value === record?.to);
  if (editable) {
    childNode = editing ? (
      <>
        {title === TAB.QT && (
          <InputNumber
            min={record.min}
            max={record.max}
            defaultValue={inputNumb}
            onChange={onChange}
            onBlur={saveInput}
            autoFocus
            size="small"
            style={{ width: 60 }}
          />
        )}
        {title === TAB.FR && (
          <Select
            defaultValue={selectItem}
            style={{ width: 80 }}
            onChange={handleChange}
            // options={opt}
            onBlur={saveSelect}
            autoFocus
            status={
              (findTo?.rateValue ?? 0) <= (findFr?.rateValue ?? 0)
                ? "error"
                : undefined
            }
            size="small"
          >
            {equipmentCraftOpt.map((item) => {
              return (
                <Option
                  value={item.value}
                  label={item.label}
                  key={item.value}
                  // disabled={(findTo?.rateValue ?? 0) <= item.rateValue}
                >
                  <Space>{item.label}</Space>
                </Option>
              );
            })}
          </Select>
        )}
        {title === TAB.TO && (
          <Select
            defaultValue={selectItem}
            style={{ width: 80 }}
            onChange={handleChange}
            // options={opt}
            onBlur={saveSelect}
            autoFocus
            status={
              (findFr?.rateValue ?? 8) >= (findTo?.rateValue ?? 8)
                ? "error"
                : undefined
            }
            size="small"
          >
            {equipmentCraftOpt.map((item) => {
              return (
                <Option
                  value={item.value}
                  label={item.label}
                  key={item.value}
                  // disabled={(findFr?.rateValue ?? 8) >= item.rateValue}
                >
                  <Space>{item.label}</Space>
                </Option>
              );
            })}
          </Select>
        )}
      </>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
          color:
            (title === TAB.FR || title === TAB.TO) &&
            (findTo?.rateValue ?? 0) <= (findFr?.rateValue ?? 0)
              ? "red"
              : "unset",
          minWidth:
            title === TAB.FR || title === TAB.TO
              ? 80
              : title === TAB.QT
              ? 60
              : undefined,
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

type EditableTableProps = Parameters<typeof Table>[0];
// type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
type ColumnTypes = (
  | ColumnGroupType<LunarJadeCalculator>
  | ColumnType<LunarJadeCalculator>
)[];

interface FormEnhance {
  type: string | null;
  listEnhance: Array<{
    range?: [number, number] | null;
    amt?: number | null;
  }> | null;
}

interface LJade {
  amt: number;
  type: LunarFragmentData;
}

interface EnhanceTableMaterialList {
  "Lunar Eclipse Stigmata": number;
  "Lunar Eclipse Crystal": number;
  "Lunar Eclipse Remains": number;
  "HG Holy Lunar": LJade;
  "HG Burning Lunar": LJade;
  "HG Pitch Black Lunar": LJade;
  "HG Crystal Clear Lunar": LJade;
  "HG Tailwind Lunar": LJade;
  "HG Ardent Lunar": LJade;
  Gold: number;
}

function typedEntries<T extends {}>(obj: T): [string, T[keyof T]][] {
  return Object.entries(obj) as [string, T[keyof T]][];
}

interface MatsTableRes {
  matsData?: EnhanceTableMaterialList;
  statsData?: LunarJadeEnhancementStats;
  errorDt?: string[];
}

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();
  const screens = useBreakpoint();

  const [formEnhance] = Form.useForm<{ items: Array<FormEnhance> }>();

  const lunarScreen = useAppSelector(
    (state) => state.UIState.selectedSideBar.payload?.lunarScreen
  );
  const activeKey = useRef(lunarScreen?.tabOpen || ["2", "4"]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<LunarJadeCalculator[]>(dataCalculator);
  const [qtVal, setQtVal] = useState<string>("min");
  const [selectFrom, setSelectFrom] = useState<ITEM_RARITY>(ITEM_RARITY.CRAFT);
  const [selectTo, setSelectTo] = useState<ITEM_RARITY>(ITEM_RARITY.NORMAL);
  const [changeOrb, setChangeOrb] = useState<boolean>(false);
  const [changeEnergy, setChangeEnergy] = useState<boolean>(false);

  const [enhanceDataSource, setEnhanceDataSource] = useState<MatsTableRes>({});

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: LunarJadeCalculator[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const handleSave = (row: LunarJadeCalculator) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
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
      title: TAB.QT,
      dataIndex: "defaultValue",
      editable: true,
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

  const columns = columnsCalculator.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: LunarJadeCalculator) => ({
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
        const findFr = equipmentCraftOpt.find(
          (item) => item.value === found.from
        );
        const findTo = equipmentCraftOpt.find(
          (item) => item.value === found.to
        );
        if ((findTo?.rateValue ?? 0) <= (findFr?.rateValue ?? 0)) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const tableResource: TableLunarResource[] = useMemo(() => {
    let temp: TableLunarResource[] = [];
    if (invalidDtSrc) {
      return [];
    }
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, defaultValue } = found;
        let adding = false;
        let totalF = 0;
        let totalHGF = 0;

        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            totalF += item.quantity;
            totalHGF += item.quantityHg;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });

        const foundMat = LunarJadeCraftMaterialList.find(
          (mat) => mat.equipmentType === equipment
        );
        if (foundMat) {
          foundMat.lunarFragment.map((frag) => {
            const foundTempMat = temp.findIndex(
              (tmp) => tmp.lunarFragment.type === frag.type
            );
            if (foundTempMat === -1) {
              temp.push({
                lunarFragment: frag,
                amountFragment: totalF * defaultValue,
                amountHGFragment: totalHGF * defaultValue,
              });
            } else {
              const old = temp[foundTempMat];
              temp[foundTempMat] = {
                ...old,
                amountFragment: old.amountFragment + totalF * defaultValue,
                amountHGFragment:
                  old.amountHGFragment + totalHGF * defaultValue,
              };
            }
          });
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const resourceGold = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    let tempGold = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotal = 0;
        let tempTotalI = 0;
        let tempTotalE = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotal += item.gold;
            tempTotalI += item.tigerIntactOrb;
            tempTotalE += item.concentratedDimensionalEnergy;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });
        tempGold += tempTotal * defaultValue;

        if (changeOrb) {
          tempGold += defaultValue * tempTotalI * tigerIntactOrbCraftMats.gold;
        }

        if (changeEnergy) {
          tempGold +=
            defaultValue *
            tempTotalE *
            concentratedDimensionalEnergyCraftMats.gold;
        }
      }
    });
    return tempGold;
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeOrb, changeEnergy]);

  const resourceStigmata = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    let tempStigmata = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotal = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotal += item.stigmata;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });
        tempStigmata += tempTotal * defaultValue;
      }
    });
    return tempStigmata;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const resourceOrb = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    if (changeOrb) {
      return 0;
    }
    let tempOrb = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotal = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotal += item.tigerIntactOrb;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });
        tempOrb += tempTotal * defaultValue;
      }
    });
    return tempOrb;
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeOrb]);

  const resourceConcEnergy = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    if (changeEnergy) {
      return 0;
    }
    let tempEnergy = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotal = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotal += item.concentratedDimensionalEnergy;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });
        tempEnergy += tempTotal * defaultValue;
      }
    });
    return tempEnergy;
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeEnergy]);

  const resourceBrokenOrb = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    if (!changeOrb && !changeEnergy) {
      return 0;
    }
    let tempBrknOrb = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotalOrb = 0;
        let tempTotalEnergy = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotalOrb += item.tigerIntactOrb;
            tempTotalEnergy += item.concentratedDimensionalEnergy;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });
        if (changeOrb) {
          tempBrknOrb +=
            tempTotalOrb *
            defaultValue *
            tigerIntactOrbCraftMats.tigerIntactOrb;
        }
        if (changeEnergy) {
          tempBrknOrb +=
            tempTotalEnergy *
            defaultValue *
            concentratedDimensionalEnergyCraftMats.tigerIntactOrb;
        }
      }
    });
    return tempBrknOrb;
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeOrb, changeEnergy]);

  const resourceDimensionalEnergy = useMemo(() => {
    if (invalidDtSrc) {
      return "-";
    }
    if (!changeEnergy) {
      return 0;
    }
    let tempDimEnergy = 0;
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { from, to, defaultValue } = found;
        let adding = false;
        let tempTotalEnergy = 0;
        LunarJadeCraftAmountTable.map((item) => {
          if (adding) {
            tempTotalEnergy += item.concentratedDimensionalEnergy;
          }
          if (item.rarity === from) {
            adding = true;
          }
          if (item.rarity === to) {
            adding = false;
          }
        });

        if (changeEnergy) {
          tempDimEnergy +=
            tempTotalEnergy *
            defaultValue *
            concentratedDimensionalEnergyCraftMats.dimensionalEnergy;
        }
      }
    });
    return tempDimEnergy;
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeEnergy]);

  const columnsResourceLunar: ColumnsType<TableLunarResource> = [
    {
      title: "Fragment Mat",
      dataIndex: "lunarFragment",
      render: (_, { lunarFragment }) => (
        <div>
          <Text style={{ color: lunarFragment.color, marginRight: 5 }}>
            {lunarFragment.type}
          </Text>
        </div>
      ),
    },
    {
      title: "Fragment",
      dataIndex: "amountFragment",
      width: 150,
      render: (_, { amountFragment }) => (
        <Text>{amountFragment.toLocaleString()}</Text>
      ),
    },
    {
      title: "High Grade Fragment",
      dataIndex: "amountHGFragment",
      width: 150,
      render: (_, { amountHGFragment }) => (
        <Text>{amountHGFragment.toLocaleString()}</Text>
      ),
    },
  ];

  const setQuantityValue = (qt: string) => {
    setQtVal(qt);
    switch (qt) {
      case "min":
        const newDataMin = dataSource.map((item) => ({
          ...item,
          defaultValue: item.min,
        }));
        setDataSource(newDataMin);
        break;
      case "mid":
        const newDataMid = dataSource.map((item) => ({
          ...item,
          defaultValue: item.equipment === EQUIPMENT.RING ? 2 : 1,
        }));
        setDataSource(newDataMid);
        break;
      case "max":
        const newDataMax = dataSource.map((item) => ({
          ...item,
          defaultValue: item.max,
        }));
        setDataSource(newDataMax);
        break;

      default:
        break;
    }
  };

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
            // columns={columnsCalculator}
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
                // description="Calculated resources will not be shown until you fix the table"
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
                value={["8", "9", "10"]}
                onClick={() => setSelectedRowKeys(["8", "9", "10"])}
              >
                Accessories
              </Radio.Button>
            </Radio.Group>
          </div>
          <div style={{ marginBottom: 4 }}>
            Quantity
            <Divider type="vertical" />
            <Radio.Group
              value={qtVal}
              onChange={(e) => {
                setQuantityValue(e.target.value);
              }}
            >
              <Radio.Button value="min" onClick={() => setQuantityValue("min")}>
                Min
              </Radio.Button>
              <Radio.Button value="mid" onClick={() => setQuantityValue("mid")}>
                Mid
              </Radio.Button>
              <Radio.Button value="max" onClick={() => setQuantityValue("max")}>
                Max
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
              options={equipmentCraftOpt}
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
              options={equipmentCraftOpt}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={changeOrb}
              onChange={(e) => {
                setChangeOrb(e.target.checked);
              }}
            >
              Change Tiger Orb to Mats
            </Checkbox>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={changeEnergy}
              onChange={(e) => {
                setChangeEnergy(e.target.checked);
              }}
            >
              Change Conc. Dim. Energy to Mats
            </Checkbox>
          </div>
          <Divider orientation="left">Material List</Divider>
          <div>Gold: {resourceGold}</div>
          <div>Stigmata: {resourceStigmata}</div>
          <div>Tiger Orb: {resourceOrb}</div>
          <div>Conc. Dim. Energy: {resourceConcEnergy}</div>
          <div>Broken Orb: {resourceBrokenOrb}</div>
          <div>Dimensional Energy: {resourceDimensionalEnergy}</div>
          <Table
            size={"small"}
            dataSource={tableResource}
            columns={columnsResourceLunar}
            pagination={false}
            bordered
          />
        </div>
      </div>
    );
  };

  const columnsLunar: ColumnsType<LunarJadeCraftAmount> = [
    {
      title: "Stage Rarity",
      dataIndex: "rarity",
      width: 150,
      render: (_, { rarity }) => (
        <div>
          <Text style={{ color: getColor(rarity, colorText) }}>{rarity}</Text>
        </div>
      ),
    },
    {
      title: (
        <div>
          <p>Fragment</p>
          <p>High Grade Fragment</p>
          <p>Stigmata</p>
          <p>Gold</p>
          <p>Tiger Intact Orb</p>
          <p>Conc. Dim. Energy</p>
        </div>
      ),
      responsive: ["xs"],
      render: (
        _,
        {
          quantity,
          quantityHg,
          stigmata,
          gold,
          tigerIntactOrb,
          concentratedDimensionalEnergy,
        }
      ) => (
        <div>
          <p>{quantity}</p>
          <p>{quantityHg}(hg)</p>
          <p>{stigmata}(s)</p>
          <p>{gold}(g)</p>
          <p>{tigerIntactOrb}(Orb)</p>
          <p>{concentratedDimensionalEnergy}(Dim)</p>
        </div>
      ),
    },
    {
      title: "Fragment",
      dataIndex: "quantity",
      responsive: ["sm"],
    },
    {
      title: "High Grade Fragment",
      dataIndex: "quantityHg",
      responsive: ["sm"],
    },
    {
      title: "Stigmata",
      dataIndex: "stigmata",
      responsive: ["sm"],
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ["sm"],
    },
    {
      title: "Tiger Intact Orb",
      dataIndex: "tigerIntactOrb",
      responsive: ["sm"],
    },
    {
      title: "Conc. Dim. Energy",
      dataIndex: "concentratedDimensionalEnergy",
      responsive: ["sm"],
    },
  ];

  const columnsCraft: ColumnsType<LunarJadeCraftMaterial> = [
    {
      title: "Equipment",
      dataIndex: "equipmentType",
      width: 150,
    },
    {
      title: "Fragment Mat",
      dataIndex: "lunarFragment",
      render: (_, { lunarFragment }) => (
        <div>
          {lunarFragment.map((item) => (
            <Text style={{ color: item.color, marginRight: 5 }}>
              {item.type}
            </Text>
          ))}
        </div>
      ),
    },
  ];
  const columnsEnhance: ColumnsType<LunarJadeEnhanceMaterial> = [
    {
      title: "Jade Type",
      dataIndex: "jadeType",
      width: 150,
    },
    {
      title: "Fragment Mat",
      dataIndex: "lunarFragment",
      render: (_, { lunarFragment }) => (
        <div>
          {lunarFragment.map((item) => (
            <Text style={{ color: item.color, marginRight: 5 }}>
              {item.type}
            </Text>
          ))}
        </div>
      ),
    },
  ];

  const getMatsCol = (
    isAttack?: boolean
  ): ColumnsType<LunarJadeEnhancementMats> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Stigmata</p>
            {isAttack ? <p>Crystal</p> : <p>Remains</p>}
            <p>High Grade Fragment</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { stigmata, crystal, remains, gold, hgFragment }) => (
          <div>
            <p>{stigmata.toLocaleString()} (s)</p>
            {isAttack ? (
              <p>{crystal.toLocaleString()} (crs)</p>
            ) : (
              <p>{remains.toLocaleString()} (rem)</p>
            )}
            <p>{hgFragment.toLocaleString()} (hg frag)</p>
            <p>{gold.toLocaleString()} (g)</p>
          </div>
        ),
      },
      {
        title: "Stigmata",
        dataIndex: "stigmata",
        responsive: ["sm"],
        render: (_, { stigmata }) => <Text>{stigmata.toLocaleString()}</Text>,
      },
      ...(isAttack
        ? ([
            {
              title: "Crystal",
              dataIndex: "crystal",
              responsive: ["sm"],
              render: (_, { crystal }) => (
                <Text>{crystal.toLocaleString()}</Text>
              ),
            },
          ] as ColumnsType<LunarJadeEnhancementMats>)
        : ([
            {
              title: "Remains",
              dataIndex: "remains",
              responsive: ["sm"],
              render: (_, { remains }) => (
                <Text>{remains.toLocaleString()}</Text>
              ),
            },
          ] as ColumnsType<LunarJadeEnhancementMats>)),
      {
        title: "High Grade Fragment",
        dataIndex: "hgFragment",
        responsive: ["sm"],
        render: (_, { hgFragment }) => (
          <Text>{hgFragment.toLocaleString()}</Text>
        ),
      },
      {
        title: "Gold",
        dataIndex: "gold",
        responsive: ["sm"],
        render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
      },
    ];
  };

  const getEnhanceCol = (
    isAttack?: boolean
  ): ColumnsType<LunarJadeEnhancementStats> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Attack</p>
            <p>Attribute ATK</p>
            {isAttack ? (
              <>
                <p>ATK%</p>
                <p>Critical</p>
                <p>Critical Damage</p>
              </>
            ) : (
              <>
                <p>HP%</p>
                <p>HP</p>
                <p>Phy Def</p>
                <p>Mag Def</p>
              </>
            )}
            <p>Final Damage</p>
            <p>Hero Skill ATK</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          {
            attack,
            attPercent,
            attackPercent,
            critical,
            criticalDamage,
            hpPercent,
            hp,
            phyDef,
            magDef,
            fd,
            hsSkillPercent,
          }
        ) => (
          <div>
            <p>ATK {getTextEmpty({ txt: attack })}</p>
            <p>ATT {getTextEmpty({ txt: attPercent, tailText: "%" })}</p>
            {isAttack ? (
              <>
                <p>ATK {getTextEmpty({ txt: attackPercent, tailText: "%" })}</p>
                <p>CRT {getTextEmpty({ txt: critical })}</p>
                <p>CDM {getTextEmpty({ txt: criticalDamage })}</p>
              </>
            ) : (
              <>
                <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
                <p>HP {getTextEmpty({ txt: hp })}</p>
                <p>Phy Def {getTextEmpty({ txt: phyDef })}</p>
                <p>Mag Def {getTextEmpty({ txt: magDef })}</p>
              </>
            )}
            <p>FD {getTextEmpty({ txt: fd })}</p>
            <p>HS ATK {getTextEmpty({ txt: hsSkillPercent, tailText: "%" })}</p>
          </div>
        ),
      },
      ...(!screens.lg
        ? ([
            {
              title: (
                <div>
                  <p>Attack</p>
                  <p>Attribute ATK</p>
                  {isAttack ? (
                    <>
                      <p>ATK%</p>
                    </>
                  ) : (
                    <>
                      <p>HP%</p>
                      <p>HP</p>
                    </>
                  )}
                </div>
              ),
              responsive: ["sm"],
              render: (
                _,
                { attack, hpPercent, attPercent, hp, attackPercent }
              ) => (
                <div>
                  <p>ATK {getTextEmpty({ txt: attack })}</p>
                  <p>ATT {getTextEmpty({ txt: attPercent, tailText: "%" })}</p>
                  {isAttack ? (
                    <>
                      <p>
                        ATK{" "}
                        {getTextEmpty({ txt: attackPercent, tailText: "%" })}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}
                      </p>
                      <p>HP {getTextEmpty({ txt: hp })}</p>
                    </>
                  )}
                </div>
              ),
            },
            {
              title: (
                <div>
                  {isAttack ? (
                    <>
                      <p>Critical</p>
                      <p>Critical Damage</p>
                    </>
                  ) : (
                    <>
                      <p>Phy Def</p>
                      <p>Mag Def</p>
                    </>
                  )}
                  <p>Final Damage</p>
                  <p>Hero Skill ATK</p>
                </div>
              ),
              responsive: ["sm"],
              render: (
                _,
                { phyDef, magDef, fd, hsSkillPercent, critical, criticalDamage }
              ) => (
                <div>
                  {isAttack ? (
                    <>
                      <p>CRT {getTextEmpty({ txt: critical })}</p>
                      <p>CDM {getTextEmpty({ txt: criticalDamage })}</p>
                    </>
                  ) : (
                    <>
                      <p>Phy Def {getTextEmpty({ txt: phyDef })}</p>
                      <p>Mag Def {getTextEmpty({ txt: magDef })}</p>
                    </>
                  )}
                  <p>FD {getTextEmpty({ txt: fd })}</p>
                  <p>
                    HS ATK{" "}
                    {getTextEmpty({ txt: hsSkillPercent, tailText: "%" })}
                  </p>
                </div>
              ),
            },
          ] as ColumnsType<LunarJadeEnhancementStats>)
        : []),
      {
        title: "Attack",
        responsive: ["lg"],
        render: (_, { attack }) => <Text>{getTextEmpty({ txt: attack })}</Text>,
      },
      {
        title: "Attribute ATK",
        responsive: ["lg"],
        render: (_, { attPercent }) => (
          <Text>{getTextEmpty({ txt: attPercent, tailText: "%" })}</Text>
        ),
      },
      ...(isAttack
        ? ([
            {
              title: "ATK%",
              responsive: ["lg"],
              render: (_, { attackPercent }) => (
                <Text>
                  {getTextEmpty({ txt: attackPercent, tailText: "%" })}
                </Text>
              ),
            },
            {
              title: "Critical",
              responsive: ["lg"],
              render: (_, { critical }) => (
                <Text>{getTextEmpty({ txt: critical })}</Text>
              ),
            },
            {
              title: "Critical Damage",
              responsive: ["lg"],
              render: (_, { criticalDamage }) => (
                <Text>{getTextEmpty({ txt: criticalDamage })}</Text>
              ),
            },
          ] as ColumnsType<LunarJadeEnhancementStats>)
        : ([
            {
              title: "HP%",
              responsive: ["lg"],
              render: (_, { hpPercent }) => (
                <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
              ),
            },
            {
              title: "HP",
              responsive: ["lg"],
              render: (_, { hp }) => <Text>{getTextEmpty({ txt: hp })}</Text>,
            },
            {
              title: "Phy Def",
              responsive: ["lg"],
              render: (_, { phyDef }) => (
                <Text>{getTextEmpty({ txt: phyDef })}</Text>
              ),
            },
            {
              title: "Mag Def",
              responsive: ["lg"],
              render: (_, { magDef }) => (
                <Text>{getTextEmpty({ txt: magDef })}</Text>
              ),
            },
          ] as ColumnsType<LunarJadeEnhancementStats>)),
      {
        title: "Final Damage",
        responsive: ["lg"],
        render: (_, { fd }) => <Text>{getTextEmpty({ txt: fd })}</Text>,
      },
      {
        title: "Hero Skill ATK",
        responsive: ["lg"],
        render: (_, { hsSkillPercent }) => (
          <Text>{getTextEmpty({ txt: hsSkillPercent, tailText: "%" })}</Text>
        ),
      },
    ];
  };

  const calcEnhanceDataSource = (temp: Array<FormEnhance>) => {
    if (!temp || !Array.isArray(temp) || temp.length < 1) {
      return { errorDt: ["Empty List"] };
    }
    // mats
    let tempStigmata = 0;
    let tempCrystal = 0;
    let tempRemains = 0;
    let tempGold = 0;
    let tempHgHoly = 0;
    let tempHgBurn = 0;
    let tempHgPitch = 0;
    let tempHgCrys = 0;
    let tempHgTail = 0;
    let tempHgArd = 0;

    // stats
    let tempAttack = 0;
    let tempAttPercent = 0;
    let tempFd = 0;
    let tempHsSkillPercent = 0;
    // att
    let tempAttackPercent = 0;
    let tempCritical = 0;
    let tempCriticalDamage = 0;
    // def
    let tempHpPercent = 0;
    let tempHp = 0;
    let tempPhyDef = 0;
    let tempMagDef = 0;

    let errorMsg: string[] = [];

    temp.forEach((enhItem, idx) => {
      if (!enhItem || (!enhItem?.type && !enhItem?.listEnhance)) {
        errorMsg.push(`Nothing to calculate in Enhance ${idx + 1}`);
      } else if (
        enhItem?.type &&
        enhItem?.listEnhance &&
        enhItem?.listEnhance.length > 0
      ) {
        enhItem?.listEnhance.forEach((item, i) => {
          if (!item || (!item?.amt && !item?.range)) {
            errorMsg.push(
              `Nothing to calculate on Enhance ${idx + 1} list ${i + 1}`
            );
          } else if (item?.amt && item?.range) {
            // mats
            let tempStigmataC = 0;
            let tempCrystalC = 0;
            let tempRemainsC = 0;
            let tempGoldC = 0;
            let tempHgC = 0;

            const isAtt = enhItem?.type === LUNAR_JADE_TYPE.ATT;

            const tempSliceMats = (
              isAtt
                ? LunarJadeAttEnhancementMatsTable
                : LunarJadeDefEnhancementMatsTable
            ).slice(item?.range[0] + 1, item?.range[1] + 1);

            tempSliceMats.forEach((slicedItem) => {
              tempStigmataC += slicedItem.stigmata;
              tempCrystalC += slicedItem.crystal;
              tempRemainsC += slicedItem.remains;
              tempGoldC += slicedItem.gold;
              tempHgC += slicedItem.hgFragment;
            });

            tempStigmata += tempStigmataC * item?.amt;
            tempCrystal += tempCrystalC * item?.amt;
            tempRemains += tempRemainsC * item?.amt;
            tempGold += tempGoldC * item?.amt;
            const totalHG = tempHgC * item?.amt;
            if (isAtt) {
              tempHgHoly += totalHG;
              tempHgBurn += totalHG;
              tempHgPitch += totalHG;
            } else {
              tempHgCrys += totalHG;
              tempHgTail += totalHG;
              tempHgArd += totalHG;
            }

            // stats
            const tempArrStats = isAtt
              ? LunarJadeAttEnhancementStatsTable
              : LunarJadeDefEnhancementStatsTable;

            const dt1 =
              tempArrStats.length > item?.range[0]
                ? tempArrStats[item?.range[0]]
                : undefined;
            const dt2 =
              tempArrStats.length > item?.range[1]
                ? tempArrStats[item?.range[1]]
                : undefined;

            const minusAndMulti = (n1?: number, n2?: number, ex?: number) => {
              return ((n1 ?? 0) - (n2 ?? 0)) * (ex ?? 1);
            };
            if (dt1 && dt2) {
              tempAttack += minusAndMulti(dt2.attack, dt1.attack, item?.amt);
              tempAttPercent += minusAndMulti(
                dt2.attPercent,
                dt1.attPercent,
                item?.amt
              );
              tempFd += minusAndMulti(dt2.fd, dt1.fd, item?.amt);
              tempHsSkillPercent += minusAndMulti(
                dt2.hsSkillPercent,
                dt1.hsSkillPercent,
                item?.amt
              );
              // att
              tempAttackPercent += minusAndMulti(
                dt2.attackPercent,
                dt1.attackPercent,
                item?.amt
              );
              tempCritical += minusAndMulti(
                dt2.critical,
                dt1.critical,
                item?.amt
              );
              tempCriticalDamage += minusAndMulti(
                dt2.criticalDamage,
                dt1.criticalDamage,
                item?.amt
              );
              // def
              tempHpPercent += minusAndMulti(
                dt2.hpPercent,
                dt1.hpPercent,
                item?.amt
              );
              tempHp += minusAndMulti(dt2.hp, dt1.hp, item?.amt);
              tempPhyDef += minusAndMulti(dt2.phyDef, dt1.phyDef, item?.amt);
              tempMagDef += minusAndMulti(dt2.magDef, dt1.magDef, item?.amt);
            }
          } else {
            let emsg = "";
            if (!item?.amt) {
              emsg = "Amount";
            } else if (!item?.range) {
              emsg = "Range";
            }
            errorMsg.push(
              `The ${emsg} in Enhance ${idx + 1}, item ${
                i + 1
              } haven't inputted properly`
            );
          }
        });
      } else {
        let msg = "";
        if (!enhItem?.type) {
          msg = "Type";
        } else if (!enhItem?.listEnhance || enhItem?.listEnhance.length === 0) {
          msg = "List";
        }
        errorMsg.push(`Empty ${msg} in Enhance ${idx + 1}`);
      }
    });

    return {
      matsData: {
        "Lunar Eclipse Stigmata": tempStigmata,
        "Lunar Eclipse Crystal": tempCrystal,
        "Lunar Eclipse Remains": tempRemains,
        "HG Holy Lunar": { amt: tempHgHoly, type: LunarFragmentList.holy },
        "HG Burning Lunar": {
          amt: tempHgBurn,
          type: LunarFragmentList.burning,
        },
        "HG Pitch Black Lunar": {
          amt: tempHgPitch,
          type: LunarFragmentList.pitch,
        },
        "HG Crystal Clear Lunar": {
          amt: tempHgCrys,
          type: LunarFragmentList.crystal,
        },
        "HG Tailwind Lunar": {
          amt: tempHgTail,
          type: LunarFragmentList.tailwind,
        },
        "HG Ardent Lunar": { amt: tempHgArd, type: LunarFragmentList.ardent },
        Gold: tempGold,
      },
      statsData: {
        attack: tempAttack,
        attPercent: tempAttPercent,
        fd: tempFd,
        hsSkillPercent: tempHsSkillPercent,
        // att
        attackPercent: tempAttackPercent,
        critical: tempCritical,
        criticalDamage: tempCriticalDamage,
        // def
        hpPercent: tempHpPercent,
        hp: tempHp,
        phyDef: tempPhyDef,
        magDef: tempMagDef,
      },
      errorDt: errorMsg.length > 0 ? errorMsg : undefined,
    } as MatsTableRes;
  };

  useEffect(() => {
    setEnhanceDataSource(
      calcEnhanceDataSource([{ type: null, listEnhance: null }])
    );
  }, []);

  const onValuesChange = (_: any, allValues: { items: Array<FormEnhance> }) => {
    setEnhanceDataSource(calcEnhanceDataSource(allValues.items));
  };

  const getEnhanceCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Enhance List</Divider>
          <Form
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            form={formEnhance}
            name="dynamic_form_complex"
            style={{ maxWidth: 600 }}
            autoComplete="off"
            initialValues={{ items: [{}] }}
            onValuesChange={onValuesChange}
          >
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div
                  style={{
                    display: "flex",
                    rowGap: 16,
                    flexDirection: "column",
                  }}
                >
                  {fields.map((field, index) => (
                    <Card
                      size="small"
                      title={`Enhance ${field.name + 1}`}
                      style={{ minWidth: 320 }}
                      key={field.key}
                      id={`${field.name}-card-${index}`}
                      extra={
                        <CloseOutlined
                          onClick={() => {
                            remove(field.name);
                          }}
                        />
                      }
                    >
                      <Form.Item
                        label="Type"
                        name={[field.name, "type"]}
                        rules={[{ required: true }]}
                        id={`${field.name}-type-${index}`}
                      >
                        <Radio.Group>
                          <Radio.Button value={LUNAR_JADE_TYPE.ATT}>
                            Attack
                          </Radio.Button>
                          <Radio.Button value={LUNAR_JADE_TYPE.DEF}>
                            Defense
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>

                      {/* Nest Form.List */}
                      <Form.Item label="List">
                        <Form.List name={[field.name, "listEnhance"]}>
                          {(subFields, subOpt) => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                rowGap: 18,
                              }}
                            >
                              {subFields.map((subField, idx) => (
                                <Card
                                  key={subField.key}
                                  size="small"
                                  style={{ width: "100%" }}
                                  id={`${subField.name}-card-${idx}`}
                                >
                                  <Space
                                    direction="horizontal"
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <Form.Item
                                      noStyle
                                      name={[subField.name, "amt"]}
                                      id={`${subField.name}-amt-${idx}`}
                                    >
                                      <InputNumber
                                        placeholder="amount"
                                        max={20}
                                        min={0}
                                      />
                                    </Form.Item>

                                    <CloseOutlined
                                      onClick={() => {
                                        subOpt.remove(subField.name);
                                      }}
                                    />
                                  </Space>

                                  <Form.Item
                                    noStyle
                                    name={[subField.name, "range"]}
                                  >
                                    <CustomSlider
                                      id={`${subField.name}-range-${idx}`}
                                    />
                                  </Form.Item>
                                </Card>
                              ))}
                              <Button
                                type="dashed"
                                onClick={() => subOpt.add()}
                                block
                                disabled={subFields && subFields.length >= 20}
                              >
                                + Add Enhancement
                              </Button>
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    disabled={fields && fields.length >= 2}
                  >
                    + Add Type
                  </Button>
                </div>
              )}
            </Form.List>

            {/* <Form.Item noStyle shouldUpdate>
              {() => (
                <Typography>
                  <pre>
                    {JSON.stringify(formEnhance.getFieldsValue(), null, 2)}
                  </pre>
                </Typography>
              )}
            </Form.Item> */}
          </Form>
          {enhanceDataSource.errorDt &&
            enhanceDataSource.errorDt.length > 0 && (
              <div style={{ marginTop: 4, maxWidth: 300 }}>
                <Space direction="vertical" size={"small"}>
                  {enhanceDataSource.errorDt.map((it, x) => (
                    <Text type="warning" key={`error-label-${x}`}>
                      {it}
                    </Text>
                  ))}
                </Space>
              </div>
            )}
        </div>

        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <Divider orientation="left">Material List</Divider>
          {enhanceDataSource.errorDt && (
            <div>
              <Alert
                banner
                message="Some of the item you input is not valid"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={
              (enhanceDataSource.matsData
                ? typedEntries(enhanceDataSource.matsData)
                    .filter(([_, value]) => {
                      if (typeof value === "number") {
                        return value !== 0;
                      }
                      return value.amt !== 0;
                    })
                    .map(([key, value]) => {
                      if (typeof value === "number") {
                        return {
                          mats: key,
                          amount: value,
                        };
                      }
                      return {
                        mats: key,
                        amount: value.amt,
                        customLabel: {
                          lunarStyle: value.type,
                        },
                      };
                    })
                : []) as TableResource[]
            }
            columns={columnsResource}
            pagination={false}
            bordered
          />
          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK",
                value: enhanceDataSource.statsData?.attack,
                format: true,
              },
              {
                title: "ATT",
                value: enhanceDataSource.statsData?.attPercent,
                suffix: "%",
              },
              {
                title: "FD",
                value: enhanceDataSource.statsData?.fd,
                format: true,
              },
              {
                title: "HS Skill",
                value: enhanceDataSource.statsData?.hsSkillPercent,
                format: true,
              },
              {
                title: "ATK",
                value: enhanceDataSource.statsData?.attackPercent,
                suffix: "%",
              },
              {
                title: "CRT",
                value: enhanceDataSource.statsData?.critical,
                format: true,
              },
              {
                title: "CDM",
                value: enhanceDataSource.statsData?.criticalDamage,
                format: true,
              },
              {
                title: "HP",
                value: enhanceDataSource.statsData?.hpPercent,
                suffix: "%",
              },
              {
                title: "HP",
                value: enhanceDataSource.statsData?.hp,
                format: true,
              },
              {
                title: "Phy Def",
                value: enhanceDataSource.statsData?.phyDef,
                format: true,
              },
              {
                title: "Mag Def",
                value: enhanceDataSource.statsData?.magDef,
                format: true,
              },
            ]}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          {enhanceDataSource.matsData && (
            <TradingHouseCalc
              data={[
                {
                  name: "Lunar Eclipse Crystal",
                  amt: enhanceDataSource.matsData["Lunar Eclipse Crystal"],
                },
                {
                  name: "Lunar Eclipse Remains",
                  amt: enhanceDataSource.matsData["Lunar Eclipse Remains"],
                },
                {
                  name: "HG Holy Lunar",
                  amt: enhanceDataSource.matsData["HG Holy Lunar"].amt,
                },
                {
                  name: "HG Burning Lunar",
                  amt: enhanceDataSource.matsData["HG Burning Lunar"].amt,
                },
                {
                  name: "HG Pitch Black Lunar",
                  amt: enhanceDataSource.matsData["HG Pitch Black Lunar"].amt,
                },
                {
                  name: "HG Crystal Clear Lunar",
                  amt: enhanceDataSource.matsData["HG Crystal Clear Lunar"].amt,
                },
                {
                  name: "HG Tailwind Lunar",
                  amt: enhanceDataSource.matsData["HG Tailwind Lunar"].amt,
                },
                {
                  name: "HG Ardent Lunar",
                  amt: enhanceDataSource.matsData["HG Ardent Lunar"].amt,
                },
              ]}
              additionalTotal={enhanceDataSource.matsData?.Gold}
            />
          )}
        </div>
      </div>
    );
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Craft Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ maxWidth: 500, marginRight: 30 }}>
            <Title level={5}>{"Lunar Fragment Amount"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeCraftAmountTable}
              columns={columnsLunar}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ maxWidth: 400 }}>
            <Title level={5}>{"Craftable"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeCraftMaterialList}
              columns={columnsCraft}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Craft",
      children: getCalculator(),
    },
    {
      key: "3",
      label: "Enhance Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: "100%", marginRight: 30 }}>
            <div style={{ maxWidth: 400 }}>
              <Title level={5}>{"Craftable"}</Title>
              <Table
                size={"small"}
                dataSource={LunarJadeEnhanceMaterialList}
                columns={columnsEnhance}
                pagination={false}
                bordered
              />
            </div>
          </div>
          <div style={{ marginRight: 30 }}>
            <Title level={5}>{"Enhance Attack Jade Materials"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeAttEnhancementMatsTable}
              columns={getMatsCol(true)}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 30 }}>
            <Title level={5}>{"Enhance Defense Jade Materials"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeDefEnhancementMatsTable}
              columns={getMatsCol()}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 30 }}>
            <Title level={5}>{"Enhance Attack Jade Stats"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeAttEnhancementStatsTable}
              columns={getEnhanceCol(true)}
              pagination={false}
              bordered
            />
          </div>
          <div style={{}}>
            <Title level={5}>{"Enhance Defense Jade Stats"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeDefEnhancementStatsTable}
              columns={getEnhanceCol()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "4",
      label: "Enhance",
      children: getEnhanceCalculator(),
    },
  ];

  return (
    <div>
      <Collapse
        items={items}
        size="small"
        defaultActiveKey={activeKey.current}
      />
    </div>
  );
};

export default LunarJadeCalculatorContent;
