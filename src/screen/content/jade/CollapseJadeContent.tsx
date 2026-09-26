import type { CollapseProps } from "antd";
import {
  Collapse,
  Divider,
  Form,
  Grid,
  Table,
  Typography,
} from "antd";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useEffect, useState } from "react";
import FlagAlert from "../../../components/FlagAlert";
import JadeEnhanceListForm from "../../../components/JadeEnhanceListForm";
import ListingCard from "../../../components/ListingCard";
import TradingHouseCalc from "../../../components/TradingHouseCalc";
import {
  EmptyCommonnStat,
  TableResource,
} from "../../../constants/Common.constants";
import { COLLAPSE_JADE_TYPE } from "../../../constants/InGame.constants";
import { reduceJadeEnhanceList } from "../../../hooks/useJadeCalculator";
import { CollapseJadeCraftEnhanceMaterial } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getTextEmpty,
  multiplyEqStats,
  typedEntries,
} from "../../../utils/common.util";
import {
  CollapseJadeAttackStatsTable,
  CollapseJadeCraftMats,
  CollapseJadeDefendStatsTable,
  CollapseJadeEnhanceMatsTable,
} from "../../../data/jade/CollapseJadeData";

const { useBreakpoint } = Grid;
const { Text } = Typography;

interface CollapseEnhanceItem {
  range?: [number, number] | null;
  amt?: number | null;
  craft?: boolean | null;
}

interface FormEnhance {
  type: string | null;
  listEnhance: CollapseEnhanceItem[] | null;
}

interface EnhanceTableMaterialList {
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

const CollapseJadeContent = () => {
  const screens = useBreakpoint();

  const [formEnhance] = Form.useForm<{ items: Array<FormEnhance> }>();

  const [enhanceDataSource, setEnhanceDataSource] = useState<MatsTableRes>({});

  const getMatsCol = (): ColumnsType<CollapseJadeCraftEnhanceMaterial> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Collapse Fragment</p>
            <p>Foundation Stone</p>
            <p>Dim. Vestige</p>
            <p>Gold</p>
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          { collapseFragment, foundationStone, dimVestige, gold }
        ) => (
          <div>
            <p>{getTextEmpty({ txt: collapseFragment })}(frag)</p>
            <p>{getTextEmpty({ txt: foundationStone })}(stone)</p>
            <p>{getTextEmpty({ txt: dimVestige })}(d.ves)</p>
            <p>{getTextEmpty({ txt: gold })}(g)</p>
          </div>
        ),
      },
      {
        title: "Collapse Fragment",
        responsive: ["sm"],
        render: (_, { collapseFragment }) => (
          <Text>
            {getTextEmpty({
              txt: collapseFragment,
            })}
          </Text>
        ),
      },
      {
        title: "Foundation Stone",
        responsive: ["sm"],
        render: (_, { foundationStone }) => (
          <Text>
            {getTextEmpty({
              txt: foundationStone,
            })}
          </Text>
        ),
      },
      {
        title: "Dim. Vestige",
        responsive: ["sm"],
        render: (_, { dimVestige }) => (
          <Text>
            {getTextEmpty({
              txt: dimVestige,
            })}
          </Text>
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

  const calcEnhanceDataSource = (temp: Array<FormEnhance>) => {
    if (!temp || !Array.isArray(temp) || temp.length < 1) {
      return { errorDt: ["Empty List"] };
    }
    // mats
    let tempCollapseFragment = 0;
    let tempFoundationStone = 0;
    let tempDimVestige = 0;
    let tempGold = 0;

    // stats
    let tempStat: CommonItemStats = { ...EmptyCommonnStat };

    const errorMsg = reduceJadeEnhanceList<CollapseEnhanceItem>(
      temp,
      ({ type, item, amt, range }) => {
        // mats
        const { collapseFragment, foundationStone, dimVestige, gold } =
          CollapseJadeCraftMats;
        let tempCollapseFragmentC = item?.craft ? collapseFragment : 0;
        let tempFoundationStoneC = item?.craft ? foundationStone : 0;
        let tempDimVestigeC = item?.craft ? dimVestige : 0;
        let tempGoldC = item?.craft ? gold : 0;

        const isAtt = type === COLLAPSE_JADE_TYPE.ATT;

        const tempSliceMats = CollapseJadeEnhanceMatsTable.slice(
          range[0],
          range[1]
        );

        tempSliceMats.forEach((slicedItem) => {
          tempCollapseFragmentC += slicedItem.collapseFragment;
          tempFoundationStoneC += slicedItem.foundationStone;
          tempDimVestigeC += slicedItem.dimVestige;
          tempGoldC += slicedItem.gold;
        });

        tempCollapseFragment += tempCollapseFragmentC * amt;
        tempFoundationStone += tempFoundationStoneC * amt;
        tempDimVestige += tempDimVestigeC * amt;
        tempGold += tempGoldC * amt;

        // stats
        const tempArrStats = isAtt
          ? CollapseJadeAttackStatsTable
          : CollapseJadeDefendStatsTable;

        const { dt1, dt2 } = getComparedData(
          tempArrStats,
          range[0] + 1,
          range[1] + 1
        );
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          const dtn = multiplyEqStats(dt, amt);
          tempStat = combineEqStats(tempStat, dtn, "add");
        }
      },
      { emptyRow: "amount" }
    );

    return {
      matsData: {
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

  const getEnhanceCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <JadeEnhanceListForm<CollapseEnhanceItem>
            form={formEnhance}
            types={[
              { label: "Attack", value: COLLAPSE_JADE_TYPE.ATT },
              { label: "Defense", value: COLLAPSE_JADE_TYPE.DEF },
            ]}
            onValuesChange={(values) =>
              setEnhanceDataSource(calcEnhanceDataSource(values.items))
            }
            errors={enhanceDataSource.errorDt}
            width={getWidthSetting()}
            range={{
              min: 0,
              max: 15,
              marks: { 0: "+0", 5: "+5", 10: "+10", 15: "+15" },
            }}
            itemToggle={{
              name: "craft",
              label: "Craft",
              placement: "beforeRange",
            }}
          />
        </div>

        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
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
                    .filter(([_, value]) => value !== 0)
                    .map(([key, value]) => ({
                      mats: key,
                      amount: value,
                    }))
                : []) as TableResource[]
            }
            columns={columnsResource}
            pagination={false}
            bordered
          />
          <ListingCard
            title="Enhancement Status Increase "
            data={getStatDif(enhanceDataSource.statsData)}
          />
        </div>
        <TradingHouseCalc
          data={[
            {
              name: "Dim. Vestige",
              amt: enhanceDataSource.matsData?.["Dimensional Vestige"],
            },
          ]}
          additionalTotal={enhanceDataSource.matsData?.Gold}
        />
      </div>
    );
  };

  const craftMat: EnhanceTableMaterialList = {
    "Collapse Dragon Jade Fragment": CollapseJadeCraftMats.collapseFragment,
    "Ancient's Foundation Stone": CollapseJadeCraftMats.foundationStone,
    "Dimensional Vestige": CollapseJadeCraftMats.dimVestige,
    Gold: CollapseJadeCraftMats.gold,
  };

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Enhance Attack Jade Stats"}</Title>
            <Table
              size={"small"}
              rowKey="encLevel"
              dataSource={CollapseJadeAttackStatsTable}
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
          <div style={{}}>
            <Title level={5}>{"Enhance Defense Jade Stats"}</Title>
            <Table
              size={"small"}
              rowKey="encLevel"
              dataSource={CollapseJadeDefendStatsTable}
              columns={getColumnsStats({
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              })}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Mats",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Craft Mats"}</Title>
            <Table
              size={"small"}
              rowKey="mats"
              dataSource={
                typedEntries(craftMat)
                  .filter(([key]) => key !== "encLevel")
                  .map(([key, value]) => ({
                    mats: key,
                    amount: value,
                  })) as TableResource[]
              }
              columns={columnsResource}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 30, marginBottom: 10 }}>
            <Title level={5}>{"Enhance Mats"}</Title>
            <Table
              size={"small"}
              rowKey="encLevel"
              dataSource={CollapseJadeEnhanceMatsTable}
              columns={getMatsCol()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Enhance",
      children: getEnhanceCalculator(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default CollapseJadeContent;
