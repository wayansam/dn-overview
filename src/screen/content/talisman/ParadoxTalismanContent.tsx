import { Collapse, CollapseProps, Table, Typography } from "antd";
import { SliderMarks } from "antd/es/slider";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import RangeCalculatorPanel from "../../../components/RangeCalculatorPanel";
import StatReferenceTables from "../../../components/StatReferenceTables";
import {
  BlueFrostBlessedTalismanStatTable,
  BlueFrostTalismanStatTable,
  HiverBlessedTalismanStatTable,
  HiverTalismanStatTable,
  KaunosBlessedTalismanStatTable,
  KaunosTalismanStatTable,
  ParadoxicalWorldBlessedTalismanStatTable,
  ParadoxicalWorldTalismanStatTable,
  ParadoxTalismanEnhanceMatsTable,
  ShalicaBlessedTalismanStatTable,
  ShalicaTalismanStatTable,
  TigerDragonBlessedTalismanStatTable,
  TigerDragonTalismanStatTable,
} from "../../../data/talisman/ParadoxTalismanData";
import {
  columnCommonItemFlag,
  CommonItemStats,
} from "../../../interface/ItemStat.interface";
import {
  combineEqStats,
  getStatDif,
  getSuccessRateTag,
} from "../../../utils/common.util";
import { buildRateSummary } from "../../../utils/rateSummary";
const { Text } = Typography;

interface TalismanTableMaterialList {
  "Awakened Mana Egg": number;
  "Afterimage Record": number;
  Gold: number;
}

interface ParadoxTalisman {
  key: string;
  label: string;
  stats: CommonItemStats[];
  blessedStats: CommonItemStats[];
  flags: columnCommonItemFlag;
  evolutionItem: string;
}

const MAX_LEVEL = 15;
// Failing an attempt at this level or above drops the talisman 1 level.
const DROP_LEVEL_START = 12;

const PARADOX_TALISMANS: ParadoxTalisman[] = [
  {
    key: "kaunos",
    label: "Kaunos",
    stats: KaunosTalismanStatTable,
    blessedStats: KaunosBlessedTalismanStatTable,
    flags: { crtFlag: true, cdmFlag: true, fdFlag: true },
    evolutionItem: "Kaunos Fragment",
  },
  {
    key: "shalica",
    label: "Shalica",
    stats: ShalicaTalismanStatTable,
    blessedStats: ShalicaBlessedTalismanStatTable,
    flags: { phyMagAtkFlag: true },
    evolutionItem: "Shalica's Chains",
  },
  {
    key: "tigerDragon",
    label: "Tiger Dragon's Intact",
    stats: TigerDragonTalismanStatTable,
    blessedStats: TigerDragonBlessedTalismanStatTable,
    flags: { phyMagAtkPercentFlag: true },
    evolutionItem: "Tiger Dragon Scale",
  },
  {
    key: "hiver",
    label: "Hiver",
    stats: HiverTalismanStatTable,
    blessedStats: HiverBlessedTalismanStatTable,
    flags: { attAtkPercentFlag: true },
    evolutionItem: "Hiver's Dragon Soul",
  },
  {
    key: "blueFrost",
    label: "Blue Frost",
    stats: BlueFrostTalismanStatTable,
    blessedStats: BlueFrostBlessedTalismanStatTable,
    flags: {
      phyMagAtkPercentFlag: true,
      crtFlag: true,
      cdmFlag: true,
      fdFlag: true,
    },
    evolutionItem: "Blue Frost Branch",
  },
  {
    key: "paradoxicalWorld",
    label: "Paradoxical World",
    stats: ParadoxicalWorldTalismanStatTable,
    blessedStats: ParadoxicalWorldBlessedTalismanStatTable,
    flags: {
      attAtkPercentFlag: true,
      crtFlag: true,
      cdmFlag: true,
      fdFlag: true,
    },
    evolutionItem: "Paradoxical Heart",
  },
];

// Blessed doesn't scale differently, it's the normal table shifted by a flat
// amount (same gap at every +0..+15 level), so +0 alone gives the bonus.
const getBlessedBonus = (talisman: ParadoxTalisman): CommonItemStats =>
  combineEqStats(talisman.blessedStats[0], talisman.stats[0], "minus");

interface SetEffect {
  condition: string;
  effects: string[];
}
const SET_EFFECTS: SetEffect[] = [
  {
    condition: "Set of 2 (Kaunos, Shalica, Tiger Dragon's Intact, Hiver)",
    effects: ["Physical/Magic ATK +35%"],
  },
  {
    condition: "Set of 4 (Kaunos, Shalica, Tiger Dragon's Intact, Hiver)",
    effects: ["Attribute ATK +30%"],
  },
  {
    condition: "Set of 2 (Blue Frost, Paradoxical World)",
    effects: [
      "Physical/Magic ATK +50%",
      "CRT +250,000",
      "CRT Damage +2,250,000",
      "Final Damage +3,600",
    ],
  },
];

const SLOT_EXPANSION = [
  { slot: 1, manaEgg: 400, gold: 200000 },
  { slot: 2, manaEgg: 350, gold: 100000 },
  { slot: 3, manaEgg: 250, gold: 50000 },
  { slot: 4, manaEgg: 200, gold: 10000 },
];

const marks: SliderMarks = Array.from(
  { length: MAX_LEVEL + 1 },
  (_, i) => i,
).reduce((obj, lvl) => ({ ...obj, [lvl]: `+${lvl}` }), {});

const ParadoxTalismanContent = () => {
  const [range, setRange] = useState([0, MAX_LEVEL]);
  const [talismanKey, setTalismanKey] = useState(PARADOX_TALISMANS[0].key);
  const [blessed, setBlessed] = useState(false);

  const talisman =
    PARADOX_TALISMANS.find((it) => it.key === talismanKey) ??
    PARADOX_TALISMANS[0];

  // Pure reference data — memoized so it isn't rebuilt (and reconciled,
  // since antd's Collapse keeps inactive panels mounted) on every click in
  // the calculator panel below.
  const statContent = useMemo(
    () => (
      <StatReferenceTables
        entries={PARADOX_TALISMANS.map((it) => ({
          key: it.key,
          label: it.label,
          tables: [
            { label: it.label, dataSource: it.stats, flags: it.flags },
            {
              label: `Blessed ${it.label}`,
              dataSource: it.blessedStats,
              flags: it.flags,
            },
          ],
        }))}
      />
    ),
    [],
  );

  // Every Paradox talisman shares the same enhancement table, so there's a
  // single mats table plus the one-off notes from the patch note.
  const matsContent = useMemo(() => {
    const columnsSetEffect: ColumnsType<SetEffect> = [
      { title: "Condition (Blessed or not)", dataIndex: "condition" },
      {
        title: "Effect",
        render: (_, { effects }) => (
          <div>
            {effects.map((it) => (
              <p key={it}>{it}</p>
            ))}
          </div>
        ),
      },
    ];

    return (
      <MatsReferenceTables
        entries={[
          {
            key: "1",
            label: "Enhancement",
            dataSource: ParadoxTalismanEnhanceMatsTable,
            fields: [
              {
                dataIndex: "successRatePercent",
                label: "Success Rate",
                shortLabel: " (rate)",
                tailText: "%",
              },
              {
                dataIndex: "dropLevel",
                label: "Level Drop on Fail",
                shortLabel: " (drop)",
              },
              {
                dataIndex: "manaEgg",
                label: "Awakened Mana Egg",
                shortLabel: " (egg)",
              },
              {
                dataIndex: "afterimageRecord",
                label: "Afterimage Record",
                shortLabel: " (record)",
              },
              { dataIndex: "gold", label: "Gold", shortLabel: " (g)" },
            ],
          },
          {
            key: "2",
            label: "Set Effects",
            content: (
              <div style={{ marginRight: 10 }}>
                <Table
                  size={"small"}
                  rowKey="condition"
                  dataSource={SET_EFFECTS}
                  columns={columnsSetEffect}
                  pagination={false}
                  bordered
                />
                <i>
                  notes: set effects only count talismans equipped in activated
                  Resonance Slots. Talismans with the same title cannot be
                  equipped together.
                </i>
              </div>
            ),
          },
          {
            key: "3",
            label: "Blessed Evolution",
            content: (
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {PARADOX_TALISMANS.map((it) => (
                    <div
                      key={it.key}
                      style={{ marginRight: 10, marginBottom: 10 }}
                    >
                      <ListingCard
                        keyId={`blessed-bonus-${it.key}`}
                        title={`${it.label} (${it.evolutionItem})`}
                        data={getStatDif(getBlessedBonus(it))}
                      />
                    </div>
                  ))}
                </div>
                <i>
                  notes: the enhancement level is kept after evolving, and the
                  Blessed bonus is the same at every level.
                </i>
              </div>
            ),
          },
          {
            key: "4",
            label: "Resonance Slot Expansion (5th row, Lv. 100)",
            content: (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {SLOT_EXPANSION.map((it) => (
                  <Text key={it.slot}>
                    * Slot {it.slot} : {it.manaEgg.toLocaleString()} Awakened
                    Mana Egg, {it.gold.toLocaleString()} Gold
                  </Text>
                ))}
              </div>
            ),
          },
          {
            key: "5",
            label: "Disassembly & Seal",
            content: (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text>
                  * Disassembly gives 5 or 10 Afterimage Record, regardless of
                  enhancement level.
                </Text>
                <Text>
                  * Blue Frost, Paradoxical World and every Blessed talisman
                  cannot be disassembled.
                </Text>
                <Text>
                  * Every Blessed talisman, Blue Frost and Paradoxical World can
                  be sealed once (5,000 Seal Stamps) to trade in the Trading
                  House.
                </Text>
              </div>
            ),
          },
        ]}
      />
    );
  }, []);

  // Mats table row i is the cost to go from +i to +(i+1), so slicing
  // [from, to) covers exactly the levels being enhanced.
  const matsSlice = useMemo(
    () => ParadoxTalismanEnhanceMatsTable.slice(range[0], range[1]),
    [range],
  );

  const dataSource: TalismanTableMaterialList = useMemo(() => {
    let tempEgg = 0;
    let tempRecord = 0;
    let tempGold = 0;
    matsSlice.forEach((slicedItem) => {
      tempEgg += slicedItem.manaEgg;
      tempRecord += slicedItem.afterimageRecord;
      tempGold += slicedItem.gold;
    });
    return {
      "Awakened Mana Egg": tempEgg,
      "Afterimage Record": tempRecord,
      Gold: tempGold,
    };
  }, [matsSlice]);

  const extraInfo: ItemList[] = useMemo(
    () =>
      buildRateSummary(
        {
          [talisman.label]: {
            "Success Rate": matsSlice.map((it) => it.successRatePercent),
          },
        },
        [
          {
            key: "Success Rate",
            title: "Success Rate",
            suffix: "%",
            tag: getSuccessRateTag,
          },
        ],
      ),
    [matsSlice, talisman.label],
  );

  // Stat tables are indexed by enhancement level (+0..+15). Status Increase
  // stays enhancement-only; the Blessed bonus is shown on its own card with
  // the sum in Total Increase, so the cards read as base + bonus = total.
  const statDiff: CommonItemStats = useMemo(
    () =>
      combineEqStats(
        talisman.stats[range[1]],
        talisman.stats[range[0]],
        "minus",
      ),
    [talisman, range],
  );

  const blessedBonus = useMemo(() => getBlessedBonus(talisman), [talisman]);

  const totalDiff: CommonItemStats = useMemo(
    () => combineEqStats(statDiff, blessedBonus, "add"),
    [statDiff, blessedBonus],
  );

  const getCalc = () => (
    <RangeCalculatorPanel
      rangeSlider={{
        value: range as [number, number],
        onChange: setRange,
        max: MAX_LEVEL,
        marks,
      }}
      flags={[
        {
          show: range[1] > DROP_LEVEL_START - 1,
          message: `Failing at +${DROP_LEVEL_START} and above drops the talisman 1 level`,
          type: "warning",
        },
        {
          show: matsSlice.some((it) => it.successRatePercent < 100),
          message: "Mats assume every attempt succeeds on the first try",
          type: "info",
        },
      ]}
      selects={[
        {
          key: "talisman",
          label: "Talisman",
          value: talismanKey,
          width: 180,
          options: PARADOX_TALISMANS.map((it) => ({
            label: it.label,
            value: it.key,
          })),
          onChange: (value) => setTalismanKey(value as string),
        },
      ]}
      toggles={[
        {
          key: "blessed",
          label: "Evolve to Blessed",
          checked: blessed,
          onChange: setBlessed,
          tooltip: `Adds the Blessed bonus (evolved with ${talisman.evolutionItem}) on top of the enhancement increase`,
        },
      ]}
      mats={{ data: dataSource, hideZero: true }}
      rateSummary={{ items: extraInfo }}
      // Status Increase is rendered here instead of via the `stats` prop so it
      // shares one card with the Blessed cards; separate cards wrap apart on
      // narrower screens.
      extra={
        <>
          <ListingCard
            keyId="status-increase"
            title="Status Increase"
            data={getStatDif(statDiff)}
          />
          {blessed && (
            <>
              <ListingCard
                keyId="blessed-bonus"
                title="+ Blessed Evolution Bonus"
                data={[
                  {
                    title: "Evolution Item :",
                    value: `1 ${talisman.evolutionItem}`,
                  },
                  ...getStatDif(blessedBonus),
                ]}
              />
              <ListingCard
                keyId="blessed-total"
                title="= Total Increase"
                data={getStatDif(totalDiff)}
              />
            </>
          )}
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
      label: "Paradox Talisman",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default ParadoxTalismanContent;
