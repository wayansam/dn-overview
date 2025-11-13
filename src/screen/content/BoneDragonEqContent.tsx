import { Alert, Divider, Radio, Select, Typography } from "antd";
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
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getBreakTag,
  getColumnsStats,
  getComparedData,
  getDeductTag,
  getStatDif,
  getSuccessRateTag,
  getTextEmpty,
} from "../../utils/common.util";
import { EmptyCommonnStat } from "../../constants/Common.constants";

const { Text } = Typography;

type SelectedStats = Exclude<
  EQUIPMENT,
  EQUIPMENT.NECKLACE | EQUIPMENT.EARRING | EQUIPMENT.RING1 | EQUIPMENT.RING2
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

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;

        let tableHolder: CommonItemStats[];
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
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });

    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    const items: CollapseProps["items"] = [];

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
            data={getStatDif(statDif)}
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
