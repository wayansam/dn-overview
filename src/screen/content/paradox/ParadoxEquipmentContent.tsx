import { Collapse, CollapseProps, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CraftMaterialField } from "../../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import MatsReferenceTables from "../../../components/MatsReferenceTables";
import StatReferenceTables from "../../../components/StatReferenceTables";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
} from "../../../hooks/useEquipmentCalculator";
import {
  dataParadoxCalculator,
  getParadoxMaterialTable,
  getParadoxPositionLabel,
  getParadoxPositionStats,
  PARADOX_MAX_POSITION,
  ParadoxAccessoryMaterialTable,
  ParadoxArmorMaterialTable,
  ParadoxEarringStats,
  ParadoxEnhanceMaterial,
  ParadoxGlovesStats,
  ParadoxHelmStats,
  ParadoxLowerStats,
  ParadoxMainStats,
  ParadoxNecklaceStats,
  ParadoxRingStats,
  ParadoxSecondStats,
  ParadoxShoesStats,
  ParadoxSkillAddOn,
  ParadoxSkillAddOnTable,
  ParadoxUpperStats,
  ParadoxWeaponMaterialTable,
} from "../../../data/paradox/ParadoxEquipmentData";
import {
  PARADOX_FRAGMENT,
  PARADOX_STONE,
} from "../../../data/paradox/ParadoxShopData";
import { CommonEquipmentCalculator } from "../../../interface/Common.interface";
import { columnCommonItemFlag } from "../../../interface/ItemStat.interface";

const { Text } = Typography;

type MatsList = Record<string, number>;

const EMPTY_MATS: MatsList = { [PARADOX_FRAGMENT]: 0, [PARADOX_STONE]: 0 };

const MAX_POSITION = Math.max(...Object.values(PARADOX_MAX_POSITION));

const matsFields: CraftMaterialField<ParadoxEnhanceMaterial>[] = [
  { dataIndex: "paradoxFragment", label: PARADOX_FRAGMENT, shortLabel: "(frag)" },
  { dataIndex: "paradoxStone", label: PARADOX_STONE, shortLabel: "(stone)" },
];

const armorFlags: columnCommonItemFlag = {
  phyMagAtkMinFlag: true,
  phyMagAtkMaxFlag: true,
  phyMagAtkPercentFlag: true,
  attAtkPercentFlag: true,
  crtFlag: true,
  defFlag: true,
  magdefFlag: true,
  hpFlag: true,
  hpPercentFlag: true,
};

const weaponFlags: columnCommonItemFlag = {
  phyMagAtkMinFlag: true,
  phyMagAtkMaxFlag: true,
  phyMagAtkPercentFlag: true,
  attAtkPercentFlag: true,
  crtFlag: true,
  cdmFlag: true,
  fdFlag: true,
};

const accessoryFlags: columnCommonItemFlag = {
  phyMagAtkFlag: true,
  phyMagAtkPercentFlag: true,
  attAtkPercentFlag: true,
  fdFlag: true,
  crtFlag: true,
  cdmFlag: true,
  defFlag: true,
  magdefFlag: true,
  strFlag: true,
  agiFlag: true,
  intFlag: true,
};

const skillAddOnColumns: ColumnsType<ParadoxSkillAddOn> = [
  { title: "Grade", dataIndex: "grade" },
  { title: "Armor", dataIndex: "armor" },
  { title: "Weapon", dataIndex: "weapon" },
];

const NOTES = [
  "Every grade can be enhanced to +10, then evolved into the next grade's +0 with an Upgrade Chip (bought with Paradox Stones).",
  "Unique armor & weapons can't be enhanced yet; Unique accessories go up to +5.",
  "Enhancement & evolution are always 100% and cost no gold.",
  "Buy Normal is the Paradox Shop price of a Normal grade item.",
];

const ParadoxEquipmentContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataParadoxCalculator
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  // Armor/weapon stop at Unique +0, so clamp the shared range per row.
  useEffect(() => {
    setDataSource((prev) =>
      prev.map((item) => ({
        ...item,
        from: Math.min(selectFrom, item.max),
        to: Math.min(selectTo, item.max),
      }))
    );
  }, [selectFrom, selectTo]);

  const invalidEnhanceSteps = useInvalidRange(selectedRowKeys, dataSource);

  const reduceRow = useCallback(
    (acc: MatsList, slice: ParadoxEnhanceMaterial[]): MatsList => {
      const next = { ...acc };
      slice.forEach((step) => {
        next[PARADOX_FRAGMENT] += step.paradoxFragment;
        next[PARADOX_STONE] += step.paradoxStone;
      });
      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidEnhanceSteps,
    getParadoxMaterialTable,
    EMPTY_MATS,
    reduceRow
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidEnhanceSteps,
    getParadoxPositionStats
  );

  const statContent = useMemo(
    () => (
      <StatReferenceTables
        entries={[
          {
            key: "armor",
            label: "Armor",
            tables: [
              { label: EQUIPMENT.HELM, dataSource: ParadoxHelmStats, flags: armorFlags },
              {
                label: `${EQUIPMENT.UPPER} (Final Damage)`,
                dataSource: ParadoxUpperStats,
                flags: { ...armorFlags, fdFlag: true },
              },
              {
                label: `${EQUIPMENT.LOWER} (Critical Damage)`,
                dataSource: ParadoxLowerStats,
                flags: { ...armorFlags, cdmFlag: true },
              },
              { label: EQUIPMENT.GLOVE, dataSource: ParadoxGlovesStats, flags: armorFlags },
              {
                label: `${EQUIPMENT.SHOES} (Movement SPD)`,
                dataSource: ParadoxShoesStats,
                flags: { ...armorFlags, moveSpeedPercentFlag: true },
              },
            ],
          },
          {
            key: "weapon",
            label: "Weapon",
            tables: [
              { label: EQUIPMENT.MAIN_WEAPON, dataSource: ParadoxMainStats, flags: weaponFlags },
              { label: EQUIPMENT.SECOND_WEAPON, dataSource: ParadoxSecondStats, flags: weaponFlags },
            ],
          },
          {
            key: "accessory",
            label: "Accessory",
            tables: [
              { label: EQUIPMENT.NECKLACE, dataSource: ParadoxNecklaceStats, flags: accessoryFlags },
              { label: EQUIPMENT.EARRING, dataSource: ParadoxEarringStats, flags: accessoryFlags },
              {
                label: "Ring",
                dataSource: ParadoxRingStats,
                flags: accessoryFlags,
                footer:
                  "Rare+ set: 2 pieces All Attribute ATK 10%, 4 pieces Physical/Magic ATK 15%",
              },
            ],
          },
        ]}
      />
    ),
    []
  );

  const skillAddOnContent = useMemo(
    () => (
      <div style={{ display: "flex", flexDirection: "column", overflowX: "auto" }}>
        <Text style={{ marginBottom: 8 }}>
          From Magic grade, armor & weapons get fixed skill add-on stats that
          raise the Final Damage of a skill. Reroll them with Paradox Purple
          Energy (enhancement level is kept).
        </Text>
        <Table
          size="small"
          rowKey="grade"
          dataSource={ParadoxSkillAddOnTable}
          columns={skillAddOnColumns}
          pagination={false}
          bordered
          footer={() =>
            "Armor: Class Mastery III / Ultimate / 2nd Specialization / Main / Secondary rune skills. Weapon: Dreamy / Blood Moon / Verdure / Ancient jade skills."
          }
        />
      </div>
    ),
    []
  );

  const matsContent = useMemo(
    () => (
      <MatsReferenceTables
        defaultActiveKey="note"
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
            key: "armor",
            label: "Armor",
            dataSource: ParadoxArmorMaterialTable,
            fields: matsFields,
          },
          {
            key: "weapon",
            label: "Weapon",
            dataSource: ParadoxWeaponMaterialTable,
            fields: matsFields,
          },
          {
            key: "accessory",
            label: "Accessory",
            dataSource: ParadoxAccessoryMaterialTable,
            fields: matsFields,
          },
        ]}
      />
    ),
    []
  );

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      customLabeling={getParadoxPositionLabel}
      invalid={invalidEnhanceSteps}
      flags={[
        {
          show: selectedRowKeys.length > 0,
          type: "info",
          message:
            "Status Increase: grade base stats only",
        },
      ]}
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
        { label: "Accessory", keys: ["8", "9", "10", "11"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: MAX_POSITION,
        customLabeling: getParadoxPositionLabel,
      }}
      mats={{ data: tableResource, hideZero: true }}
      stats={{ statDif }}
    />
  );

  const items: CollapseProps["items"] = [
    { key: "1", label: "Stats", children: statContent },
    { key: "2", label: "Skill Add-on", children: skillAddOnContent },
    { key: "3", label: "Mats", children: matsContent },
    { key: "4", label: "Calculate", children: getCalculator() },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["4"]} />
    </div>
  );
};

export default ParadoxEquipmentContent;
