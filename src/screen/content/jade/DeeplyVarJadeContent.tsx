import { Card, Collapse, CollapseProps, Grid, Typography } from "antd";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import JadeCalculatorPanel from "../../../components/JadeCalculatorPanel";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import { EmptyCommonnStat } from "../../../constants/Common.constants";
import {
  useRangeAccumulator,
  useRangeStatDiff,
} from "../../../hooks/useJadeCalculator";
import {
  DeeplyVariantLJadeEnhanceMaterialTable,
  DeeplyVariantLJadeStatsTable,
  DeeplyVariantUJadeEnhanceMaterialTable,
  DeeplyVariantUJadeStatsTable,
} from "../../../data/jade/DeeplyVarJadeData";
import { DeeplyVariantJadeEnhanceMaterial } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import {
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
  getSuccessRateTag,
  getTextEmpty,
} from "../../../utils/common.util";
const { Text } = Typography;
const { useBreakpoint } = Grid;

const marks: SliderMarks = {
  0: "+0",
  5: "+5",
  10: "+10",
};

interface DeeplyVariantTableMaterialList {
  "Collapse Dimension Energy": number;
  "Deeply Rooted Fragment of Longing": number;
  "Twisted Root": number;
  Gold: number;
  "Contaminated Will": number;
  "Corrupted Origin": number;
}

const emptyDeepVariantMats: DeeplyVariantTableMaterialList = {
  "Collapse Dimension Energy": 0,
  "Deeply Rooted Fragment of Longing": 0,
  "Twisted Root": 0,
  Gold: 0,
  "Contaminated Will": 0,
  "Corrupted Origin": 0,
};

interface ExtraData {
  enhance: string;
  sRate: string;
}

// The base row prepended to the Legend/Ancient stat table: level 0 there is
// "Unique Grade +10, plus the evolver's +5% attribute" — a fixed derived
// value, not something that changes with state, so it's computed once here.
const lJadeStatsTableWithBase: CommonItemStats[] = [
  {
    ...DeeplyVariantUJadeStatsTable[10],
    attAtkPercent: 5,
  } as CommonItemStats,
].concat(DeeplyVariantLJadeStatsTable);

const DeeplyVarJadeContent = () => {
  const screens = useBreakpoint();
  const [deepData, setDeepData] = useState<[number, number]>([0, 10]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvoL, setCheckedEvoL] = useState(false);
  const [checkedEvoA, setCheckedEvoA] = useState(false);
  const [selectStart, setSelectStart] = useState<number>(0);
  const [selectEnd, setSelectEnd] = useState<number>(1);

  const getWidthSetting = () => {
    if (screens.xs) {
      return 200;
    }
    return 350;
  };

  const getColumnsMats = (
    isLJade?: boolean
  ): ColumnsType<DeeplyVariantJadeEnhanceMaterial> => {
    return [
      {
        title: "Enhancement",
        dataIndex: "encLevel",
      },
      {
        title: (
          <div>
            <p>Deeply Rooted Fragment of Longing</p>
            {isLJade && <p>Twisted Root</p>}
            <p>Gold</p>
            {isLJade && <p>Success Rate</p>}
          </div>
        ),
        responsive: ["xs"],
        render: (
          _,
          { deepRootedLonging, twistedRoot, gold, successRatePercent }
        ) => (
          <div>
            <p>{deepRootedLonging}(Fragment)</p>
            {isLJade && <p>{twistedRoot}(Root)</p>}
            <p>{getTextEmpty({ txt: gold })}(g)</p>
            {isLJade && (
              <p>
                {getTextEmpty({ txt: successRatePercent, tailText: "%" })}
                (Success%)
              </p>
            )}
          </div>
        ),
      },
      {
        title: "Deeply Rooted Fragment of Longing",
        dataIndex: "deepRootedLonging",
        responsive: ["sm"],
      },
      ...(isLJade
        ? ([
            {
              title: "Twisted Root",
              dataIndex: "twistedRoot",
              responsive: ["sm"],
            },
          ] as ColumnsType<DeeplyVariantJadeEnhanceMaterial>)
        : []),
      {
        title: "Gold",
        dataIndex: "gold",
        width: 100,
        responsive: ["sm"],
        render: (_, { gold }) => (
          <div>
            <Text>{getTextEmpty({ txt: gold })}</Text>
          </div>
        ),
      },
      ...(isLJade
        ? ([
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
          ] as ColumnsType<DeeplyVariantJadeEnhanceMaterial>)
        : []),
    ];
  };

  const reduceDeepUSlice = useCallback(
    (
      acc: DeeplyVariantTableMaterialList,
      slice: DeeplyVariantJadeEnhanceMaterial[]
    ): DeeplyVariantTableMaterialList => {
      const next = { ...acc };
      slice.forEach((slicedItem) => {
        next["Deeply Rooted Fragment of Longing"] +=
          slicedItem.deepRootedLonging;
        next.Gold += slicedItem.gold;
      });
      return next;
    },
    []
  );

  const finalizeDeepUMats = useCallback(
    (
      acc: DeeplyVariantTableMaterialList,
      ctx: { checkedCraft: boolean; checkedEvoL: boolean; checkedEvoA: boolean }
    ): DeeplyVariantTableMaterialList => {
      const next = { ...acc };
      if (ctx.checkedCraft) {
        next["Deeply Rooted Fragment of Longing"] += 200;
        next["Collapse Dimension Energy"] += 2;
        next.Gold += 200000;
      }
      if (ctx.checkedEvoL) {
        next["Contaminated Will"] += 1;
      }
      if (ctx.checkedEvoA) {
        next["Corrupted Origin"] += 1;
      }
      return next;
    },
    []
  );

  const encUDataSource = useRangeAccumulator(
    deepData,
    false,
    DeeplyVariantUJadeEnhanceMaterialTable,
    emptyDeepVariantMats,
    reduceDeepUSlice,
    { checkedCraft, checkedEvoL, checkedEvoA },
    finalizeDeepUMats
  );

  const uStatDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };

    const { dt1, dt2 } = getComparedData(
      DeeplyVariantUJadeStatsTable,
      deepData[0] + 1,
      deepData[1] + 1
    );
    if (dt2) {
      if (checkedCraft) {
        temp = dt2;
      } else {
        const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
        temp = combineEqStats(temp, dt, "add");
      }
    }
    if (checkedEvoL || checkedEvoA) {
      temp = { ...temp, attAtkPercent: 5 };
    }
    return temp;
  }, [checkedCraft, checkedEvoL, checkedEvoA, deepData]);

  const getCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: deepData,
        onChange: (value) => setDeepData(value as [number, number]),
        max: 10,
        marks,
      }}
      toggles={[
        {
          key: "craft",
          label: "Include craft mats",
          tooltip: "200 deep fragment longing, 2 collapse Dim.Energy",
          checked: checkedCraft,
          onChange: setCheckedCraft,
        },
        {
          key: "evoL",
          label: "Include Legend evolver",
          tooltip: "1 Contaminated Will",
          checked: checkedEvoL,
          onChange: setCheckedEvoL,
        },
        {
          key: "evoA",
          label: "Include Ancient evolver",
          tooltip: "1 Corrupted Origin",
          checked: checkedEvoA,
          onChange: setCheckedEvoA,
        },
      ]}
      mats={{ data: encUDataSource, hideZero: true }}
      extra={
        <>
          <ListingCard title="Status Increase" data={getStatDif(uStatDif)} />
          {checkedEvoL && (
            <Card
              size={"small"}
              style={{ maxWidth: getWidthSetting(), marginTop: 4 }}
            >
              <Text>
                *1 Skill ATK up Add on Stats [cm3/ ult/ 50 spec/ secondary/
                main] +50%
              </Text>
            </Card>
          )}
          {checkedEvoA && (
            <Card
              size={"small"}
              style={{ maxWidth: getWidthSetting(), marginTop: 4 }}
            >
              <Text>
                *3 Critical hit additional damage Add on Stats [cm3/ ult/ 50
                spec/ secondary/ main] from [all class] with [1/3/5/7/10]%
              </Text>
            </Card>
          )}
        </>
      }
    />
  );

  const getLStats = () => {
    const col = getColumnsStats({
      phyMagAtkFlag: true,
      cdmFlag: true,
      fdFlag: true,
      hpFlag: true,
      attAtkPercentFlag: true,
    });
    const its: CollapseProps["items"] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * 10;
      const end = (i + 1) * 10;
      its.push({
        key: `${start + 1}`,
        label: `${start + 1}-${end}`,
        children: (
          <Table
            size={"small"}
            dataSource={DeeplyVariantLJadeStatsTable.slice(start, end)}
            columns={col}
            pagination={false}
            bordered
          />
        ),
      });
    }
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Collapse items={its} size="small" />
      </div>
    );
  };

  const getLMats = () => {
    const col = getColumnsMats(true);
    const its: CollapseProps["items"] = [];
    for (let i = 0; i < 5; i++) {
      const start = i * 10;
      const end = (i + 1) * 10;
      its.push({
        key: `${start + 1}`,
        label: `${start + 1}-${end}`,
        children: (
          <Table
            size={"small"}
            dataSource={DeeplyVariantLJadeEnhanceMaterialTable.slice(
              start,
              end
            )}
            columns={col}
            pagination={false}
            bordered
          />
        ),
      });
    }
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Collapse items={its} size="small" />
      </div>
    );
  };

  const isError = selectStart >= selectEnd;

  const reduceDeepLSlice = useCallback(
    (
      acc: { res1: DeeplyVariantTableMaterialList; res2: ExtraData[] },
      slice: DeeplyVariantJadeEnhanceMaterial[]
    ): { res1: DeeplyVariantTableMaterialList; res2: ExtraData[] } => {
      const res1 = { ...acc.res1 };
      const res2 = [...acc.res2];
      slice.forEach((slicedItem) => {
        res1["Deeply Rooted Fragment of Longing"] +=
          slicedItem.deepRootedLonging;
        res1["Twisted Root"] += slicedItem.twistedRoot ?? 0;
        res1.Gold += slicedItem.gold;
        if (slicedItem.successRatePercent !== 100) {
          res2.push({
            enhance: `${slicedItem.encLevel}`,
            sRate: `${slicedItem.successRatePercent}%`,
          });
        }
      });
      return { res1, res2 };
    },
    []
  );

  const emptyDeepLMats = useMemo(
    () => ({ res1: emptyDeepVariantMats, res2: [] as ExtraData[] }),
    []
  );

  const encLDataSource = useRangeAccumulator(
    [selectStart, selectEnd],
    isError,
    DeeplyVariantLJadeEnhanceMaterialTable,
    emptyDeepLMats,
    reduceDeepLSlice
  );

  const extraInfo: ItemList[] = useMemo(() => {
    const list: ItemList[] = [];
    list.push({
      title: "Summary ",
      isHeader: true,
      removeWidth: true,
      children: getSuccessRateTag("sRate", [
        encLDataSource.res2.length !== 0 ? 0 : 100,
      ]),
    });
    if (encLDataSource.res2.length !== 0) {
      encLDataSource.res2.forEach((it) => {
        list.push({
          title: `enhancing to +${it.enhance} have`,
          value: `${it.sRate} success rate`,
        });
      });
    }
    return list;
  }, [encLDataSource.res2]);

  const lStatDif = useRangeStatDiff(
    [selectStart, selectEnd],
    isError,
    lJadeStatsTableWithBase
  );

  const getLCalc = () => (
    <JadeCalculatorPanel
      rangeSelect={{
        from: selectStart,
        to: selectEnd,
        onFromChange: setSelectStart,
        onToChange: setSelectEnd,
        max: 50,
      }}
      invalid={isError}
      mats={{ data: encLDataSource.res1, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      stats={{ statDif: lStatDif }}
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats - Unique Grade",
      children: (
        <Table
          style={{ marginRight: 10, marginBottom: 10 }}
          size={"small"}
          dataSource={DeeplyVariantUJadeStatsTable}
          columns={getColumnsStats({
            phyMagAtkFlag: true,
            cdmFlag: true,
            fdFlag: true,
            hpFlag: true,
            attAtkPercentFlag: true,
          })}
          pagination={false}
          bordered
        />
      ),
    },
    {
      key: "2",
      label: "Mats - Unique Grade",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={DeeplyVariantUJadeEnhanceMaterialTable}
              columns={getColumnsMats()}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Calculate - Unique Grade",
      children: getCalc(),
    },
    {
      key: "4",
      label: "Stats - Legend / Ancient Grade",
      children: getLStats(),
    },
    {
      key: "5",
      label: "Mats - Legend / Ancient Grade",
      children: getLMats(),
    },
    {
      key: "6",
      label: "Calculate - Legend / Ancient Grade",
      children: getLCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3", "6"]} />
    </div>
  );
};

export default DeeplyVarJadeContent;
