import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Alert, Divider, Radio, Select, Tag, Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import EquipmentTable, { getListOpt } from "../../components/EquipmentTable";
import ListingCard, { ItemList } from "../../components/ListingCard";
import TradingHouseCalc from "../../components/TradingHouseCalc";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  BoneDragonEqEnhanceMaterialArmorTable,
  BoneDragonEqEnhanceMaterialWeapTable,
  BoneDragonStatsGlovesTable,
  BoneDragonStatsHelmTable,
  BoneDragonStatsLowerTable,
  BoneDragonStatsMainTable,
  BoneDragonStatsSecondTable,
  BoneDragonStatsShoesTable,
  BoneDragonStatsUpperTable,
  dataBoneCalculator,
} from "../../data/BoneDragonEqData";
import { BoneCalculator } from "../../interface/Common.interface";
import { BoneDragonEqEnhanceMaterial } from "../../interface/Item.interface";
import {
  BoneDragonStats,
  columnBoneDragonFlag,
} from "../../interface/ItemStat.interface";
import {
  columnsResource,
  getComparedData,
  getTextEmpty,
} from "../../utils/common.util";

const { Text } = Typography;

type SelectedStats = Exclude<
  EQUIPMENT,
  EQUIPMENT.NECKLACE | EQUIPMENT.EARRING | EQUIPMENT.RING
>;
type EquipmentExtraData = {
  [key in SelectedStats]?: {
    "Success Rate": Array<number | undefined>;
    "Break Rate": Array<number | undefined>;
    "Fail Deduction": Array<number | undefined>;
  };
};
interface ExtraData extends EquipmentExtraData {
  Jelly: number;
}
interface TableMaterialList {
  "Bone Fragment": number;
  Garnet: number;
  Essence: number;
  Gold: number;
}

const BoneDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<BoneCalculator[]>(dataBoneCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

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

  const warnDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to > 3) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const dangerDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to > 5) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const tableResource: { res1: TableMaterialList; res2: ExtraData } =
    useMemo(() => {
      let temp: TableMaterialList = {
        "Bone Fragment": 0,
        Garnet: 0,
        Essence: 0,
        Gold: 0,
      };
      let temp2: ExtraData = {
        Jelly: 0,
      };
      if (invalidDtSrc) {
        return { res1: temp, res2: temp2 };
      }

      selectedRowKeys.forEach((item) => {
        const found = dataSource.find((dt) => dt.key === item);

        if (found) {
          const { equipment, from, to } = found;
          let tempSlice: BoneDragonEqEnhanceMaterial[] = [];

          switch (equipment) {
            case EQUIPMENT.HELM:
            case EQUIPMENT.UPPER:
            case EQUIPMENT.LOWER:
            case EQUIPMENT.GLOVE:
            case EQUIPMENT.SHOES:
              tempSlice = BoneDragonEqEnhanceMaterialArmorTable.slice(from, to);
              break;

            case EQUIPMENT.MAIN_WEAPON:
            case EQUIPMENT.SECOND_WEAPON:
              tempSlice = BoneDragonEqEnhanceMaterialWeapTable.slice(from, to);
              break;

            default:
              break;
          }

          let boneFragmentTemp = 0;
          let garnetTemp = 0;
          let essenceTemp = 0;
          let goldTemp = 0;
          let jellyTemp = 0;
          let srTemp: number[] = [];
          let brTemp: number[] = [];
          let deTemp: Array<number | undefined> = [];

          tempSlice.forEach((slicedItem) => {
            boneFragmentTemp += slicedItem.boneFragment;
            garnetTemp += slicedItem.garnet;
            essenceTemp += slicedItem.essence;
            goldTemp += slicedItem.gold;
            jellyTemp += slicedItem.jelly ?? 0;
            srTemp.push(slicedItem.successRatePercent);
            brTemp.push(slicedItem.breakNoJellyPercent);
            deTemp.push(slicedItem.enhanceFailDeduction);
          });

          temp["Bone Fragment"] += boneFragmentTemp;
          temp.Garnet += garnetTemp;
          temp.Essence += essenceTemp;
          temp.Gold += goldTemp;
          temp2.Jelly += jellyTemp;

          const exData = {
            "Success Rate": srTemp,
            "Break Rate": brTemp,
            "Fail Deduction": deTemp,
          };
          switch (equipment) {
            case EQUIPMENT.HELM:
            case EQUIPMENT.UPPER:
            case EQUIPMENT.LOWER:
            case EQUIPMENT.GLOVE:
            case EQUIPMENT.SHOES:
            case EQUIPMENT.MAIN_WEAPON:
            case EQUIPMENT.SECOND_WEAPON:
              temp2[equipment] = exData;
              break;

            default:
              break;
          }
        }
      });

      return { res1: temp, res2: temp2 };
    }, [selectedRowKeys, dataSource, invalidDtSrc]);

  function combineBoneEqStats(
    a: BoneDragonStats,
    b: BoneDragonStats,
    operation: "add" | "minus"
  ): BoneDragonStats {
    const result: BoneDragonStats = { ...a };

    const keys = Object.keys({ ...a, ...b }) as (keyof BoneDragonStats)[];

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

  const statDif: BoneDragonStats = useMemo(() => {
    let temp: BoneDragonStats = {
      encLevel: "0",
      phyMagAtkMax: 0,
      phyMagAtkMin: 0,
      phyMagAtkPercent: 0,
      attAtkPercent: 0,

      crt: 0,
      cdm: 0,
      fd: 0,

      def: 0,
      magdef: 0,
      hp: 0,
      hpPercent: 0,
      moveSpeedPercent: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;

        let tableHolder: BoneDragonStats[];
        switch (equipment) {
          case EQUIPMENT.HELM:
            tableHolder = BoneDragonStatsHelmTable;
            break;
          case EQUIPMENT.UPPER:
            tableHolder = BoneDragonStatsUpperTable;
            break;
          case EQUIPMENT.LOWER:
            tableHolder = BoneDragonStatsLowerTable;
            break;
          case EQUIPMENT.GLOVE:
            tableHolder = BoneDragonStatsGlovesTable;
            break;
          case EQUIPMENT.SHOES:
            tableHolder = BoneDragonStatsShoesTable;
            break;

          case EQUIPMENT.MAIN_WEAPON:
            tableHolder = BoneDragonStatsMainTable;
            break;
          case EQUIPMENT.SECOND_WEAPON:
            tableHolder = BoneDragonStatsSecondTable;
            break;

          default:
            tableHolder = [];
            break;
        }
        const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
        if (dt2) {
          const dt = dt1 ? combineBoneEqStats(dt2, dt1, "minus") : dt2;
          temp = combineBoneEqStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    const items: CollapseProps["items"] = [];

    const getSuccessRateTag = (key: string, dt: number[]) => {
      const another100 = dt.some((it) => it < 100);
      return another100 ? (
        <Tag
          key={`tag-fail-${key}`}
          icon={<ExclamationCircleOutlined />}
          color="warning"
        >
          might fail
        </Tag>
      ) : (
        <Tag
          key={`tag-success-${key}`}
          icon={<CheckCircleOutlined />}
          color="success"
        >
          100% success
        </Tag>
      );
    };
    const getBreakTag = (key: string, dt: number[]) => {
      const canBreak = dt.some((it) => it > 0);
      return canBreak ? (
        <Tag
          key={`tag-break-${key}`}
          icon={<MinusCircleOutlined />}
          color="error"
        >
          might break
        </Tag>
      ) : undefined;
    };
    const getDeductTag = (key: string, dt: number[]) => {
      const canReduce = dt.some((it) => it > 0);
      return canReduce ? (
        <Tag
          key={`tag-minus-${key}`}
          icon={<ExclamationCircleOutlined />}
          color="error"
        >
          might -1
        </Tag>
      ) : undefined;
    };

    Object.entries(tableResource.res2).forEach(([key, value]) => {
      if (key === "Jelly") {
        list.push({
          title: "Min. Jelly used",
          value: tableResource.res2.Jelly,
          format: true,
        });
      } else {
        items.push({
          key: key,
          styles: {
            header: {
              padding: "4px 4px 0px 4px",
            },
            body: {
              padding: "0px 4px",
              marginTop: 8,
              marginBottom: 8,
            },
          },
          label: (
            <div>
              {`${key} `}
              {getSuccessRateTag(key, value?.["Success Rate"])}
              {getBreakTag(key, value?.["Break Rate"])}
              {getDeductTag(key, value?.["Fail Deduction"])}
            </div>
          ),
          children: (
            <ListingCard
              data={[
                {
                  title: `${key} Success Rate : `,
                  value: value?.["Success Rate"]
                    ?.map((it: any) => `${it}%`)
                    .join(", "),
                },
                {
                  title: `${key} Break Rate : `,
                  value: value?.["Break Rate"]
                    ?.map((it: any) => `${it}%`)
                    .join(", "),
                },
                {
                  title: `${key} Fail Deduction : `,
                  value: value?.["Fail Deduction"]
                    ?.map((it: any) => `${it}`)
                    .join(", "),
                },
              ]}
            />
          ),
        });
      }
    });
    if (items.length > 0) {
      list.push({
        title: "Summary",
        isHeader: true,
        children: (
          <Collapse ghost key={"summary-item"} items={items} size="small" />
        ),
      });
    }
    return list;
  }, [tableResource.res2]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
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
              options={getListOpt(0, 20)}
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
              options={getListOpt(0, 20)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
          {warnDtSrc && (
            <div>
              <Alert
                banner
                message="Above +3, the enhancement might fail."
                type="info"
              />
            </div>
          )}
          {dangerDtSrc && (
            <div>
              <Alert
                banner
                message="Above +5 even can break your item."
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(tableResource.res1)
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
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard keyId="extra-info" title="Extra Info" data={extraInfo} />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard
            title="Status Increase"
            data={[
              {
                title: "ATK Max",
                value: statDif.phyMagAtkMax,
                format: true,
              },
              {
                title: "ATK Min",
                value: statDif.phyMagAtkMin,
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
                title: "Phy Def",
                value: statDif.def,
                format: true,
              },
              {
                title: "Mag Def",
                value: statDif.magdef,
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
            ]}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <TradingHouseCalc
            data={[
              {
                name: "Bone Fragment",
                amt: tableResource.res1["Bone Fragment"],
              },
              {
                name: "Garnet",
                amt: tableResource.res1.Garnet,
              },
              {
                name: "Essence",
                amt: tableResource.res1.Essence,
              },
            ]}
            additionalTotal={tableResource.res1.Gold}
          />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const getColumnsStats = ({
      phyMagAtkMinFlag,
      phyMagAtkMaxFlag,
      phyMagAtkPercentFlag,
      attAtkPercentFlag,
      crtFlag,
      cdmFlag,
      fdFlag,
      defFlag,
      magdefFlag,
      hpFlag,
      hpPercentFlag,
      moveSpeedPercentFlag,
    }: columnBoneDragonFlag): ColumnsType<BoneDragonStats> => {
      const temp: ColumnsType<BoneDragonStats> = [];
      const smallItemTitle: string[] = [];
      if (phyMagAtkMinFlag && phyMagAtkMaxFlag) {
        smallItemTitle.push("ATK");
        temp.push({
          title: "Attack",
          responsive: ["sm"],
          render: (_, { phyMagAtkMin, phyMagAtkMax }) => (
            <div>
              <Text>
                {getTextEmpty({
                  txt:
                    phyMagAtkMin && phyMagAtkMax
                      ? `${phyMagAtkMin.toLocaleString()} - ${phyMagAtkMax.toLocaleString()}`
                      : undefined,
                })}
              </Text>
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
      if (defFlag) {
        smallItemTitle.push("Phy Def");
        temp.push({
          title: "Phy Def",
          responsive: ["sm"],
          render: (_, { def }) => (
            <div>
              <Text>{getTextEmpty({ txt: def })}</Text>
            </div>
          ),
        });
      }
      if (magdefFlag) {
        smallItemTitle.push("Mag Def");
        temp.push({
          title: "Mag Def",
          responsive: ["sm"],
          render: (_, { magdef }) => (
            <div>
              <Text>{getTextEmpty({ txt: magdef })}</Text>
            </div>
          ),
        });
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
              phyMagAtkMin,
              phyMagAtkMax,
              phyMagAtkPercent,
              attAtkPercent,
              crt,
              cdm,
              fd,
              def,
              magdef,
              hp,
              hpPercent,
              moveSpeedPercent,
            }
          ) => (
            <div>
              {phyMagAtkMinFlag && phyMagAtkMaxFlag && (
                <p>
                  ATK{" "}
                  {getTextEmpty({
                    txt:
                      phyMagAtkMin && phyMagAtkMax
                        ? `${phyMagAtkMin} - ${phyMagAtkMax}`
                        : undefined,
                  })}
                </p>
              )}
              {phyMagAtkPercentFlag && (
                <p>
                  ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
                </p>
              )}
              {attAtkPercentFlag && (
                <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
              )}
              {crtFlag && <p>CRT {getTextEmpty({ txt: crt })}</p>}
              {cdmFlag && <p>CDM {getTextEmpty({ txt: cdm })}</p>}
              {fdFlag && <p>FD {getTextEmpty({ txt: fd })}</p>}
              {defFlag && <p>Phy Def {getTextEmpty({ txt: def })}</p>}
              {magdefFlag && <p>Mag Def {getTextEmpty({ txt: magdef })}</p>}
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
            </div>
          ),
        },
        ...temp,
      ];
    };

    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Helm",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsHelmTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              attAtkPercentFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "2",
        label: "Upper",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsUpperTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              fdFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "3",
        label: "Lower",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsLowerTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              cdmFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "4",
        label: "Glove",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsGlovesTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "5",
        label: "Shoes",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsShoesTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              defFlag: true,
              magdefFlag: true,
              hpFlag: true,
              hpPercentFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "6",
        label: "Main",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsMainTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "7",
        label: "Second",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonStatsSecondTable}
            columns={getColumnsStats({
              phyMagAtkMinFlag: true,
              phyMagAtkMaxFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
            })}
            pagination={false}
            bordered
          />
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
    const columnsMats: ColumnsType<BoneDragonEqEnhanceMaterial> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Bone Fragment</p>
            <p>Garnet</p>
            <p>Essence</p>
            <p>Gold</p>
            <p>Jelly</p>
            <p>Success Rate</p>
            <p>Break Rate</p>
            <p>Fail Deduction</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          {
            boneFragment,
            garnet,
            essence,
            gold,
            jelly,
            successRatePercent,
            breakNoJellyPercent,
            enhanceFailDeduction,
          }
        ) => (
          <div>
            <p>{getTextEmpty({ txt: boneFragment })}(Bone Fragment)</p>
            <p>{getTextEmpty({ txt: garnet })}(Garnet)</p>
            <p>{getTextEmpty({ txt: essence })}(Essence)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
            <p>{getTextEmpty({ txt: jelly })}(Jelly)</p>
            <p>
              {getTextEmpty({ txt: successRatePercent, tailText: "%" })}
              (Success%)
            </p>
            <p>
              {getTextEmpty({ txt: breakNoJellyPercent, tailText: "%" })}
              (Break%)
            </p>
            <p>
              {getTextEmpty({ txt: enhanceFailDeduction })}
              (Deduct)
            </p>
          </div>
        ),
      },
      {
        title: "Bone Fragment",
        responsive: ["sm"],
        render: (_, { boneFragment }) => (
          <Text>
            {getTextEmpty({
              txt: boneFragment,
            })}
          </Text>
        ),
      },
      {
        title: "Garnet",
        responsive: ["sm"],
        render: (_, { garnet }) => (
          <Text>
            {getTextEmpty({
              txt: garnet,
            })}
          </Text>
        ),
      },
      {
        title: "Essence",
        responsive: ["sm"],
        render: (_, { essence }) => (
          <Text>
            {getTextEmpty({
              txt: essence,
            })}
          </Text>
        ),
      },
      {
        title: "Gold",
        responsive: ["sm"],
        render: (_, { gold }) => (
          <Text>
            {getTextEmpty({
              txt: gold,
            })}
          </Text>
        ),
      },
      {
        title: "Jelly",
        responsive: ["sm"],
        render: (_, { jelly }) => (
          <Text>
            {getTextEmpty({
              txt: jelly,
            })}
          </Text>
        ),
      },
      {
        title: "Success Rate",
        responsive: ["sm"],
        render: (_, { successRatePercent }) => (
          <Text>
            {getTextEmpty({
              txt: successRatePercent,
              tailText: "%",
            })}
          </Text>
        ),
      },
      {
        title: "Break Rate",
        responsive: ["sm"],
        render: (_, { breakNoJellyPercent }) => (
          <Text>
            {getTextEmpty({
              txt: breakNoJellyPercent,
              tailText: "%",
            })}
          </Text>
        ),
      },
      {
        title: "Fail Deduction",
        responsive: ["sm"],
        render: (_, { enhanceFailDeduction }) => (
          <Text>
            {getTextEmpty({
              txt: enhanceFailDeduction,
            })}
          </Text>
        ),
      },
    ];
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Note",
        children: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text>
              * Beyond +10, there are downgrade intervals every 2 levels.
            </Text>
            <Text>
              ** E.g. Enhance +10 to +11, failure dont have level downgrade.
            </Text>
            <Text>
              ** E.g. Enhance +11 to +12, failure have level downgrade with
              certain probability (become +10).
            </Text>
          </div>
        ),
      },
      {
        key: "2",
        label: "Armor",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonEqEnhanceMaterialArmorTable}
            columns={columnsMats}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "3",
        label: "Weapon",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={BoneDragonEqEnhanceMaterialWeapTable}
            columns={columnsMats}
            pagination={false}
            bordered
          />
        ),
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemMats} size="small" defaultActiveKey={"1"} />
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

export default BoneDragonEqContent;
