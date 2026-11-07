import { Collapse, CollapseProps, Table } from "antd";
import { SliderMarks } from "antd/es/slider";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import RangeCalculatorPanel from "../../../components/RangeCalculatorPanel";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { EmptyCommonnStat } from "../../../constants/Common.constants";
import {
  GOLDEN_HERALDRIES,
  GOLDEN_HERALDRY_LEVELS,
  GoldenHeraldry,
  GoldenHeraldryPlate,
  GoldenHeraldryPlateTable,
} from "../../../data/heraldry/GoldenHeraldryData";
import { GoldenHeraldryCraftMats } from "../../../interface/Item.interface";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { combineEqStats, getStatDif } from "../../../utils/common.util";

// Slider points: 0 = Don't have, 1..4 = Lv.1..Lv.4, 5 = Blessed. Blessed
// sits on top like Black Dragon's Legend so its stat difference can still be
// compared, but it can't be reached by crafting from Lv.4.
const CRAFTABLE_MAX = GOLDEN_HERALDRY_LEVELS.length;
const BLESSED_LEVEL = CRAFTABLE_MAX + 1;

const marks: SliderMarks = {
  0: "Don't have",
  ...GOLDEN_HERALDRY_LEVELS.reduce(
    (obj, lvl, idx) => ({ ...obj, [idx + 1]: lvl }),
    {},
  ),
  [BLESSED_LEVEL]: "Blessed",
};

const PLATE_OPTIONS = GoldenHeraldryPlateTable.filter(
  (it) => it.successRatePercent < 100,
);

const getCraftFields = (
  heraldry: GoldenHeraldry,
): CraftMaterialField<GoldenHeraldryCraftMats>[] => [
  {
    dataIndex: "prevHeraldry",
    label: "Previous Level Heraldry",
    shortLabel: " (prev lv)",
  },
  {
    dataIndex: "foundationStone",
    label: "Ancients' Foundation Stone",
    shortLabel: " (stone)",
  },
  {
    dataIndex: "weaponCrystal",
    label: "Shattered Spun Gold Weapon Crystal",
    shortLabel: " (weapon crystal)",
  },
  {
    dataIndex: "armorCrystal",
    label: "Shattered Spun Gold Armor Crystal",
    shortLabel: " (armor crystal)",
  },
  ...(heraldry.specialItem
    ? [
        {
          dataIndex: "special" as const,
          label: heraldry.specialItem,
          shortLabel: ` (${heraldry.specialItem})`,
        },
      ]
    : []),
  { dataIndex: "gold", label: "Gold", shortLabel: " (g)" },
];

const GoldenHeraldryContent = () => {
  const [range, setRange] = useState([0, CRAFTABLE_MAX]);
  const [heraldryKey, setHeraldryKey] = useState(GOLDEN_HERALDRIES[0].key);
  const [plateGrade, setPlateGrade] = useState(PLATE_OPTIONS[1].grade);
  const [countFailures, setCountFailures] = useState(false);
  const blessedInRange = range[1] === BLESSED_LEVEL;

  const heraldry =
    GOLDEN_HERALDRIES.find((it) => it.key === heraldryKey) ??
    GOLDEN_HERALDRIES[0];
  const plate =
    PLATE_OPTIONS.find((it) => it.grade === plateGrade) ?? PLATE_OPTIONS[0];

  // Pure reference data — memoized so it isn't rebuilt on every click in the
  // calculator panel below (antd's Collapse keeps inactive panels mounted).
  const statContent = useMemo(
    () => (
      <StatReferenceTables
        entries={GOLDEN_HERALDRIES.map((it) => ({
          key: it.key,
          label: `Golden ${it.label} Enhancement Heraldry`,
          dataSource: it.stats,
          flags: it.flags,
        }))}
      />
    ),
    [],
  );

  const matsContent = useMemo(() => {
    const columnsPlate: ColumnsType<GoldenHeraldryPlate> = [
      { title: "Grade", dataIndex: "grade" },
      { title: "Plate", dataIndex: "plateName" },
      {
        title: "Crafting Success Rate",
        render: (_, { successRatePercent }) => `${successRatePercent}%`,
      },
      { title: "Crafts", dataIndex: "use" },
    ];

    return (
      <MatsReferenceTables<GoldenHeraldryCraftMats>
        entries={[
          ...GOLDEN_HERALDRIES.map((it) => ({
            key: it.key,
            label: `Golden ${it.label} Enhancement Heraldry`,
            dataSource: it.craftMats,
            fields: getCraftFields(it),
            footer:
              "Lv.2 - Lv.4 consume 1 heraldry of the previous level, which is returned on failure.",
          })),
          {
            key: "plate",
            label: "Golden Plates",
            content: (
              <div style={{ marginRight: 10 }}>
                <Table
                  size={"small"}
                  rowKey="grade"
                  dataSource={GoldenHeraldryPlateTable}
                  columns={columnsPlate}
                  pagination={false}
                  bordered
                />
                <i>
                  notes: Epic/Unique plates drop from Stone Half Golems
                  (Purple-type Dimensional Orbs). Legend plates drop from Golden
                  Boxes after clearing the Hidden Dimensional Treasure Vault.
                </i>
              </div>
            ),
          },
        ]}
      />
    );
  }, []);

  // craftMats row i is the cost of crafting Lv.(i+1), so slicing [from, to)
  // covers exactly the levels being crafted. A range reaching Blessed isn't
  // a craftable path (Blessed is made from a Legend plate, not from Lv.4), so
  // it gets no mats, same as Black Dragon's non-craftable Legend.
  const craftSlice = useMemo(
    () =>
      blessedInRange ? [] : heraldry.craftMats.slice(range[0], range[1]),
    [heraldry, range, blessedInRange],
  );

  const successRate = plate.successRatePercent;
  // Expected attempts per level for a geometric trial is 1 / rate.
  const attemptsPerLevel = countFailures ? 100 / successRate : 1;

  const matsData = useMemo(() => {
    const sum = (key: keyof GoldenHeraldryCraftMats) =>
      Math.round(
        craftSlice.reduce((acc, it) => acc + (it[key] as number), 0) *
          attemptsPerLevel,
      );
    return {
      "Ancients' Foundation Stone": sum("foundationStone"),
      "Shattered Spun Gold Weapon Crystal": sum("weaponCrystal"),
      "Shattered Spun Gold Armor Crystal": sum("armorCrystal"),
      ...(heraldry.specialItem
        ? { [heraldry.specialItem]: sum("special") }
        : {}),
      Gold: sum("gold"),
    };
  }, [craftSlice, attemptsPerLevel, heraldry.specialItem]);

  const craftInfo: ItemList[] = useMemo(
    () =>
      craftSlice.length === 0
        ? []
        : [
            {
              title: "Plate :",
              value: `${plate.grade} Golden ${heraldry.label} Plate`,
            },
            { title: "Success Rate :", value: `${successRate}%` },
            {
              title: "Expected Attempts :",
              value: `${Number(
                (craftSlice.length * (100 / successRate)).toFixed(2),
              ).toLocaleString()}`,
            },
          ],
    [plate.grade, heraldry.label, successRate, craftSlice.length],
  );

  // Stat tables hold Lv.1..Lv.4 then Blessed, so slider point n maps to
  // stats[n - 1]; "Don't have" (0) has no stats.
  const statDiff: CommonItemStats = useMemo(() => {
    const statAt = (lvl: number) =>
      lvl > 0 ? heraldry.stats[lvl - 1] : { encLevel: "0" };
    return combineEqStats(
      combineEqStats({ ...EmptyCommonnStat }, statAt(range[1]), "add"),
      statAt(range[0]),
      "minus",
    );
  }, [heraldry, range]);

  const getCalc = () => (
    <RangeCalculatorPanel
      rangeSlider={{
        value: range as [number, number],
        onChange: setRange,
        max: BLESSED_LEVEL,
        marks,
      }}
      flags={[
        {
          show: blessedInRange,
          message: "Blessed is non craftable from Lv.4",
          type: "warning",
        },
        {
          show: craftSlice.length > 0 && !countFailures,
          message: "Mats assume no failed attempt",
          type: "info",
        },
      ]}
      selects={[
        {
          key: "heraldry",
          label: "Heraldry",
          value: heraldryKey,
          width: 140,
          options: GOLDEN_HERALDRIES.map((it) => ({
            label: it.label,
            value: it.key,
          })),
          onChange: (value) => setHeraldryKey(value as string),
        },
        {
          key: "plate",
          label: "Plate",
          value: plateGrade,
          width: 140,
          options: PLATE_OPTIONS.map((it) => ({
            label: `${it.grade} (${it.successRatePercent}%)`,
            value: it.grade,
          })),
          onChange: (value) => setPlateGrade(value as string),
        },
      ]}
      toggles={[
        {
          key: "countFailures",
          label: "Include expected failures",
          checked: countFailures,
          onChange: setCountFailures,
          tooltip:
            "Multiplies the mats by the expected attempts (100 / success rate). The previous level heraldry is returned on failure.",
        },
      ]}
      mats={{ data: matsData, hideZero: true }}
      shrinkSettings
      extra={
        <>
          {craftInfo.length > 0 && (
            <ListingCard keyId="craft-info" title="Crafting" data={craftInfo} />
          )}
          <ListingCard
            keyId="status-increase"
            title="Status Increase"
            data={getStatDif(statDiff)}
          />
        </>
      }
    />
  );

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
      label: "Golden Enhancement Heraldry Calculator",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default GoldenHeraldryContent;
