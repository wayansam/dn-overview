import { SwapOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { TAB_KEY } from "../../../constants/Common.constants";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import { CommonItemStats } from "../../../interface/ItemStat.interface";
import { getStatDesc } from "../../../utils/common.util";
import { getResource } from "../../../utils/resource.util";

const { Text } = Typography;

// Equipment lines that expose per-level stat tables through getResource.
const SOURCE_OPTIONS = [
  TAB_KEY.eqGoldDragon,
  TAB_KEY.eqBoneDragon,
  TAB_KEY.eqSpunGold,
  TAB_KEY.eqNamedEOD,
  TAB_KEY.eqVIPAcc,
  TAB_KEY.miscConversion,
].map((source) => ({ value: source, label: source }));

type StatKey = Exclude<keyof CommonItemStats, "encLevel">;

// Display order, matching getStatDif.
const STAT_KEYS: StatKey[] = [
  "phyMagAtk",
  "phyMagAtkMin",
  "phyMagAtkMax",
  "phyMagAtkPercent",
  "attAtkPercent",
  "crt",
  "crtPercent",
  "cdm",
  "fd",
  "str",
  "agi",
  "int",
  "vit",
  "strPercent",
  "agiPercent",
  "intPercent",
  "vitPercent",
  "def",
  "defPercent",
  "magdef",
  "magdefPercent",
  "hp",
  "hpPercent",
  "moveSpeedPercent",
  "moveSpeedPercentTown",
];

interface CompareSelection {
  source: string;
  slot: EQUIPMENT;
  level: number; // index into the stat table
}

interface CompareRow {
  key: StatKey;
  label: string;
  isPercent: boolean;
  a?: number;
  b?: number;
  diff: number;
  diffPercent?: number;
}

// A slot is offered only when the line has a stat table for it. Some slots
// share a table (Ring 1 / Ring 2), so identical tables are listed once.
const getSlots = (source: string): EQUIPMENT[] => {
  const seen = new Set<CommonItemStats[]>();
  return Object.values(EQUIPMENT).filter((slot) => {
    const table = getResource(source, slot);
    if (table.length === 0 || seen.has(table)) {
      return false;
    }
    seen.add(table);
    return true;
  });
};

const getSlotLabel = (slot: EQUIPMENT) =>
  slot === EQUIPMENT.RING1 ? "Ring" : slot;

const getLevelLabel = (encLevel: string) =>
  /^\d+$/.test(encLevel) ? `+${encLevel}` : encLevel;

const round2 = (value: number) => Math.round(value * 100) / 100;

const formatNumber = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 2 });

const formatStat = (value: number | undefined, isPercent: boolean) =>
  value === undefined ? "-" : `${formatNumber(value)}${isPercent ? "%" : ""}`;

const getSelectionLabel = ({ source, slot, level }: CompareSelection) => {
  const row = getResource(source, slot)[level];
  return `${source} ${getSlotLabel(slot)} ${row ? getLevelLabel(row.encLevel) : ""}`;
};

// Keep slot/level valid after the line or slot changes.
const normalizeSelection = (next: CompareSelection): CompareSelection => {
  const slots = getSlots(next.source);
  const slot = slots.includes(next.slot) ? next.slot : slots[0];
  const maxLevel = Math.max(getResource(next.source, slot).length - 1, 0);
  return { ...next, slot, level: Math.min(next.level, maxLevel) };
};

interface EquipmentPickerProps {
  title: string;
  value: CompareSelection;
  onChange: (value: CompareSelection) => void;
}

const EquipmentPicker = ({ title, value, onChange }: EquipmentPickerProps) => {
  const slotOptions = useMemo(
    () =>
      getSlots(value.source).map((slot) => ({
        value: slot,
        label: getSlotLabel(slot),
      })),
    [value.source]
  );

  const levelOptions = useMemo(
    () =>
      getResource(value.source, value.slot).map((row, idx) => ({
        value: idx,
        label: getLevelLabel(row.encLevel),
      })),
    [value.source, value.slot]
  );

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  };
  const labelStyle: React.CSSProperties = { width: 80, flexShrink: 0 };

  return (
    <Card
      size="small"
      title={title}
      style={{ flex: "1 1 260px", maxWidth: 420 }}
    >
      <div style={fieldStyle}>
        <Text style={labelStyle}>Equipment</Text>
        <Select
          style={{ flex: 1, minWidth: 0 }}
          value={value.source}
          options={SOURCE_OPTIONS}
          onChange={(source) =>
            onChange(normalizeSelection({ ...value, source }))
          }
        />
      </div>
      <div style={fieldStyle}>
        <Text style={labelStyle}>Slot</Text>
        <Select
          style={{ flex: 1, minWidth: 0 }}
          value={value.slot}
          options={slotOptions}
          onChange={(slot) => onChange(normalizeSelection({ ...value, slot }))}
        />
      </div>
      <div style={{ ...fieldStyle, marginBottom: 0 }}>
        <Text style={labelStyle}>Level</Text>
        <Select
          style={{ flex: 1, minWidth: 0 }}
          value={value.level}
          options={levelOptions}
          onChange={(level) => onChange({ ...value, level })}
        />
      </div>
    </Card>
  );
};

const CompareEqContent = () => {
  const [selectionA, setSelectionA] = useState<CompareSelection>({
    source: TAB_KEY.eqBoneDragon,
    slot: EQUIPMENT.HELM,
    level: 0,
  });
  const [selectionB, setSelectionB] = useState<CompareSelection>({
    source: TAB_KEY.eqGoldDragon,
    slot: EQUIPMENT.HELM,
    level: 0,
  });

  const statA = getResource(selectionA.source, selectionA.slot)[
    selectionA.level
  ];
  const statB = getResource(selectionB.source, selectionB.slot)[
    selectionB.level
  ];

  const rows: CompareRow[] = useMemo(
    () =>
      STAT_KEYS.filter((key) => !!statA?.[key] || !!statB?.[key]).map(
        (key) => {
          const a = statA?.[key];
          const b = statB?.[key];
          const isPercent = key.toLowerCase().includes("percent");
          const diff = round2((b ?? 0) - (a ?? 0));
          return {
            key,
            label: getStatDesc(key).long,
            isPercent,
            a,
            b,
            diff,
            // Relative change only makes sense for flat stats with a base.
            diffPercent: !isPercent && a ? round2((diff / Math.abs(a)) * 100) : undefined,
          };
        }
      ),
    [statA, statB]
  );

  const columns: ColumnsType<CompareRow> = [
    {
      title: "Stat",
      dataIndex: "label",
    },
    {
      title: `A: ${getSelectionLabel(selectionA)}`,
      align: "right",
      render: (_, { a, isPercent }) => formatStat(a, isPercent),
    },
    {
      title: `B: ${getSelectionLabel(selectionB)}`,
      align: "right",
      render: (_, { b, isPercent }) => formatStat(b, isPercent),
    },
    {
      title: "Difference (B − A)",
      align: "right",
      render: (_, { diff, diffPercent, isPercent }) => {
        if (diff === 0) {
          return <Text type="secondary">0</Text>;
        }
        const sign = diff > 0 ? "+" : "";
        return (
          <Text type={diff > 0 ? "success" : "danger"}>
            {`${sign}${formatNumber(diff)}${isPercent ? "%" : ""}`}
            {diffPercent !== undefined && ` (${sign}${formatNumber(diffPercent)}%)`}
          </Text>
        );
      },
    },
  ];

  const swap = () => {
    setSelectionA(selectionB);
    setSelectionB(selectionA);
  };

  return (
    <div>
      <Divider orientation="left">Select Equipment</Divider>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <EquipmentPicker
          title="Equipment A"
          value={selectionA}
          onChange={setSelectionA}
        />
        <Button icon={<SwapOutlined />} onClick={swap}>
          Swap
        </Button>
        <EquipmentPicker
          title="Equipment B"
          value={selectionB}
          onChange={setSelectionB}
        />
      </div>

      <Divider orientation="left">Stats</Divider>
      <div style={{ overflowX: "auto" }}>
        <Table
          size="small"
          rowKey="key"
          dataSource={rows}
          columns={columns}
          pagination={false}
          bordered
        />
      </div>
      <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
        Base stats per enhancement level only, random add-on stats are not
        included.
      </Text>
    </div>
  );
};

export default CompareEqContent;
