import { Alert, Divider, Select, Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import EquipmentTable, { getListOpt } from "../../components/EquipmentTable";
import ListingCard, { ItemList } from "../../components/ListingCard";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  dataIonaCalculator,
  IonaEarringEnhancementStatsTable,
  IonaEqEnhanceMaterialTable,
  IonaNecklaceEnhancementStatsTable,
  IonaRingEnhancementStatsTable,
} from "../../data/VIPAccData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { IonaEqEnhanceMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getSuccessRateTag,
  getTextEmpty,
} from "../../utils/common.util";
import { EmptyCommonnStat } from "../../constants/Common.constants";

const { Text } = Typography;

type SelectedStats = Exclude<
  EQUIPMENT,
  | EQUIPMENT.HELM
  | EQUIPMENT.UPPER
  | EQUIPMENT.LOWER
  | EQUIPMENT.GLOVE
  | EQUIPMENT.SHOES
  | EQUIPMENT.MAIN_WEAPON
  | EQUIPMENT.SECOND_WEAPON
>;
type EquipmentExtraData = {
  [key in SelectedStats]?: {
    "Success Rate": Array<number>;
  };
};
interface TableMaterialList {
  "White Core": number;
}

const VIPAccContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<CommonEquipmentCalculator[]>(dataIonaCalculator);
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

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const tableResource: { res1: TableMaterialList; res2: EquipmentExtraData } =
    useMemo(() => {
      let temp: TableMaterialList = {
        "White Core": 0,
      };
      let temp2: EquipmentExtraData = {};
      if (invalidDtSrc) {
        return { res1: temp, res2: temp2 };
      }

      selectedRowKeys.forEach((item) => {
        const found = dataSource.find((dt) => dt.key === item);

        if (found) {
          const { equipment, from, to } = found;
          let tempSlice: IonaEqEnhanceMaterial[] = [];

          switch (equipment) {
            case EQUIPMENT.RING1:
            case EQUIPMENT.RING2:
            case EQUIPMENT.EARRING:
            case EQUIPMENT.NECKLACE:
              tempSlice = IonaEqEnhanceMaterialTable.slice(from, to);
              break;

            default:
              break;
          }

          let whiteCoreTemp = 0;
          let srTemp: number[] = [];
          tempSlice.forEach((slicedItem) => {
            whiteCoreTemp += slicedItem.whiteCore;
            srTemp.push(slicedItem.successRatePercent);
          });

          temp["White Core"] += whiteCoreTemp;

          const exData = {
            "Success Rate": srTemp,
          };
          switch (equipment) {
            case EQUIPMENT.RING1:
            case EQUIPMENT.RING2:
            case EQUIPMENT.EARRING:
            case EQUIPMENT.NECKLACE:
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
          case EQUIPMENT.RING1:
          case EQUIPMENT.RING2:
            tableHolder = IonaRingEnhancementStatsTable;
            break;
          case EQUIPMENT.EARRING:
            tableHolder = IonaEarringEnhancementStatsTable;
            break;
          case EQUIPMENT.NECKLACE:
            tableHolder = IonaNecklaceEnhancementStatsTable;
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
            ]}
          />
        ),
      });
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
            From
            <Divider type="vertical" />
            <Select
              defaultValue={selectFrom}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectFrom(val);
              }}
              options={getListOpt(0, 15)}
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
              options={getListOpt(0, 15)}
            />
          </div>
          <Divider orientation="left">Material List</Divider>
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
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </div>
      </div>
    );
  };

  const getStatContent = () => {
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Ring",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={IonaRingEnhancementStatsTable}
            columns={getColumnsStats({
              phyMagAtkFlag: true,
              phyMagAtkPercentFlag: true,
              attAtkPercentFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "2",
        label: "Earring",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={IonaEarringEnhancementStatsTable}
            columns={getColumnsStats({
              phyMagAtkFlag: true,
              phyMagAtkPercentFlag: true,
              crtFlag: true,
              cdmFlag: true,
              fdFlag: true,
              strFlag: true,
              agiFlag: true,
              intFlag: true,
            })}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "3",
        label: "Necklace",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={IonaNecklaceEnhancementStatsTable}
            columns={getColumnsStats({
              phyMagAtkFlag: true,
              phyMagAtkPercentFlag: true,
              attAtkPercentFlag: true,
              fdFlag: true,
              strFlag: true,
              agiFlag: true,
              intFlag: true,
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
    const columnsMats: ColumnsType<IonaEqEnhanceMaterial> = [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>White Core</p>
            <p>Success Rate</p>
          </div>
        ),
        responsive: ["xs"],
        render: (_, { whiteCore, successRatePercent }) => (
          <div>
            <p>{getTextEmpty({ txt: whiteCore })}(White Core)</p>
            <p>
              {getTextEmpty({ txt: successRatePercent, tailText: "%" })}
              (Success%)
            </p>
          </div>
        ),
      },
      {
        title: "White Core",
        responsive: ["sm"],
        render: (_, { whiteCore }) => (
          <Text>
            {getTextEmpty({
              txt: whiteCore,
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
    ];
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Acquiring",
        children: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text>
              * Go to Merchant Pania or Merchant Farvana in certain towns.
              Purchase with 3900 Iona Core for each item.
            </Text>
            <Text>-or-</Text>
            <Text>
              * Exchange Argenta or Geraint Accessories with Path of Iona
              (purchased with 10 Iona Core).
            </Text>
            <Text>
              ** Please refer to Patch Note - first release of Iona Accessories
              (look the link in (?) button on the bottom right corner of the
              screen).
            </Text>
          </div>
        ),
      },
      {
        key: "2",
        label: "Enhancement",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={IonaEqEnhanceMaterialTable}
            columns={columnsMats}
            pagination={false}
            bordered
            footer={() =>
              "*Necklace, Earring & Ring have same enhancement requirement"
            }
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
      label: "Stats - Iona",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats - Iona",
      children: getMatsContent(),
    },
    {
      key: "3",
      label: "Calculate - Iona",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default VIPAccContent;
