import { Collapse, CollapseProps, Typography } from "antd";
import { useCallback, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import RangeCalculatorPanel from "../../../components/RangeCalculatorPanel";
import { useRangeAccumulator } from "../../../hooks/useJadeCalculator";
import {
  PARADOX_FRAGMENT,
  PARADOX_SKILL_JADE_PRICE_STONE,
  PARADOX_SKILL_JADE_TYPES,
  PARADOX_STONE,
  ParadoxSkillJadeMaterial,
  ParadoxSkillJadeMaterialTable,
  ParadoxSkillJadeType,
} from "../../../data/paradox/ParadoxShopData";

const { Text } = Typography;

type MatsList = Record<string, number>;

const EMPTY_MATS: MatsList = { [PARADOX_FRAGMENT]: 0, [PARADOX_STONE]: 0 };

const matsFields: CraftMaterialField<ParadoxSkillJadeMaterial>[] =
  PARADOX_SKILL_JADE_TYPES.map(({ value, label }) => ({
    dataIndex: value,
    label,
    shortLabel: "(frag)",
  }));

const NOTES = [
  "+1 to +10 is always 100% and only costs Paradox Fragments (no gold).",
  "+11 to +20 uses the same success rate & cost as other classes' Skill Dragon Jades (see the Skill Jade tab).",
  "Bought from Future Regenerator Shawei Sv3 - Paradox Shop - Dragon Jade tab for 1 Paradox Stone each.",
  "Can't be traded or disassembled. On Paradox Warrior the skill animation doesn't change, only ATK increases.",
  "Skills: Dreamy - Trinity Attack, Blood Moon - Phasing Shift, Verdure - Dragon Buster, Dimensional - Void Slash, Otherworldly - Horizon Cleave.",
];

const ParadoxSkillJadeContent = () => {
  const [jadeType, setJadeType] = useState<ParadoxSkillJadeType>("dmv");
  const [from, setFrom] = useState<number>(0);
  const [to, setTo] = useState<number>(10);
  const [includeBuy, setIncludeBuy] = useState(false);

  const range = useMemo((): [number, number] => [from, to], [from, to]);
  const invalid = from >= to;

  const reduceSlice = useCallback(
    (acc: MatsList, slice: ParadoxSkillJadeMaterial[]): MatsList => ({
      ...acc,
      [PARADOX_FRAGMENT]:
        acc[PARADOX_FRAGMENT] +
        slice.reduce((sum, step) => sum + step[jadeType], 0),
    }),
    [jadeType]
  );

  const ctx = useMemo(() => ({ includeBuy }), [includeBuy]);
  const finalize = useCallback(
    (acc: MatsList, { includeBuy: buy }: { includeBuy: boolean }) =>
      buy ? { ...acc, [PARADOX_STONE]: PARADOX_SKILL_JADE_PRICE_STONE } : acc,
    []
  );

  const mats = useRangeAccumulator(
    range,
    invalid,
    ParadoxSkillJadeMaterialTable,
    EMPTY_MATS,
    reduceSlice,
    ctx,
    finalize
  );

  const matsContent = useMemo(
    () => (
      <MatsReferenceTables
        defaultActiveKey={["note", "fragment"]}
        entries={[
          {
            key: "note",
            label: "Note",
            content: (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {NOTES.map((note) => (
                  <Text key={note}>* {note}</Text>
                ))}
              </div>
            ),
          },
          {
            key: "fragment",
            label: "Paradox Fragment per level (+1 to +10)",
            dataSource: ParadoxSkillJadeMaterialTable,
            fields: matsFields,
          },
        ]}
      />
    ),
    []
  );

  const getCalculator = () => (
    <RangeCalculatorPanel
      rangeSelect={{
        from,
        to,
        onFromChange: setFrom,
        onToChange: setTo,
        max: ParadoxSkillJadeMaterialTable.length,
      }}
      invalid={invalid}
      selects={[
        {
          key: "jadeType",
          label: "Jade",
          value: jadeType,
          options: PARADOX_SKILL_JADE_TYPES,
          onChange: (value) => setJadeType(value as ParadoxSkillJadeType),
          width: 230,
        },
      ]}
      toggles={[
        {
          key: "includeBuy",
          label: "Include buying the jade",
          tooltip: "Adds the 1 Paradox Stone shop price",
          checked: includeBuy,
          onChange: setIncludeBuy,
        },
      ]}
      mats={{ data: mats, hideZero: true }}
    />
  );

  const items: CollapseProps["items"] = [
    { key: "1", label: "Mats", children: matsContent },
    { key: "2", label: "Calculate", children: getCalculator() },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default ParadoxSkillJadeContent;
