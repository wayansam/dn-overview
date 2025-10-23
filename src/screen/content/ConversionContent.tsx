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
import {
  dataConversionCalculator,
  conversionHelmStats,
  conversionUpperStats,
  conversionLowerStats,
  conversionGloveStats,
  conversionShoesStats,
  conversionMainStats,
  conversionSecondStats,
  conversionNecklaceStats,
  conversionEarringStats,
  conversionRingStats,
  conversionWingStats,
  conversionTailStats,
  conversionDecalStats,
} from "../../data/ConversionCalculatorData";
import { ConversionCalculator } from "../../interface/Common.interface";
import {
  columnsResource,
  getTextEmpty,
  getComparedData,
} from "../../utils/common.util";
import {
  ConversionStats,
  columnConversionFlag,
} from "../../interface/ItemStat.interface";
import ListingCard from "../../components/ListingCard";

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
  if (item >= 12) {
    return `Legend +${item - 12}`;
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

const CONV_FRAG = 3500;
const WEAP_FRAG = 1;
const EV_AST_STONE = 3;
const EV_AST_POW_ARMOR = 1000;
const EV_AST_POW_WEAP = 1500;
const EV_AST_POW_ACC = 1150;
const EV_AST_POW_WTD = 1300;
const WEAP_ENH_SUC_RATE = [50, 40, 35, 20, 10, 7, 5, 5, 3, 3];
const ENC_AST_POW_ARMOR = 450;
const ENC_AST_STONE_ARMOR = 1;
const ENC_AST_POW_ACC = 500;
const ENC_AST_STONE_ACC = 3;

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<ConversionCalculator[]>(
    dataConversionCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

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

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const isBuy = from === 0;
        const isEnhUnique = to <= 11 && from <= 11;
        const isEvo = to >= 12 && from <= 11;
        let frag =
          (Math.min(to, 11) - Math.max(isEnhUnique ? from : 11, 1)) *
            CONV_FRAG +
          (isBuy ? CONV_FRAG : 0);

        let lgFrag = 0;
        let lgStone = 0;
        let enhLRange = Math.min(to, 15) - Math.max(from, 1) - (isEvo ? 1 : 0);
        switch (equipment) {
          case CONVERSION_TYPE.HELM:
          case CONVERSION_TYPE.UPPER:
          case CONVERSION_TYPE.LOWER:
          case CONVERSION_TYPE.GLOVE:
          case CONVERSION_TYPE.SHOES:
            temp["Armor Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_ARMOR;
              lgStone += EV_AST_STONE;
            }
            if (!isEnhUnique) {
              lgFrag += enhLRange * ENC_AST_POW_ARMOR;
              lgStone += enhLRange * ENC_AST_STONE_ARMOR;
            }
            break;

          case CONVERSION_TYPE.MAIN_WEAPON:
          case CONVERSION_TYPE.SECOND_WEAPON:
            if (isEvo) {
              lgFrag += EV_AST_POW_WEAP;
              lgStone += EV_AST_STONE;
            }
            break;

          case CONVERSION_TYPE.NECKLACE:
          case CONVERSION_TYPE.EARRING:
          case CONVERSION_TYPE.RING:
            temp["Acc Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_ACC;
              lgStone += EV_AST_STONE;
            }
            if (!isEnhUnique) {
              lgFrag += enhLRange * ENC_AST_POW_ACC;
              lgStone += enhLRange * ENC_AST_STONE_ACC;
            }
            break;

          case CONVERSION_TYPE.WING:
          case CONVERSION_TYPE.TAIL:
          case CONVERSION_TYPE.DECAL:
            temp["Wtd Fragment"] += frag;
            if (isEvo) {
              lgFrag += EV_AST_POW_WTD;
              lgStone += EV_AST_STONE;
            }
            break;

          default:
            break;
        }

        temp["Astral Powder"] += lgFrag;
        temp["Astral Stone"] += lgStone;
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  function combineConversionStats(
    a: ConversionStats,
    b: ConversionStats,
    operation: "add" | "minus"
  ): ConversionStats {
    const result: ConversionStats = { ...a };

    const keys = Object.keys({ ...a, ...b }) as (keyof ConversionStats)[];

    for (const key of keys) {
      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === "number" && typeof valueB === "number") {
        const computed =
          operation === "add" ? valueA + valueB : valueA - valueB;

        (result as any)[key] = computed;
      }
    }

    return result;
  }

  const statDif: ConversionStats = useMemo(() => {
    let temp: ConversionStats = {
      encLevel: "0",
      phyMagAtk: 0,
      phyMagAtkPercent: 0,
      attAtkPercent: 0,

      crt: 0,
      crtPercent: 0,
      cdm: 0,
      fd: 0,

      str: 0,
      agi: 0,
      int: 0,
      vit: 0,
      strPercent: 0,
      agiPercent: 0,
      intPercent: 0,
      vitPercent: 0,

      defMagdef: 0,
      defMagdefPercent: 0,
      hp: 0,
      hpPercent: 0,
      moveSpeedPercent: 0,
      moveSpeedPercentTown: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;

        let tableHolder: ConversionStats[];
        switch (equipment) {
          case CONVERSION_TYPE.HELM:
            tableHolder = conversionHelmStats;
            break;
          case CONVERSION_TYPE.UPPER:
            tableHolder = conversionUpperStats;
            break;
          case CONVERSION_TYPE.LOWER:
            tableHolder = conversionLowerStats;
            break;
          case CONVERSION_TYPE.GLOVE:
            tableHolder = conversionGloveStats;
            break;
          case CONVERSION_TYPE.SHOES:
            tableHolder = conversionShoesStats;
            break;

          case CONVERSION_TYPE.MAIN_WEAPON:
            tableHolder = conversionMainStats;
            break;
          case CONVERSION_TYPE.SECOND_WEAPON:
            tableHolder = conversionSecondStats;
            break;

          case CONVERSION_TYPE.NECKLACE:
            tableHolder = conversionNecklaceStats;
            break;
          case CONVERSION_TYPE.EARRING:
            tableHolder = conversionEarringStats;
            break;
          case CONVERSION_TYPE.RING:
            tableHolder = conversionRingStats;
            break;

          case CONVERSION_TYPE.WING:
            tableHolder = conversionWingStats;
            break;
          case CONVERSION_TYPE.TAIL:
            tableHolder = conversionTailStats;
            break;
          case CONVERSION_TYPE.DECAL:
            tableHolder = conversionDecalStats;
            break;

          default:
            tableHolder = [];
            break;
        }
        const { dt1, dt2 } = getComparedData(tableHolder, from, to);
        if (dt2) {
          const dt = dt1 ? combineConversionStats(dt2, dt1, "minus") : dt2;
          temp = combineConversionStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const tempComp = (str: string, arr: number[]) =>
    arr.length > 0 ? (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Text>{str} succes rate from the smaller enhancement</Text>
        <Text>{arr.map((it) => `${it}%`).join(", ")}</Text>
      </div>
    ) : undefined;

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
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tempSlice = WEAP_ENH_SUC_RATE.slice(
          Math.max(from, 1) - 1,
          Math.min(to, 11) - 1
        );

        switch (equipment) {
          case CONVERSION_TYPE.MAIN_WEAPON:
            temp.main = tempComp("Main Weapon", tempSlice);
            break;
          case CONVERSION_TYPE.SECOND_WEAPON:
            temp.second = tempComp("Second Weapon", tempSlice);
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
      from:
        selectFrom < item.min
          ? item.min
          : selectFrom >= item.max
          ? item.max
          : selectFrom,
      to: selectTo > item.max ? item.max : selectTo,
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
              options={opt(0, 15)}
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
              options={opt(0, 15)}
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
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK",
                value: statDif.phyMagAtk,
                format: true,
              },
              {
                title: "ATK",
                value: statDif.phyMagAtkPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "Ele",
                value: statDif.attAtkPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "CRT",
                value: statDif.crt,
                format: true,
              },
              {
                title: "CRT",
                value: statDif.crtPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "CDM",
                value: statDif.cdm,
                format: true,
              },
              {
                title: "FD",
                value: statDif.fd,
                format: true,
              },
              {
                title: "STR",
                value: statDif.str,
                format: true,
              },
              {
                title: "AGI",
                value: statDif.agi,
                format: true,
              },
              {
                title: "INT",
                value: statDif.int,
                format: true,
              },
              {
                title: "VIT",
                value: statDif.vit,
                format: true,
              },
              {
                title: "STR",
                value: statDif.strPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "AGI",
                value: statDif.agiPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "INT",
                value: statDif.intPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "VIT",
                value: statDif.vitPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "Phy Def",
                value: statDif.defMagdef,
                format: true,
              },
              {
                title: "Mag Def",
                value: statDif.defMagdef,
                format: true,
              },
              {
                title: "Phy Def",
                value: statDif.defMagdefPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "Mag Def",
                value: statDif.defMagdefPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "HP",
                value: statDif.hp,
                format: true,
              },
              {
                title: "HP",
                value: statDif.hpPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "Movespeed",
                value: statDif.moveSpeedPercent,
                suffix: "%",
                format: true,
              },
              {
                title: "Movespeed Town",
                value: statDif.moveSpeedPercentTown,
                suffix: "%",
                format: true,
              },
            ]}
          />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const getColumnsStats = ({
      phyMagAtkFlag,
      phyMagAtkPercentFlag,
      attAtkPercentFlag,
      crtFlag,
      crtPercentFlag,
      cdmFlag,
      fdFlag,
      strFlag,
      agiFlag,
      intFlag,
      vitFlag,
      strPercentFlag,
      agiPercentFlag,
      intPercentFlag,
      vitPercentFlag,
      defMagdefFlag,
      defMagdefPercentFlag,
      hpFlag,
      hpPercentFlag,
      moveSpeedPercentFlag,
      moveSpeedPercentTownFlag,
    }: columnConversionFlag): ColumnsType<ConversionStats> => {
      const temp: ColumnsType<ConversionStats> = [];
      const smallItemTitle: string[] = [];
      if (phyMagAtkFlag) {
        smallItemTitle.push("ATK");
        temp.push({
          title: "Attack",
          responsive: ["sm"],
          render: (_, { phyMagAtk }) => (
            <div>
              <Text>{getTextEmpty({ txt: phyMagAtk })}</Text>
            </div>
          ),
        });
      }
      if (phyMagAtkPercentFlag) {
        smallItemTitle.push("ATK(%)");
        temp.push({
          title: "Attack(%)",
          responsive: ["sm"],
          render: (_, { phyMagAtkPercent }) => (
            <div>
              <Text>
                {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
              </Text>
            </div>
          ),
        });
      }
      if (attAtkPercentFlag) {
        smallItemTitle.push("ATT(%)");
        temp.push({
          title: "Attribute(%)",
          responsive: ["sm"],
          render: (_, { attAtkPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (crtFlag) {
        smallItemTitle.push("CRT");
        temp.push({
          title: "CRT",
          responsive: ["sm"],
          render: (_, { crt }) => (
            <div>
              <Text>{getTextEmpty({ txt: crt })}</Text>
            </div>
          ),
        });
      }
      if (crtPercentFlag) {
        smallItemTitle.push("CRT(%)");
        temp.push({
          title: "CRT(%)",
          responsive: ["sm"],
          render: (_, { crtPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: crtPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (cdmFlag) {
        smallItemTitle.push("CDM");
        temp.push({
          title: "CDM",
          responsive: ["sm"],
          render: (_, { cdm }) => (
            <div>
              <Text>{getTextEmpty({ txt: cdm })}</Text>
            </div>
          ),
        });
      }
      if (fdFlag) {
        smallItemTitle.push("FD");
        temp.push({
          title: "FD",
          responsive: ["sm"],
          render: (_, { fd }) => (
            <div>
              <Text>{getTextEmpty({ txt: fd })}</Text>
            </div>
          ),
        });
      }
      if (strFlag) {
        smallItemTitle.push("STR");
        temp.push({
          title: "STR",
          responsive: ["sm"],
          render: (_, { str }) => (
            <div>
              <Text>{getTextEmpty({ txt: str })}</Text>
            </div>
          ),
        });
      }
      if (agiFlag) {
        smallItemTitle.push("AGI");
        temp.push({
          title: "AGI",
          responsive: ["sm"],
          render: (_, { agi }) => (
            <div>
              <Text>{getTextEmpty({ txt: agi })}</Text>
            </div>
          ),
        });
      }
      if (intFlag) {
        smallItemTitle.push("INT");
        temp.push({
          title: "INT",
          responsive: ["sm"],
          render: (_, { int }) => (
            <div>
              <Text>{getTextEmpty({ txt: int })}</Text>
            </div>
          ),
        });
      }
      if (vitFlag) {
        smallItemTitle.push("VIT");
        temp.push({
          title: "VIT",
          responsive: ["sm"],
          render: (_, { vit }) => (
            <div>
              <Text>{getTextEmpty({ txt: vit })}</Text>
            </div>
          ),
        });
      }
      if (strPercentFlag) {
        smallItemTitle.push("STR(%)");
        temp.push({
          title: "STR(%)",
          responsive: ["sm"],
          render: (_, { strPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: strPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (agiPercentFlag) {
        smallItemTitle.push("AGI(%)");
        temp.push({
          title: "AGI(%)",
          responsive: ["sm"],
          render: (_, { agiPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: agiPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (intPercentFlag) {
        smallItemTitle.push("INT(%)");
        temp.push({
          title: "INT(%)",
          responsive: ["sm"],
          render: (_, { intPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: intPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (vitPercentFlag) {
        smallItemTitle.push("VIT(%)");
        temp.push({
          title: "VIT(%)",
          responsive: ["sm"],
          render: (_, { vitPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: vitPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (defMagdefFlag) {
        smallItemTitle.push("Phy Def", "Mag Def");
        temp.push(
          {
            title: "Phy Def",
            responsive: ["sm"],
            render: (_, { defMagdef }) => (
              <div>
                <Text>{getTextEmpty({ txt: defMagdef })}</Text>
              </div>
            ),
          },
          {
            title: "Mag Def",
            responsive: ["sm"],
            render: (_, { defMagdef }) => (
              <div>
                <Text>{getTextEmpty({ txt: defMagdef })}</Text>
              </div>
            ),
          }
        );
      }
      if (defMagdefPercentFlag) {
        smallItemTitle.push("Phy Def(%)", "Mag Def(%)");
        temp.push(
          {
            title: "Phy Def(%)",
            responsive: ["sm"],
            render: (_, { defMagdefPercent }) => (
              <div>
                <Text>
                  {getTextEmpty({ txt: defMagdefPercent, tailText: "%" })}
                </Text>
              </div>
            ),
          },
          {
            title: "Mag Def(%)",
            responsive: ["sm"],
            render: (_, { defMagdefPercent }) => (
              <div>
                <Text>
                  {getTextEmpty({ txt: defMagdefPercent, tailText: "%" })}
                </Text>
              </div>
            ),
          }
        );
      }
      if (hpFlag) {
        smallItemTitle.push("HP");
        temp.push({
          title: "HP",
          responsive: ["sm"],
          render: (_, { hp }) => (
            <div>
              <Text>{getTextEmpty({ txt: hp })}</Text>
            </div>
          ),
        });
      }
      if (hpPercentFlag) {
        smallItemTitle.push("HP(%)");
        temp.push({
          title: "HP(%)",
          responsive: ["sm"],
          render: (_, { hpPercent }) => (
            <div>
              <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
            </div>
          ),
        });
      }
      if (moveSpeedPercentFlag) {
        smallItemTitle.push("Movespeed(%)");
        temp.push({
          title: "Movespeed(%)",
          responsive: ["sm"],
          render: (_, { moveSpeedPercent }) => (
            <div>
              <Text>
                {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
              </Text>
            </div>
          ),
        });
      }
      if (moveSpeedPercentTownFlag) {
        smallItemTitle.push("Movespeed Town(%)");
        temp.push({
          title: "Movespeed Town(%)",
          responsive: ["sm"],
          render: (_, { moveSpeedPercentTown }) => (
            <div>
              <Text>
                {getTextEmpty({ txt: moveSpeedPercentTown, tailText: "%" })}
              </Text>
            </div>
          ),
        });
      }
      return [
        {
          title: "Enhancement",
          dataIndex: "encLevel",
        },
        {
          title: (
            <div>
              {smallItemTitle.map((it) => (
                <p key={`title-${it}`}>{it}</p>
              ))}
            </div>
          ),
          responsive: ["xs"],
          width: 150,
          render: (
            _,
            {
              phyMagAtk,
              phyMagAtkPercent,
              attAtkPercent,
              crt,
              crtPercent,
              cdm,
              fd,
              str,
              agi,
              int,
              vit,
              strPercent,
              agiPercent,
              intPercent,
              vitPercent,
              defMagdef,
              defMagdefPercent,
              hp,
              hpPercent,
              moveSpeedPercent,
              moveSpeedPercentTown,
            }
          ) => (
            <div>
              {phyMagAtkFlag && <p>ATK {getTextEmpty({ txt: phyMagAtk })}</p>}
              {phyMagAtkPercentFlag && (
                <p>
                  ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
                </p>
              )}
              {attAtkPercentFlag && (
                <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
              )}
              {crtFlag && <p>CRT {getTextEmpty({ txt: crt })}</p>}
              {crtPercentFlag && (
                <p>CRT {getTextEmpty({ txt: crtPercent, tailText: "%" })}</p>
              )}
              {cdmFlag && <p>CDM {getTextEmpty({ txt: cdm })}</p>}
              {fdFlag && <p>FD {getTextEmpty({ txt: fd })}</p>}
              {strFlag && <p>STR {getTextEmpty({ txt: str })}</p>}
              {agiFlag && <p>AGI {getTextEmpty({ txt: agi })}</p>}
              {intFlag && <p>INT {getTextEmpty({ txt: int })}</p>}
              {vitFlag && <p>VIT {getTextEmpty({ txt: vit })}</p>}
              {strPercentFlag && (
                <p>STR {getTextEmpty({ txt: strPercent, tailText: "%" })}</p>
              )}
              {agiPercentFlag && (
                <p>AGI {getTextEmpty({ txt: agiPercent, tailText: "%" })}</p>
              )}
              {intPercentFlag && (
                <p>INT {getTextEmpty({ txt: intPercent, tailText: "%" })}</p>
              )}
              {vitPercentFlag && (
                <p>VIT {getTextEmpty({ txt: vitPercent, tailText: "%" })}</p>
              )}
              {defMagdefFlag && (
                <>
                  <p>Phy Def {getTextEmpty({ txt: defMagdef })}</p>
                  <p>Mag Def {getTextEmpty({ txt: defMagdef })}</p>
                </>
              )}
              {defMagdefPercentFlag && (
                <>
                  <p>
                    Phy Def{" "}
                    {getTextEmpty({ txt: defMagdefPercent, tailText: "%" })}
                  </p>
                  <p>
                    Mag Def{" "}
                    {getTextEmpty({ txt: defMagdefPercent, tailText: "%" })}
                  </p>
                </>
              )}
              {hpFlag && <p>HP {getTextEmpty({ txt: hp })}</p>}
              {hpPercentFlag && (
                <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
              )}
              {moveSpeedPercentFlag && (
                <p>
                  Movespeed{" "}
                  {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
                </p>
              )}
              {moveSpeedPercentTownFlag && (
                <p>
                  Movespeed Town{" "}
                  {getTextEmpty({ txt: moveSpeedPercentTown, tailText: "%" })}
                </p>
              )}
            </div>
          ),
        },
        ...temp,
      ];
    };

    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: (
          <div
            style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
          >
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Helm"}
              size={"small"}
              dataSource={conversionHelmStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Upper"}
              size={"small"}
              dataSource={conversionUpperStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Lower"}
              size={"small"}
              dataSource={conversionLowerStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Glove"}
              size={"small"}
              dataSource={conversionGloveStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Shoes"}
              size={"small"}
              dataSource={conversionShoesStats}
              columns={getColumnsStats({
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                strPercentFlag: true,
                agiPercentFlag: true,
                intPercentFlag: true,
                vitPercentFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
                moveSpeedPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
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
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Main"}
              size={"small"}
              dataSource={conversionMainStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                cdmFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Second"}
              size={"small"}
              dataSource={conversionSecondStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
              })}
              pagination={false}
              bordered
            />
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
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Necklace"}
              size={"small"}
              dataSource={conversionNecklaceStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defMagdefFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Earring"}
              size={"small"}
              dataSource={conversionEarringStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Ring"}
              size={"small"}
              dataSource={conversionRingStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
              })}
              pagination={false}
              bordered
            />
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
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Wing"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionWingStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                vitFlag: true,
                moveSpeedPercentFlag: true,
                moveSpeedPercentTownFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Tail"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionTailStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defMagdefPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
            <Table
              style={{ marginRight: 10, marginBottom: 10 }}
              title={() => "Decal"}
              footer={() => "*Legend stats based on KDN patch note"}
              size={"small"}
              dataSource={conversionDecalStats}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                defMagdefFlag: true,
                defMagdefPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        ),
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
              <Text>* +1 to +10 have 100% success rate</Text>
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
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": ENC_AST_POW_ARMOR,
                  "Astral Stone": ENC_AST_STONE_ARMOR,
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
              <Text>
                * You can buy Conversion Weapon box via Trading House, or Cherry
                store
              </Text>
              {tempComp("Conversion Weapon", WEAP_ENH_SUC_RATE)}
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
              <Text>* +1 to +10 have 100% success rate</Text>
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
            <div style={{ marginRight: 10, marginBottom: 10 }}>
              <Table
                title={() => "Enhancement Legend"}
                size={"small"}
                dataSource={Object.entries({
                  "Astral Powder": ENC_AST_POW_ACC,
                  "Astral Stone": ENC_AST_STONE_ACC,
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
              <Text>* +1 to +10 have 100% success rate</Text>
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
