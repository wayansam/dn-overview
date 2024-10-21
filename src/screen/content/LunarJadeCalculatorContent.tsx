import type { CollapseProps } from "antd";
import {
  Alert,
  Checkbox,
  Collapse,
  Divider,
  Form,
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
import React, { useContext, useEffect, useMemo, useState } from "react";
import { EQUIPMENT, LUNAR_JADE_RARITY } from "../../constants/InGame.constants";
import { dataCalculator } from "../../data/lunarCalculatorData";
import {
  LunarJadeCraftAmountTable,
  LunarJadeCraftMaterialList,
  concentratedDimensionalEnergyCraftMats,
  tigerIntactOrbCraftMats,
} from "../../data/lunarData";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import {
  LunarFragmentData,
  LunarJadeCraftAmount,
  LunarJadeCraftMaterial,
} from "../../interface/Item.interface";
import { getColor } from "../../utils/common.util";

const { Text } = Typography;
const { Option } = Select;

interface TableResource {
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
  value: LUNAR_JADE_RARITY;
  label: LUNAR_JADE_RARITY;
  rateValue: number;
}

export const equipmentCraftOpt: optItem[] = [
  {
    value: LUNAR_JADE_RARITY.CRAFT,
    label: LUNAR_JADE_RARITY.CRAFT,
    rateValue: 1,
  },
  {
    value: LUNAR_JADE_RARITY.NORMAL,
    label: LUNAR_JADE_RARITY.NORMAL,
    rateValue: 2,
  },
  {
    value: LUNAR_JADE_RARITY.MAGIC,
    label: LUNAR_JADE_RARITY.MAGIC,
    rateValue: 3,
  },
  {
    value: LUNAR_JADE_RARITY.RARE,
    label: LUNAR_JADE_RARITY.RARE,
    rateValue: 4,
  },
  {
    value: LUNAR_JADE_RARITY.EPIC,
    label: LUNAR_JADE_RARITY.EPIC,
    rateValue: 5,
  },
  {
    value: LUNAR_JADE_RARITY.UNIQUE,
    label: LUNAR_JADE_RARITY.UNIQUE,
    rateValue: 6,
  },
  {
    value: LUNAR_JADE_RARITY.LEGEND,
    label: LUNAR_JADE_RARITY.LEGEND,
    rateValue: 7,
  },
  {
    value: LUNAR_JADE_RARITY.ANCIENT,
    label: LUNAR_JADE_RARITY.ANCIENT,
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
  const [selectItem, setSelectItem] = useState<LUNAR_JADE_RARITY>(
    LUNAR_JADE_RARITY.CRAFT
  );
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

  const handleChange = (value: LUNAR_JADE_RARITY) => {
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

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer, colorText },
  } = theme.useToken();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<LunarJadeCalculator[]>(dataCalculator);
  const [qtVal, setQtVal] = useState<string>("min");
  const [selectFrom, setSelectFrom] = useState<LUNAR_JADE_RARITY>(
    LUNAR_JADE_RARITY.CRAFT
  );
  const [selectTo, setSelectTo] = useState<LUNAR_JADE_RARITY>(
    LUNAR_JADE_RARITY.NORMAL
  );
  const [changeOrb, setChangeOrb] = useState<boolean>(false);
  const [changeEnergy, setChangeEnergy] = useState<boolean>(false);

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

  const tableResource: TableResource[] = useMemo(() => {
    let temp: TableResource[] = [];
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

  const columnsResource: ColumnsType<TableResource> = [
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
    },
    {
      title: "High Grade Fragment",
      dataIndex: "amountHGFragment",
      width: 150,
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
            columns={columnsResource}
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

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Craft Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ width: 500, marginRight: 30 }}>
            <Title level={5}>{"Lunar Fragment Amount"}</Title>
            <Table
              size={"small"}
              dataSource={LunarJadeCraftAmountTable}
              columns={columnsLunar}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ width: 400 }}>
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
      label: "Calculate",
      children: getCalculator(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default LunarJadeCalculatorContent;
