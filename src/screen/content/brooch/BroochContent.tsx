import { Collapse, CollapseProps, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import ListingCard, { ItemList } from "../../../components/ListingCard";
import MatsReferenceTables, {
  MatsReferenceEntry,
} from "../../../components/MatsReferenceTables";
import RangeCalculatorPanel from "../../../components/RangeCalculatorPanel";
import { TAB_KEY } from "../../../constants/Common.constants";
import {
  NerwinBroochCraftTable,
  NerwinBroochStatsTable,
} from "../../../data/brooch/NerwinBroochData";
import {
  TerramaiBroochBlessingStats,
  TerramaiBroochCraftTable,
  TerramaiBroochStatsTable,
  TerramaiPowerRecipe,
} from "../../../data/brooch/TerramaiBroochData";
import {
  VelskudBroochCraftTable,
  VelskudBroochStatsTable,
} from "../../../data/brooch/VelskudBroochData";
import {
  useRangeAccumulator,
  useRangeStatDiff,
} from "../../../hooks/useJadeCalculator";
import { BroochCraftMaterial } from "../../../interface/Item.interface";
import {
  BroochStats,
  columnCommonItemFlag,
} from "../../../interface/ItemStat.interface";
import { getColumnsStats } from "../../../utils/common.util";

const { Text } = Typography;

type MatKey = Exclude<keyof BroochCraftMaterial, "encLevel" | "rarity">;
type MatsList = Record<string, number>;

const MATERIAL_LABEL: Record<MatKey, { label: string; short: string }> = {
  remains: { label: "Fragmented Brooch Remains", short: "(Remains)" },
  potentialShard: { label: "Velskud's Potential Shard", short: "(Shard)" },
  luckyStone: { label: "Velskud's Dimensional Lucky Stone", short: "(Lucky Stone)" },
  liberationFragment: { label: "Nerwin's Liberation Fragment", short: "(Fragment)" },
  rippleStone: { label: "Nerwin's Otherworldly Ripple Stone", short: "(Ripple Stone)" },
  shieldFragment: { label: "Shield Fragment", short: "(Shield)" },
  wandOfJudgement: { label: "Wand of Judgement", short: "(Wand)" },
  terramaiPower: { label: "Terramai's Power", short: "(Power)" },
  gold: { label: "Gold", short: "(g)" },
};

interface BroochDefinition {
  // stats[0] is the unupgraded base brooch; stats[i] is the brooch after
  // craft[i - 1], so a From/To stage range slices craft and diffs stats.
  stats: BroochStats[];
  craft: BroochCraftMaterial[];
  matKeys: MatKey[];
  statFlags: columnCommonItemFlag;
  notes: string[];
  // Terramai only: Legend grade shown for reference, and the craftable
  // Terramai's Power that the calculator can expand into its materials.
  blessing?: BroochStats;
  power?: BroochCraftMaterial;
}

const BROOCH_DEFINITIONS: Record<string, BroochDefinition> = {
  [TAB_KEY.broochVelskud]: {
    stats: VelskudBroochStatsTable,
    craft: VelskudBroochCraftTable,
    matKeys: ["remains", "potentialShard", "luckyStone"],
    statFlags: { attAtkPercentFlag: true, fdFlag: true, hpPercentFlag: true },
    notes: [
      "Magic Lv.1 also consumes a Velskud's Sealed Power Brooch (Cherry - Brooch Shop - Remains Shop, or Beginner's Guide).",
      "Each step consumes the previous level brooch.",
      "Potential Shards and Lucky Stones come from Velskud's Dimensional Brooch Box.",
    ],
  },
  [TAB_KEY.broochNerwin]: {
    stats: NerwinBroochStatsTable,
    craft: NerwinBroochCraftTable,
    matKeys: ["remains", "liberationFragment", "rippleStone"],
    statFlags: { phyMagAtkPercentFlag: true, fdFlag: true, hpPercentFlag: true },
    notes: [
      "Magic Lv.1 also consumes a Sealed Power Nerwin Brooch (Cherry - Brooch Shop - Remains Shop, or Beginner's Guide).",
      "Each step consumes the previous level brooch.",
      "Liberation Fragments and Ripple Stones come from the Otherworld-trapped Nerwin Brooch Box.",
    ],
  },
  [TAB_KEY.broochTerramai]: {
    stats: TerramaiBroochStatsTable,
    craft: TerramaiBroochCraftTable,
    matKeys: ["remains", "shieldFragment", "wandOfJudgement", "terramaiPower", "gold"],
    statFlags: {
      defFlag: true,
      fdFlag: true,
      hpFlag: true,
      hpPercentFlag: true,
      attAtkPercentFlag: true,
    },
    notes: [
      "Magic Lv.1 also consumes a Terramai's Sealed Power Brooch (Beginner's Guide, or Cherry - Brooch Shop - Brooch Fragments).",
      "Each step consumes the previous level brooch; Gold is the base crafting fee per step.",
      "Terramai's Power: 500 Fragmented Brooch Remains, 200 Shield Fragment, 100 Wand of Judgement, 10,000 Gold.",
      "Legend grade [Blessing: Otherworldly] is not craftable (Terramai Brooch of Faith Box / Brooch Shop).",
    ],
    blessing: TerramaiBroochBlessingStats,
    power: TerramaiPowerRecipe,
  },
};

const GRADES = ["Magic", "Rare", "Epic", "Unique", "Legend"];

interface BroochContentProps {
  tabKey: string;
}

const BroochContent = ({ tabKey }: BroochContentProps) => {
  const def = BROOCH_DEFINITIONS[tabKey];
  const [from, setFrom] = useState<number>(0);
  const [to, setTo] = useState<number>(1);
  const [craftPower, setCraftPower] = useState(false);

  const range = useMemo((): [number, number] => [from, to], [from, to]);
  const invalid = from >= to;
  const getStageLabel = useCallback(
    (stage: number) => def.stats[stage]?.encLevel ?? `${stage}`,
    [def]
  );

  const emptyMats = useMemo(
    (): MatsList =>
      Object.fromEntries(def.matKeys.map((key) => [MATERIAL_LABEL[key].label, 0])),
    [def]
  );

  const reduceSlice = useCallback(
    (acc: MatsList, slice: BroochCraftMaterial[]): MatsList => {
      const next = { ...acc };
      slice.forEach((step) => {
        def.matKeys.forEach((key) => {
          next[MATERIAL_LABEL[key].label] += step[key] ?? 0;
        });
      });
      return next;
    },
    [def]
  );

  const finalizeMats = useCallback(
    (acc: MatsList, ctx: { craftPower: boolean }): MatsList => {
      const { power } = def;
      const powerLabel = MATERIAL_LABEL.terramaiPower.label;
      const count = acc[powerLabel] ?? 0;
      if (!ctx.craftPower || !power || count === 0) {
        return acc;
      }
      const next = { ...acc, [powerLabel]: 0 };
      (Object.keys(MATERIAL_LABEL) as MatKey[]).forEach((key) => {
        const amount = power[key];
        if (amount) {
          const label = MATERIAL_LABEL[key].label;
          next[label] = (next[label] ?? 0) + amount * count;
        }
      });
      return next;
    },
    [def]
  );

  const ctx = useMemo(() => ({ craftPower }), [craftPower]);

  const mats = useRangeAccumulator(
    range,
    invalid,
    def.craft,
    emptyMats,
    reduceSlice,
    ctx,
    finalizeMats
  );

  const statDif = useRangeStatDiff(range, invalid, def.stats);

  const skillInfo: ItemList[] = useMemo(() => {
    if (invalid) {
      return [];
    }
    return [
      { title: "From", value: def.stats[from]?.skillAtk ?? "-" },
      { title: "To", value: def.stats[to]?.skillAtk ?? "-" },
    ];
  }, [def, from, to, invalid]);

  const statColumns = useMemo(
    (): ColumnsType<BroochStats> => [
      ...(getColumnsStats(def.statFlags) as ColumnsType<BroochStats>),
      {
        title: "Skill ATK",
        dataIndex: "skillAtk",
        responsive: ["sm"],
        render: (_, { skillAtk }) => <Text>{skillAtk ?? "-"}</Text>,
      },
    ],
    [def]
  );

  // Pure reference data — memoized so it isn't rebuilt on every click in
  // the stateful "Calculate" panel.
  const statContent = useMemo(() => {
    const rows = [...def.stats.slice(1), ...(def.blessing ? [def.blessing] : [])];
    const items: CollapseProps["items"] = GRADES.map((grade) => ({
      grade,
      dataSource: rows.filter((row) => row.rarity === grade),
    }))
      .filter(({ dataSource }) => dataSource.length > 0)
      .map(({ grade, dataSource }) => ({
        key: grade,
        label: grade,
        children: (
          <div style={{ overflowX: "auto" }}>
            <Table
              size={"small"}
              rowKey="encLevel"
              dataSource={dataSource}
              columns={statColumns}
              pagination={false}
              bordered
            />
          </div>
        ),
      }));
    return <Collapse items={items} size="small" />;
  }, [def, statColumns]);

  const matsContent = useMemo(() => {
    const fields: CraftMaterialField<BroochCraftMaterial>[] = def.matKeys.map(
      (key) => ({
        dataIndex: key,
        label: MATERIAL_LABEL[key].label,
        shortLabel: MATERIAL_LABEL[key].short,
      })
    );
    const entries: MatsReferenceEntry<BroochCraftMaterial>[] = [
      {
        key: "Note",
        label: "Note",
        content: (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {def.notes.map((note) => (
              <Text key={note}>* {note}</Text>
            ))}
          </div>
        ),
      },
      ...GRADES.map((grade) => ({
        key: grade,
        label: grade,
        dataSource: def.craft.filter((step) => step.rarity === grade),
        fields,
      })).filter(({ dataSource }) => dataSource.length > 0),
    ];
    return <MatsReferenceTables defaultActiveKey={"Note"} entries={entries} />;
  }, [def]);

  const getCalculator = () => (
    <RangeCalculatorPanel
      rangeSelect={{
        from,
        to,
        onFromChange: setFrom,
        onToChange: setTo,
        max: def.craft.length,
        customLabeling: getStageLabel,
      }}
      invalid={invalid}
      toggles={
        def.power
          ? [
              {
                key: "craftPower",
                label: "Craft Terramai's Power",
                tooltip:
                  "Count each Terramai's Power as 500 Remains, 200 Shield Fragment, 100 Wand of Judgement, 10,000 Gold",
                checked: craftPower,
                onChange: setCraftPower,
              },
            ]
          : []
      }
      mats={{ data: mats, hideZero: true }}
      stats={{ statDif }}
      extra={
        skillInfo.length > 0 && (
          <ListingCard title="Dragon Jade Skill ATK" data={skillInfo} />
        )
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

export default BroochContent;
