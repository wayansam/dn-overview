import type { CollapseProps } from "antd";
import {
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
  theme,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { ColumnGroupType, ColumnType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import CalcCard from "../../../components/CalcCard";
import FlagAlert from "../../../components/FlagAlert";
import JadeEnhanceListForm from "../../../components/JadeEnhanceListForm";
import ListingCard from "../../../components/ListingCard";
import MaterialListTable from "../../../components/MaterialListTable";
import TradingHouseCalc from "../../../components/TradingHouseCalc";
import TypeFilterToggle from "../../../components/TypeFilterToggle";
import {
  EmptyCommonnStat,
  TableResource,
} from "../../../constants/Common.constants";
import {
  EQUIPMENT,
  ITEM_RARITY,
  LUNAR_JADE_TYPE,
} from "../../../constants/InGame.constants";
import { dataCalculator } from "../../../data/jade/lunarCalculatorData";
import {
  LunarFragmentList,
  LunarJadeAttEnhancementMatsTable,
  LunarJadeAttEnhancementStatsTable,
  LunarJadeCraftAmountTable,
  LunarJadeCraftMaterialList,
  LunarJadeDefEnhancementMatsTable,
  LunarJadeDefEnhancementStatsTable,
  LunarJadeEnhanceMaterialList,
  collapseJewelUniqueCraftMats,
  collapseUniqueAttBaseStats,
  collapseUniqueDefBaseStats,
  concentratedDimensionalEnergyCraftMats,
  tigerIntactOrbCraftMats,
} from "../../../data/jade/lunarData";
import { useAppSelector } from "../../../hooks";
import { reduceJadeEnhanceList } from "../../../hooks/useJadeCalculator";
import { LunarJadeCalculator } from "../../../interface/Common.interface";
import { LunarFragmentData } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  multiplyEqStats,
  typedEntries,
} from "../../../utils/common.util";
import {
  columnsCraft,
  columnsEnhance,
  columnsResourceLunar,
  getCraftAmountColumns,
  getMatsCol,
  TableLunarResource,
} from "./lunarJadeColumns";

const { useBreakpoint } = Grid;
const { Option } = Select;

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

type ColumnTypes = (
  | ColumnGroupType<LunarJadeCalculator>
  | ColumnType<LunarJadeCalculator>
)[];

interface LunarEnhanceItem {
  range?: [number, number] | null;
  amt?: number | null;
  evolve?: boolean | null;
}

interface FormEnhance {
  type: string | null;
  listEnhance: LunarEnhanceItem[] | null;
}

interface CraftMaterialList {
  Gold: number;
  Stigmata: number;
  "Tiger Orb": number;
  "Conc. Dim. Energy": number;
  "Broken Orb": number;
  "Dimensional Energy": number;
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
  "Collapse Dragon Jade Fragment": number;
  "Ancient's Foundation Stone": number;
  "Dimensional Vestige": number;
  Gold: number;
}

interface MatsTableRes {
  matsData?: EnhanceTableMaterialList;
  statsData?: CommonItemStats;
  errorDt?: string[];
}

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorText },
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

  // One walk of the rarity ladder per selected row, filling both the material
  // totals and the per-fragment table. This used to be seven near-identical
  // useMemos (fragments, gold, stigmata, orb, energy, broken orb, dim energy),
  // each re-walking LunarJadeCraftAmountTable with the same `adding` loop.
  const craftResource = useMemo((): {
    mats: CraftMaterialList;
    fragments: TableLunarResource[];
  } => {
    const mats: CraftMaterialList = {
      Gold: 0,
      Stigmata: 0,
      "Tiger Orb": 0,
      "Conc. Dim. Energy": 0,
      "Broken Orb": 0,
      "Dimensional Energy": 0,
    };
    const fragments: TableLunarResource[] = [];
    if (invalidDtSrc) {
      return { mats, fragments };
    }

    selectedRowKeys.forEach((key) => {
      const found = dataSource.find((dt) => dt.key === key);
      if (!found) {
        return;
      }
      const { equipment, from, to, defaultValue } = found;

      let adding = false;
      let fragment = 0;
      let hgFragment = 0;
      let stigmata = 0;
      let gold = 0;
      let orb = 0;
      let energy = 0;
      LunarJadeCraftAmountTable.forEach((item) => {
        if (adding) {
          fragment += item.quantity;
          hgFragment += item.quantityHg;
          stigmata += item.stigmata;
          gold += item.gold;
          orb += item.tigerIntactOrb;
          energy += item.concentratedDimensionalEnergy;
        }
        if (item.rarity === from) {
          adding = true;
        }
        if (item.rarity === to) {
          adding = false;
        }
      });

      mats.Stigmata += stigmata * defaultValue;
      mats.Gold += gold * defaultValue;
      // Each "change to mats" toggle swaps the item itself for its craft cost.
      if (changeOrb) {
        mats.Gold += orb * defaultValue * tigerIntactOrbCraftMats.gold;
        mats["Broken Orb"] +=
          orb * defaultValue * tigerIntactOrbCraftMats.tigerIntactOrb;
      } else {
        mats["Tiger Orb"] += orb * defaultValue;
      }
      if (changeEnergy) {
        mats.Gold +=
          energy * defaultValue * concentratedDimensionalEnergyCraftMats.gold;
        mats["Broken Orb"] +=
          energy *
          defaultValue *
          concentratedDimensionalEnergyCraftMats.tigerIntactOrb;
        mats["Dimensional Energy"] +=
          energy *
          defaultValue *
          concentratedDimensionalEnergyCraftMats.dimensionalEnergy;
      } else {
        mats["Conc. Dim. Energy"] += energy * defaultValue;
      }

      LunarJadeCraftMaterialList.find(
        (mat) => mat.equipmentType === equipment
      )?.lunarFragment.forEach((frag) => {
        const idx = fragments.findIndex(
          (tmp) => tmp.lunarFragment.type === frag.type
        );
        if (idx === -1) {
          fragments.push({
            lunarFragment: frag,
            amountFragment: fragment * defaultValue,
            amountHGFragment: hgFragment * defaultValue,
          });
        } else {
          fragments[idx] = {
            ...fragments[idx],
            amountFragment:
              fragments[idx].amountFragment + fragment * defaultValue,
            amountHGFragment:
              fragments[idx].amountHGFragment + hgFragment * defaultValue,
          };
        }
      });
    });

    return { mats, fragments };
  }, [selectedRowKeys, dataSource, invalidDtSrc, changeOrb, changeEnergy]);

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
          defaultValue: item.equipment === EQUIPMENT.RING1 ? 2 : 1,
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
        <CalcCard>
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
        </CalcCard>
        <CalcCard>
          <FlagAlert
            show={invalidDtSrc}
            message="From cannot exceed the To option"
            type="error"
          />
          <Divider orientation="left">Settings</Divider>
          <TypeFilterToggle
            options={[
              { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
              { label: "Weapon", keys: ["6", "7"] },
              { label: "Accessories", keys: ["8", "9", "10"] },
            ]}
            selectedRowKeys={selectedRowKeys}
            onChange={setSelectedRowKeys}
          />
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
          <MaterialListTable data={craftResource.mats} hideZero />
          <Table
            size={"small"}
            rowKey={({ lunarFragment }) => lunarFragment.type}
            dataSource={craftResource.fragments}
            columns={columnsResourceLunar}
            pagination={false}
            bordered
          />
        </CalcCard>
      </div>
    );
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
    let tempCollapseFragment = 0;
    let tempFoundationStone = 0;
    let tempDimVestige = 0;

    // stats
    let tempStat: CommonItemStats = { ...EmptyCommonnStat };

    const errorMsg = reduceJadeEnhanceList<LunarEnhanceItem>(
      temp,
      ({ type, item, amt, range, groupNo, itemNo, pushError }) => {
        // mats
        let tempStigmataC = 0;
        let tempCrystalC = 0;
        let tempRemainsC = 0;
        let tempGoldC = 0;
        let tempHgC = 0;

        const isAtt = type === LUNAR_JADE_TYPE.ATT;

        const tempSliceMats = (
          isAtt
            ? LunarJadeAttEnhancementMatsTable
            : LunarJadeDefEnhancementMatsTable
        ).slice(range[0] + 1, range[1] + 1);

        tempSliceMats.forEach((slicedItem) => {
          tempStigmataC += slicedItem.stigmata;
          tempCrystalC += slicedItem.crystal;
          tempRemainsC += slicedItem.remains;
          tempGoldC += slicedItem.gold;
          tempHgC += slicedItem.hgFragment;
        });

        tempStigmata += tempStigmataC * amt;
        tempCrystal += tempCrystalC * amt;
        tempRemains += tempRemainsC * amt;
        tempGold += tempGoldC * amt;
        const totalHG = tempHgC * amt;
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

        const { dt1, dt2 } = getComparedData(
          tempArrStats,
          range[0] + 1,
          range[1] + 1
        );
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          tempStat = combineEqStats(tempStat, multiplyEqStats(dt, amt), "add");
        }

        // Evolving +20 Ancient into Collapse Dragon Jade (Unique): add the
        // Collapse Jewel (Unique) mats and swap +20 basic stats for the
        // Unique ones. Hero Skill ATK is a retained skill effect.
        if (item?.evolve) {
          const maxLevel = tempArrStats.length - 1;
          const lunarMax = tempArrStats[maxLevel];
          if (range[1] !== maxLevel) {
            pushError(
              `Evolve in Enhance ${groupNo}, item ${itemNo} needs the range to end at +${maxLevel}`
            );
          } else if (lunarMax) {
            const unique = isAtt
              ? collapseUniqueAttBaseStats
              : collapseUniqueDefBaseStats;
            tempCollapseFragment +=
              collapseJewelUniqueCraftMats.collapseFragment * amt;
            tempFoundationStone +=
              collapseJewelUniqueCraftMats.foundationStone * amt;
            tempDimVestige += collapseJewelUniqueCraftMats.dimVestige * amt;
            tempGold += collapseJewelUniqueCraftMats.gold * amt;

            // Hero Skill ATK is a retained skill effect, so it is carried
            // over unchanged instead of being swapped for the Unique value.
            const evolveDif = combineEqStats(
              {
                ...unique,
                encLevel: lunarMax.encLevel,
                hsSkillPercent: lunarMax.hsSkillPercent,
              },
              lunarMax,
              "minus"
            );
            tempStat = combineEqStats(
              tempStat,
              multiplyEqStats(evolveDif, amt),
              "add"
            );
          }
        }
      },
      { requireRange: true }
    );

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
        "Collapse Dragon Jade Fragment": tempCollapseFragment,
        "Ancient's Foundation Stone": tempFoundationStone,
        "Dimensional Vestige": tempDimVestige,
        Gold: tempGold,
      },
      statsData: tempStat,
      errorDt: errorMsg.length > 0 ? errorMsg : undefined,
    } as MatsTableRes;
  };

  useEffect(() => {
    setEnhanceDataSource(
      calcEnhanceDataSource([{ type: null, listEnhance: null }])
    );
  }, []);

  const getWidthSetting = () => {
    if (screens.xs) {
      return 200;
    }
    return 320;
  };

  const getEnhanceCalculator = () => (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <CalcCard>
        <JadeEnhanceListForm<LunarEnhanceItem>
          form={formEnhance}
          types={[
            { label: "Attack", value: LUNAR_JADE_TYPE.ATT },
            { label: "Defense", value: LUNAR_JADE_TYPE.DEF },
          ]}
          onValuesChange={(values) =>
            setEnhanceDataSource(calcEnhanceDataSource(values.items))
          }
          errors={enhanceDataSource.errorDt}
          width={getWidthSetting()}
          itemToggle={{
            name: "evolve",
            label: "Evolve to Collapse Dragon Jade (Unique)",
            tooltip: `Range must end at +20. Adds 1 Collapse Jewel (Unique) per jade: ${collapseJewelUniqueCraftMats.collapseFragment.toLocaleString()} Collapse Dragon Jade Fragment, ${collapseJewelUniqueCraftMats.foundationStone.toLocaleString()} Ancient's Foundation Stone, ${collapseJewelUniqueCraftMats.dimVestige.toLocaleString()} Dimensional Vestige, ${collapseJewelUniqueCraftMats.gold.toLocaleString()} Gold`,
          }}
        />
      </CalcCard>

      <CalcCard>
        <Divider orientation="left">Material List</Divider>
        <FlagAlert
          show={!!enhanceDataSource.errorDt}
          message="Some of the item you input is not valid"
          type="warning"
        />
        <Table
          size={"small"}
          rowKey="mats"
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
          data={getStatDif(enhanceDataSource.statsData)}
        />
      </CalcCard>
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
            {
              name: "Dimensional Vestige",
              amt: enhanceDataSource.matsData["Dimensional Vestige"],
            },
          ]}
          additionalTotal={enhanceDataSource.matsData?.Gold}
        />
      )}
    </div>
  );

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
              rowKey="rarity"
              dataSource={LunarJadeCraftAmountTable}
              columns={getCraftAmountColumns(colorText)}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ maxWidth: 400 }}>
            <Title level={5}>{"Craftable"}</Title>
            <Table
              size={"small"}
              rowKey="equipmentType"
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
                rowKey="jadeType"
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
              rowKey="encLevel"
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
              rowKey="encLevel"
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
              rowKey="encLevel"
              dataSource={LunarJadeAttEnhancementStatsTable}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                phyMagAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                hsSkillPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
          <div style={{}}>
            <Title level={5}>{"Enhance Defense Jade Stats"}</Title>
            <Table
              size={"small"}
              rowKey="encLevel"
              dataSource={LunarJadeDefEnhancementStatsTable}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                hpPercentFlag: true,
                hpFlag: true,
                defFlag: true,
                magdefFlag: true,
                fdFlag: true,
                hsSkillPercentFlag: true,
              })}
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
