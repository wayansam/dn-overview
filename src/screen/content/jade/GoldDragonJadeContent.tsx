import { Collapse, CollapseProps, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import { ItemList } from "../../../components/ListingCard";
import { EmptyCommonnStat } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  GoldDragonJadeCraftMaterial,
  GoldDragonJadeEnhanceMaterialTable,
  GoldDragonJadeStatsTable,
  dataGoldDragonJadeCalculator,
} from "../../../data/jade/GoldDragonJadeData";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useSelectedRows,
  useSelectionFlag,
} from "../../../hooks/useEquipmentCalculator";
import { GoldDragonJadeCalculator } from "../../../interface/Common.interface";
import { GoldDragonJadeEnhanceMaterial } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import {
  getBreakTag,
  combineEqStats,
  getColumnsStats,
  getSuccessRateTag,
  getTextEmpty,
} from "../../../utils/common.util";
import { buildRateSummary } from "../../../utils/rateSummary";
const { Text } = Typography;

type JadePart =
  | EQUIPMENT.HELM
  | EQUIPMENT.UPPER
  | EQUIPMENT.LOWER
  | EQUIPMENT.GLOVE
  | EQUIPMENT.SHOES;

// ATK and Max HP come with every part; the remaining stat is part-specific.
const partStat: Record<JadePart, keyof CommonItemStats> = {
  [EQUIPMENT.HELM]: "crt",
  [EQUIPMENT.UPPER]: "fd",
  [EQUIPMENT.LOWER]: "cdm",
  [EQUIPMENT.GLOVE]: "def",
  [EQUIPMENT.SHOES]: "magdef",
};

// The shared stat table narrowed to what each part actually grants, built
// once so useEquipmentStatDiff gets a stable table per part.
const partStatsTables = Object.fromEntries(
  Object.entries(partStat).map(([part, stat]) => [
    part,
    GoldDragonJadeStatsTable.map(
      (row): CommonItemStats => ({
        ...EmptyCommonnStat,
        encLevel: row.encLevel,
        phyMagAtk: row.phyMagAtk,
        hp: row.hp,
        [stat]: row[stat],
      })
    ),
  ])
) as Record<JadePart, CommonItemStats[]>;

type ExtraData = {
  [key in JadePart]?: {
    "Success Rate": number[];
    "Break Rate": number[];
  };
};

interface TableMaterialList {
  "Golden Memory": number;
  "Faded Memory": number;
  Gold: number;
}

const emptyGoldDragonJadeMats: { res1: TableMaterialList; res2: ExtraData } = {
  res1: { "Golden Memory": 0, "Faded Memory": 0, Gold: 0 },
  res2: {},
};

const columnsMats: ColumnsType<GoldDragonJadeEnhanceMaterial> = [
  {
    title: "Enhancement",
    dataIndex: "encLevel",
  },
  {
    title: (
      <div>
        <p>Golden Memory</p>
        <p>Faded Memory</p>
        <p>Gold</p>
        <p>Success / Break Rate</p>
      </div>
    ),
    responsive: ["xs"],
    render: (
      _,
      { goldenMemory, fadedMemory, gold, successRatePercent, breakRatePercent }
    ) => (
      <div>
        <p>{goldenMemory}(Golden)</p>
        <p>{fadedMemory}(Faded)</p>
        <p>{getTextEmpty({ txt: gold })}(g)</p>
        <p>
          {successRatePercent}% / {breakRatePercent}%
        </p>
      </div>
    ),
  },
  {
    title: "Golden Memory",
    dataIndex: "goldenMemory",
    responsive: ["sm"],
  },
  {
    title: "Faded Memory",
    dataIndex: "fadedMemory",
    responsive: ["sm"],
  },
  {
    title: "Gold",
    dataIndex: "gold",
    responsive: ["sm"],
    render: (_, { gold }) => <Text>{getTextEmpty({ txt: gold })}</Text>,
  },
  {
    title: "Success Rate",
    responsive: ["sm"],
    render: (_, { successRatePercent }) => (
      <Text>{getTextEmpty({ txt: successRatePercent, tailText: "%" })}</Text>
    ),
  },
  {
    title: "Break Rate (if failed)",
    responsive: ["sm"],
    render: (_, { breakRatePercent }) => (
      <Text type={breakRatePercent > 0 ? "danger" : undefined}>
        {breakRatePercent}%
      </Text>
    ),
  },
];

const getMatsTable = () => GoldDragonJadeEnhanceMaterialTable;

const getStatsTable = (equipment: EQUIPMENT) =>
  partStatsTables[equipment as JadePart] ?? [];

const GoldDragonJadeContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<GoldDragonJadeCalculator[]>(
    dataGoldDragonJadeCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(0);
  const [checkedCraft, setCheckedCraft] = useState(false);

  // From === To is allowed: that row skips enhancing (e.g. craft only).
  const invalidDtSrc = useSelectionFlag(
    selectedRowKeys,
    dataSource,
    (row) => row.to < row.from
  );
  const riskDtSrc = useSelectionFlag(
    selectedRowKeys,
    dataSource,
    (row) => row.to > 5
  );

  useEffect(() => {
    setDataSource((prev) =>
      prev.map((item) => ({
        ...item,
        from: selectFrom,
        to: selectTo,
        craft: checkedCraft,
      }))
    );
  }, [selectFrom, selectTo, checkedCraft]);

  const reduceRow = useCallback(
    (
      acc: { res1: TableMaterialList; res2: ExtraData },
      slice: GoldDragonJadeEnhanceMaterial[],
      row: GoldDragonJadeCalculator
    ): { res1: TableMaterialList; res2: ExtraData } => {
      const res1 = { ...acc.res1 };
      const res2 = { ...acc.res2 };
      slice.forEach((slicedItem) => {
        res1["Golden Memory"] += slicedItem.goldenMemory;
        res1["Faded Memory"] += slicedItem.fadedMemory;
        res1.Gold += slicedItem.gold;
      });
      if (row.craft) {
        res1["Golden Memory"] += GoldDragonJadeCraftMaterial.goldenMemory;
        res1["Faded Memory"] += GoldDragonJadeCraftMaterial.fadedMemory;
        res1.Gold += GoldDragonJadeCraftMaterial.gold;
      }
      if (slice.length > 0) {
        res2[row.equipment as JadePart] = {
          "Success Rate": slice.map((it) => it.successRatePercent),
          "Break Rate": slice.map((it) => it.breakRatePercent),
        };
      }
      return { res1, res2 };
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getMatsTable,
    emptyGoldDragonJadeMats,
    reduceRow
  );

  const enhanceStatDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getStatsTable
  );

  // A crafted part is a new jade, so its stats at From count too (not just
  // the From→To increase).
  const selectedRows = useSelectedRows(selectedRowKeys, dataSource);
  const statDif: CommonItemStats = useMemo(() => {
    if (invalidDtSrc) {
      return enhanceStatDif;
    }
    return selectedRows
      .filter((row) => row.craft)
      .reduce((acc, { equipment, from }) => {
        const base = getStatsTable(equipment)[from];
        return base ? combineEqStats(acc, base, "add") : acc;
      }, enhanceStatDif);
  }, [enhanceStatDif, selectedRows, invalidDtSrc]);

  const extraInfo: ItemList[] = useMemo(
    () =>
      buildRateSummary(tableResource.res2, [
        {
          key: "Success Rate",
          title: "Success Rate",
          suffix: "%",
          tag: getSuccessRateTag,
        },
        {
          key: "Break Rate",
          title: "Break Rate",
          suffix: "%",
          tag: getBreakTag,
        },
      ]),
    [tableResource.res2]
  );

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      extraColumns={[{ type: "switch", dataIndex: "craft", label: "Craft" }]}
      allowSameRange
      invalid={invalidDtSrc}
      invalidMessage="To cannot be lower than From"
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 10,
      }}
      toggles={[
        {
          key: "craft",
          label: "Include Craft mats",
          tooltip: `${GoldDragonJadeCraftMaterial.goldenMemory} Golden Memory, ${GoldDragonJadeCraftMaterial.fadedMemory} Faded Memory, ${GoldDragonJadeCraftMaterial.gold.toLocaleString()} Gold per jade`,
          checked: checkedCraft,
          onChange: setCheckedCraft,
        },
      ]}
      flags={[
        {
          show: riskDtSrc,
          message:
            "Above +5, the enhancement might fail and a failed attempt destroys the jade.",
          type: "warning",
        },
      ]}
      mats={{ data: tableResource.res1, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      stats={{ statDif }}
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats",
      children: (
        <div>
          <Text type="secondary">
            ATK & Max HP apply to all parts. Helmet: Critical, Upper: Final
            Damage, Lower: Critical Damage, Gloves: Physical Defense, Shoes:
            Magical Defense.
          </Text>
          <Table
            style={{ marginRight: 10, marginBottom: 10, marginTop: 8 }}
            size={"small"}
            dataSource={GoldDragonJadeStatsTable}
            columns={getColumnsStats({
              phyMagAtkFlag: true,
              hpFlag: true,
              crtFlag: true,
              fdFlag: true,
              cdmFlag: true,
              defFlag: true,
              magdefFlag: true,
            })}
            pagination={false}
            bordered
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Mats",
      children: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text type="secondary">
            Craft (per jade): {GoldDragonJadeCraftMaterial.goldenMemory} Golden
            Memory, {GoldDragonJadeCraftMaterial.fadedMemory} Faded Memory,{" "}
            {GoldDragonJadeCraftMaterial.gold.toLocaleString()} Gold.
          </Text>
          <div style={{ marginRight: 10, marginTop: 8 }}>
            <Table
              size={"small"}
              dataSource={GoldDragonJadeEnhanceMaterialTable}
              columns={columnsMats}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
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

export default GoldDragonJadeContent;
