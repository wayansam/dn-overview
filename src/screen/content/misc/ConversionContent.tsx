import { Collapse, CollapseProps, Typography } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChartsCard, { ChartItem } from "../../../components/ChartsCard";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import MaterialListTable from "../../../components/MaterialListTable";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { EmptyCommonnStat, TAB_KEY } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import { useEquipmentAccumulator, useInvalidRange } from "../../../hooks/useEquipmentCalculator";
import { dataConversionCalculator } from "../../../data/misc/ConversionCalculatorData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { combineEqStats, getComparedData } from "../../../utils/common.util";
import { getResource } from "../../../utils/resource.util";

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
const ENC_AST_POW_WEAP = 600;
const ENC_AST_STONE_WEAP = 3;
const ENC_AST_POW_WTD = 550;
const ENC_AST_STONE_WTD = 3;

const ConversionContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataConversionCalculator
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

  const getConversionMatsTable = useCallback(() => [], []);

  const emptyConversionMats: TableMaterialList = {
    "Armor Fragment": 0,
    "Acc Fragment": 0,
    "Wtd Fragment": 0,
    "Weapon Fragment": 0,
    "Astral Powder": 0,
    "Astral Stone": 0,
  };

  const reduceConversionRow = useCallback(
    (
      acc: TableMaterialList,
      _slice: never[],
      row: CommonEquipmentCalculator
    ): TableMaterialList => {
      const next = { ...acc };
      const { equipment, from, to } = row;
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
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          next["Armor Fragment"] += frag;
          if (isEvo) {
            lgFrag += EV_AST_POW_ARMOR;
            lgStone += EV_AST_STONE;
          }
          if (!isEnhUnique) {
            lgFrag += enhLRange * ENC_AST_POW_ARMOR;
            lgStone += enhLRange * ENC_AST_STONE_ARMOR;
          }
          break;

        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          if (isEvo) {
            lgFrag += EV_AST_POW_WEAP;
            lgStone += EV_AST_STONE;
          }
          if (!isEnhUnique) {
            lgFrag += enhLRange * ENC_AST_POW_WEAP;
            lgStone += enhLRange * ENC_AST_STONE_WEAP;
          }
          break;

        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
        case EQUIPMENT.RING2:
          next["Acc Fragment"] += frag;
          if (isEvo) {
            lgFrag += EV_AST_POW_ACC;
            lgStone += EV_AST_STONE;
          }
          if (!isEnhUnique) {
            lgFrag += enhLRange * ENC_AST_POW_ACC;
            lgStone += enhLRange * ENC_AST_STONE_ACC;
          }
          break;

        case EQUIPMENT.WING:
        case EQUIPMENT.TAIL:
        case EQUIPMENT.DECAL:
          next["Wtd Fragment"] += frag;
          if (isEvo) {
            lgFrag += EV_AST_POW_WTD;
            lgStone += EV_AST_STONE;
          }
          if (!isEnhUnique) {
            lgFrag += enhLRange * ENC_AST_POW_WTD;
            lgStone += enhLRange * ENC_AST_STONE_WTD;
          }
          break;

        default:
          break;
      }

      next["Astral Powder"] += lgFrag;
      next["Astral Stone"] += lgStone;

      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getConversionMatsTable,
    emptyConversionMats,
    reduceConversionRow
  );

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = getResource(TAB_KEY.miscConversion, equipment);
        const { dt1, dt2 } = getComparedData(tableHolder, from, to);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
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
          case EQUIPMENT.MAIN_WEAPON:
            temp.main = tempComp("Main Weapon", tempSlice);
            break;
          case EQUIPMENT.SECOND_WEAPON:
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

  const chartItems = useMemo((): ChartItem[] => {
    const stat = selectStat?.value.replace("Desc", "") as keyof CommonItemStats;
    const holder: ChartItem[] = [];

    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to } = found;
        const tableHolder = [{ ...EmptyCommonnStat, encLevel: "Buy" }].concat(
          getResource(TAB_KEY.miscConversion, equipment)
        );
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
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
        { label: "Accessories", keys: ["8", "9", "10", "11"] },
        { label: "WTD", keys: ["12", "13", "14"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 15,
        customLabeling: getLabel,
      }}
      mats={{ data: tableResource, hideZero: true }}
      stats={{ statDif }}
      extra={
        <>
          {weaponNotes?.main}
          {weaponNotes?.second}
          <ChartsCard
            title="Status Charts"
            data={chartItems}
            statVal={selectStat}
            setStatVal={setSelectStat}
            statPrev={selectPrev}
            setStatPrev={setSelectPrev}
          />
        </>
      }
    />
  );

  // Pure reference data — doesn't depend on any state, so this must not be
  // rebuilt on every click in the Calculate tab (antd's Collapse keeps
  // inactive panels mounted, so an unmemoized rebuild here still gets
  // reconciled on every state change elsewhere in the screen).
  const statContent = useMemo(
    () => (
    <StatReferenceTables
      entries={[
        {
          key: "1",
          label: "Armor",
          tables: [
            {
              label: "Helm",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.HELM),
              flags: {
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
              },
            },
            {
              label: "Upper",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.UPPER),
              flags: {
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
              },
            },
            {
              label: "Lower",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.LOWER),
              flags: {
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
              },
            },
            {
              label: "Glove",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.GLOVE),
              flags: {
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
              },
            },
            {
              label: "Shoes",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.SHOES),
              flags: {
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
              },
            },
          ],
        },
        {
          key: "2",
          label: "Weapon",
          tables: [
            {
              label: "Main",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.MAIN_WEAPON
              ),
              flags: {
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
              },
            },
            {
              label: "Second",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.SECOND_WEAPON
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                crtFlag: true,
              },
            },
          ],
        },
        {
          key: "3",
          label: "Accesories",
          tables: [
            {
              label: "Necklace",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.NECKLACE
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defFlag: true,
                magdefFlag: true,
              },
            },
            {
              label: "Earring",
              dataSource: getResource(
                TAB_KEY.miscConversion,
                EQUIPMENT.EARRING
              ),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                hpFlag: true,
                hpPercentFlag: true,
              },
            },
            {
              label: "Ring",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.RING1),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
              },
            },
          ],
        },
        {
          key: "4",
          label: "WTD",
          tables: [
            {
              label: "Wing",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.WING),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                crtFlag: true,
                cdmFlag: true,
                fdFlag: true,
                vitFlag: true,
                moveSpeedPercentFlag: true,
                moveSpeedPercentTownFlag: true,
              },
            },
            {
              label: "Tail",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.TAIL),
              flags: {
                phyMagAtkFlag: true,
                phyMagAtkPercentFlag: true,
                attAtkPercentFlag: true,
                fdFlag: true,
                strFlag: true,
                agiFlag: true,
                intFlag: true,
                vitFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              },
            },
            {
              label: "Decal",
              footer: "*Legend stats based on KDN patch note",
              dataSource: getResource(TAB_KEY.miscConversion, EQUIPMENT.DECAL),
              flags: {
                phyMagAtkFlag: true,
                attAtkPercentFlag: true,
                crtFlag: true,
                crtPercentFlag: true,
                cdmFlag: true,
                fdFlag: true,
                defFlag: true,
                magdefFlag: true,
                defPercentFlag: true,
                magdefPercentFlag: true,
              },
            },
          ],
        },
      ]}
    />
    ),
    []
  );

  // Every equipment category's Mats panel is the same 3-table shape: an
  // Enhancement resource table (with its own note/success-rate blurb), an
  // Evo Legend table, and an Enhancement Legend table.
  const getEnhanceMatsGroup = ({
    enhanceFooter,
    enhanceData,
    enhanceNote,
    evoData,
    encLegendData,
  }: {
    enhanceFooter: string;
    enhanceData: Record<string, number>;
    enhanceNote: React.ReactNode;
    evoData: Record<string, number>;
    encLegendData: Record<string, number>;
  }) => (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <div style={{ marginRight: 10, marginBottom: 10 }}>
        <MaterialListTable
          title="Enhancement"
          footer={enhanceFooter}
          data={enhanceData}
        />
        {enhanceNote}
      </div>
      <div style={{ marginRight: 10, marginBottom: 10 }}>
        <MaterialListTable title="Evo Legend" data={evoData} />
      </div>
      <div style={{ marginRight: 10, marginBottom: 10 }}>
        <MaterialListTable title="Enhancement Legend" data={encLegendData} />
      </div>
    </div>
  );

  // Also pure reference data — same reasoning as statContent above.
  const matsContent = useMemo(() => {
    const itemMats: CollapseProps["items"] = [
      {
        key: "1",
        label: "Armor",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Armor Fragment",
          enhanceData: {
            "Buy from Store": CONV_FRAG,
            "Every tap from +0 to +10": CONV_FRAG,
          },
          enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
          evoData: { "Astral Powder": EV_AST_POW_ARMOR, "Astral Stone": EV_AST_STONE },
          encLegendData: {
            "Astral Powder": ENC_AST_POW_ARMOR,
            "Astral Stone": ENC_AST_STONE_ARMOR,
          },
        }),
      },
      {
        key: "2",
        label: "Weapon",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Weapon Fragment",
          enhanceData: { "Every tap from +0 to +10": WEAP_FRAG },
          enhanceNote: (
            <>
              <Text>
                * You can buy Conversion Weapon box via Trading House, or Cherry
                store
              </Text>
              {tempComp("Conversion Weapon", WEAP_ENH_SUC_RATE)}
            </>
          ),
          evoData: { "Astral Powder": EV_AST_POW_WEAP, "Astral Stone": EV_AST_STONE },
          encLegendData: {
            "Astral Powder": ENC_AST_POW_WEAP,
            "Astral Stone": ENC_AST_STONE_WEAP,
          },
        }),
      },
      {
        key: "3",
        label: "Accesories",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Acc Fragment",
          enhanceData: {
            "Buy from Store": CONV_FRAG,
            "Every tap from +0 to +10": CONV_FRAG,
          },
          enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
          evoData: { "Astral Powder": EV_AST_POW_ACC, "Astral Stone": EV_AST_STONE },
          encLegendData: {
            "Astral Powder": ENC_AST_POW_ACC,
            "Astral Stone": ENC_AST_STONE_ACC,
          },
        }),
      },
      {
        key: "4",
        label: "WTD",
        children: getEnhanceMatsGroup({
          enhanceFooter: "Using Wtd Fragment",
          enhanceData: {
            "Buy from Store": CONV_FRAG,
            "Every tap from +0 to +10": CONV_FRAG,
          },
          enhanceNote: <Text>* +1 to +10 have 100% success rate</Text>,
          evoData: { "Astral Powder": EV_AST_POW_WTD, "Astral Stone": EV_AST_STONE },
          encLegendData: {
            "Astral Powder": ENC_AST_POW_WTD,
            "Astral Stone": ENC_AST_STONE_WTD,
          },
        }),
      },
    ];

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemMats} size="small" />
      </div>
    );
  }, []);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: statContent,
    },
    {
      key: "2",
      label: "Mats",
      children: matsContent,
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
