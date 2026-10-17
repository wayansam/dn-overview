import { Typography } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import { ItemList } from "../../../components/ListingCard";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
} from "../../../hooks/useEquipmentCalculator";
import {
  dataRubinartCalculator,
  RubinartEqEnhanceMaterialTable,
} from "../../../data/equipment/RubinartAccData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { RubinartEqEnhanceMaterial } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { getSuccessRateTag } from "../../../utils/common.util";
import { buildRateSummary } from "../../../utils/rateSummary";
import { TAB_KEY } from "../../../constants/Common.constants";
import ChartsCard, { ChartItem } from "../../../components/ChartsCard";
import { getResource } from "../../../utils/resource.util";

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
  "Crimson Core": number;
}

const RubinartAccContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataRubinartCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);
  const [selectStat, setSelectStat] = useState<{
    label: string;
    value: string;
  }>();
  const [selectPrev, setSelectPrev] = useState<{
    label: string;
    value: string;
  }>();

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);

  useEffect(() => {
    setDataSource((prev) =>
      prev.map((item) => ({
        ...item,
        from: selectFrom,
        to: selectTo,
      }))
    );
  }, [selectFrom, selectTo]);

  const getRubinartMatsTable = useCallback(
    (equipment: EQUIPMENT): RubinartEqEnhanceMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.RING1:
        case EQUIPMENT.RING2:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.NECKLACE:
          return RubinartEqEnhanceMaterialTable;

        default:
          return [];
      }
    },
    []
  );

  const emptyRubinartResource: {
    res1: TableMaterialList;
    res2: EquipmentExtraData;
  } = {
    res1: { "Crimson Core": 0 },
    res2: {},
  };

  const reduceRubinartRow = useCallback(
    (
      acc: { res1: TableMaterialList; res2: EquipmentExtraData },
      slice: RubinartEqEnhanceMaterial[],
      row: CommonEquipmentCalculator
    ): { res1: TableMaterialList; res2: EquipmentExtraData } => {
      const next = {
        res1: { ...acc.res1 },
        res2: { ...acc.res2 },
      };

      let crimsonCoreTemp = 0;
      const srTemp: number[] = [];
      slice.forEach((slicedItem) => {
        crimsonCoreTemp += slicedItem.crimsonCore;
        srTemp.push(slicedItem.successRatePercent);
      });

      next.res1["Crimson Core"] += crimsonCoreTemp;

      const exData = { "Success Rate": srTemp };
      switch (row.equipment) {
        case EQUIPMENT.RING1:
        case EQUIPMENT.RING2:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.NECKLACE:
          next.res2[row.equipment as SelectedStats] = exData;
          break;

        default:
          break;
      }

      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getRubinartMatsTable,
    emptyRubinartResource,
    reduceRubinartRow
  );

  const getRubinartStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqRubinartAcc, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getRubinartStatsTable
  );

  const extraInfo: ItemList[] = useMemo(
    () =>
      buildRateSummary(tableResource.res2, [
        {
          key: "Success Rate",
          title: "Success Rate",
          suffix: "%",
          tag: getSuccessRateTag,
        },
      ]),
    [tableResource.res2]
  );

  const chartItems = useMemo((): ChartItem[] => {
    const stat = selectStat?.value.replace("Desc", "") as keyof CommonItemStats;
    const holder: ChartItem[] = [];

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = getResource(TAB_KEY.eqRubinartAcc, equipment);
        const clippedTable = tableHolder.slice(from, to + 1);
        let prevStatVal: number = 0;
        clippedTable.forEach((it, idx) => {
          const val =
            it[stat] !== undefined && typeof it?.[stat] === "number"
              ? (it[stat] as number)
              : 0;

          const dif = idx !== 0 ? val - prevStatVal : 0;
          prevStatVal = val;
          holder.push({
            enhance: it.encLevel,
            total: val,
            step: dif,
            type: equipment,
            order: from + idx,
          });
        });
      }
    });
    return holder;
  }, [selectStat, selectedRowKeys, dataSource]);

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      invalid={invalidDtSrc}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 8,
      }}
      mats={{ data: tableResource.res1, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      stats={{ statDif }}
      extra={
        <ChartsCard
          title="Status Charts"
          data={chartItems}
          statVal={selectStat}
          setStatVal={setSelectStat}
          statPrev={selectPrev}
          setStatPrev={setSelectPrev}
        />
      }
    />
  );

  // Pure reference data — memoized so it isn't rebuilt (and reconciled,
  // since antd's Collapse keeps inactive panels mounted) on every click in
  // the stateful "Calculate" panel.
  const statContent = useMemo(() => {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <StatReferenceTables
          entries={[
            {
              key: "1",
              label: "Ring",
              dataSource: getResource(TAB_KEY.eqRubinartAcc, EQUIPMENT.RING1),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
              },
            },
            {
              key: "2",
              label: "Earring",
              dataSource: getResource(
                TAB_KEY.eqRubinartAcc,
                EQUIPMENT.EARRING
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
              },
            },
            {
              key: "3",
              label: "Necklace",
              dataSource: getResource(
                TAB_KEY.eqRubinartAcc,
                EQUIPMENT.NECKLACE
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
              },
            },
          ]}
        />
        <Text>
          * Set Effects (not shared with Iona / White Dragon Accessories):
        </Text>
        <Text>- 2-Piece Set: Attack +500,000, Final Damage +2,500</Text>
        <Text>- 4-Piece Set: Attack +2,500,000, Elemental Attack +25%</Text>
      </div>
    );
  }, []);

  const matsContent = useMemo(
    () => (
      <MatsReferenceTables
        defaultActiveKey={"1"}
        entries={[
          {
            key: "1",
            label: "Acquiring",
            content: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text>
                  * Evolve a +15 to +20 White Dragon (evolved Iona) Accessory
                  with Rubinart's Blood Crystal. +15 becomes Rubinart +0, up to
                  +20 becoming Rubinart +5.
                </Text>
                <Text>
                  * Rubinart's Blood Crystal: 250 Crimson Core at Merchant
                  Pania [Hero's Shop] - [Crimson Core Shop].
                </Text>
                <Text>
                  * Crimson Core: from Crimson Core Box (Cash Shop), or 50
                  White Core each at the Crimson Core Shop (5 times per account
                  per week).
                </Text>
                <Text>** Rubinart Accessories cannot be dismantled.</Text>
              </div>
            ),
          },
          {
            key: "2",
            label: "Enhancement",
            dataSource: RubinartEqEnhanceMaterialTable,
            fields: [
              {
                dataIndex: "crimsonCore",
                label: "Crimson Core",
                shortLabel: "(Crimson Core)",
              },
              {
                dataIndex: "successRatePercent",
                label: "Success Rate",
                shortLabel: "(Success%)",
                tailText: "%",
              },
            ] satisfies CraftMaterialField<RubinartEqEnhanceMaterial>[],
            footer:
              "*Necklace, Earring & Ring have same enhancement requirement. Level does not drop on failure.",
          },
        ]}
      />
    ),
    []
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats - Rubinart",
      children: statContent,
    },
    {
      key: "2",
      label: "Mats - Rubinart",
      children: matsContent,
    },
    {
      key: "3",
      label: "Calculate - Rubinart",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default RubinartAccContent;
