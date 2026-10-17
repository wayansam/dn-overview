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
  dataIonaCalculator,
  IonaEqEnhanceMaterialTable,
} from "../../../data/equipment/IonaAccData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { IonaEqEnhanceMaterial } from "../../../interface/Item.interface";
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
  "White Core": number;
  "Frigid White Dragon Fragment": number;
}

// Levels 0..15 are Iona +0..+15; evolving at +15 moves to White Dragon +15
// (index 16), which then enhances up to White Dragon +20 (index 21).
const WHITE_DRAGON_START = 16;
const getLabel = (item: number) =>
  item < WHITE_DRAGON_START ? `${item}` : `White Dragon +${item - 1}`;

const IonaAccContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<CommonEquipmentCalculator[]>(dataIonaCalculator);
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

  const getIonaMatsTable = useCallback(
    (equipment: EQUIPMENT): IonaEqEnhanceMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.RING1:
        case EQUIPMENT.RING2:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.NECKLACE:
          return IonaEqEnhanceMaterialTable;

        default:
          return [];
      }
    },
    []
  );

  const emptyIonaResource: { res1: TableMaterialList; res2: EquipmentExtraData } = {
    res1: { "White Core": 0, "Frigid White Dragon Fragment": 0 },
    res2: {},
  };

  const reduceIonaRow = useCallback(
    (
      acc: { res1: TableMaterialList; res2: EquipmentExtraData },
      slice: IonaEqEnhanceMaterial[],
      row: CommonEquipmentCalculator
    ): { res1: TableMaterialList; res2: EquipmentExtraData } => {
      const next = {
        res1: { ...acc.res1 },
        res2: { ...acc.res2 },
      };

      let whiteCoreTemp = 0;
      let fragmentTemp = 0;
      const srTemp: number[] = [];
      slice.forEach((slicedItem) => {
        whiteCoreTemp += slicedItem.whiteCore;
        fragmentTemp += slicedItem.frigidWhiteDragonFragment ?? 0;
        srTemp.push(slicedItem.successRatePercent);
      });

      next.res1["White Core"] += whiteCoreTemp;
      next.res1["Frigid White Dragon Fragment"] += fragmentTemp;

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
    getIonaMatsTable,
    emptyIonaResource,
    reduceIonaRow
  );

  const getIonaStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqIonaAcc, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getIonaStatsTable
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
        const tableHolder = getResource(TAB_KEY.eqIonaAcc, equipment);
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
      customLabeling={(item) => getLabel(item)}
      invalid={invalidDtSrc}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 21,
        customLabeling: getLabel,
        width: 180,
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
              dataSource: getResource(TAB_KEY.eqIonaAcc, EQUIPMENT.RING1),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
              },
            },
            {
              key: "2",
              label: "Earring",
              dataSource: getResource(TAB_KEY.eqIonaAcc, EQUIPMENT.EARRING),
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
              dataSource: getResource(TAB_KEY.eqIonaAcc, EQUIPMENT.NECKLACE),
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
          * White Dragon Set Effects (shared with Iona Accessories):
        </Text>
        <Text>- 2-Piece Set: Phy/Mag ATK +300,000, Final Damage +2,500</Text>
        <Text>
          - 4-Piece Set: Phy/Mag ATK +2,500,000, All Attribute ATK +20%
        </Text>
      </div>
    );
  }, []);

  const matsContent = useMemo(() => (
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
                * Go to Merchant Pania or Merchant Farvana in certain towns.
                Purchase with 3900 Iona Core for each item.
              </Text>
              <Text>-or-</Text>
              <Text>
                * Exchange Argenta or Geraint Accessories with Path of Iona
                (purchased with 10 Iona Core).
              </Text>
              <Text>
                ** Please refer to Patch Note - first release of Iona
                Accessories (look the link in (?) button on the bottom right
                corner of the screen).
              </Text>
              <Text>
                * Evolve a +15 Iona Accessory into a +15 White Dragon Accessory
                with 1 Frigid White Dragon Fragment (exchanged with White Core
                at the Hero's Store).
              </Text>
              <Text>
                * Frigid Aura only works on Iona Accessories; Essence of Extreme
                Cold only works on White Dragon Accessories (exchange 2 Frigid
                Aura for 1 Essence at Merchant Pania's Hero's Shop).
              </Text>
            </div>
          ),
        },
        {
          key: "2",
          label: "Enhancement",
          dataSource: IonaEqEnhanceMaterialTable,
          fields: [
            { dataIndex: "whiteCore", label: "White Core", shortLabel: "(White Core)" },
            {
              dataIndex: "frigidWhiteDragonFragment",
              label: "Frigid White Dragon Fragment",
              shortLabel: "(Frigid Fragment)",
            },
            {
              dataIndex: "successRatePercent",
              label: "Success Rate",
              shortLabel: "(Success%)",
              tailText: "%",
            },
          ] satisfies CraftMaterialField<IonaEqEnhanceMaterial>[],
          footer:
            "*Necklace, Earring & Ring have same enhancement requirement. White Dragon levels do not drop on failure.",
        },
      ]}
    />
  ), []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats - Iona",
      children: statContent,
    },
    {
      key: "2",
      label: "Mats - Iona",
      children: matsContent,
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

export default IonaAccContent;
