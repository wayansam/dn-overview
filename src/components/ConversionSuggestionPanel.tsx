import { Divider, InputNumber, Select, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";

const { Text } = Typography;

export interface ConversionSuggestionMaterialInput {
  key: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export interface ConversionSuggestionRow {
  key: string;
  equipment: string;
  from: string;
  to: string;
  gainLabel: string;
  materialsLabel: string;
}

// One alternative way to spend (some of) the pool — e.g. "Wing Legend+0→+3
// AND Helm Legend+0→+1" together, with its own combined total. Used both
// for what's affordable right now and, in Plan B, for a set that costs more
// than currently owned but pays off more.
export interface ConversionSuggestionOption {
  key: string;
  label: string;
  totalLabel: string;
  rows: ConversionSuggestionRow[];
}

interface StatOption {
  label: string;
  value: string;
}

interface ConversionSuggestionPanelProps {
  materials: ConversionSuggestionMaterialInput[];
  statOptions: StatOption[];
  priorityStat?: StatOption;
  onPriorityStatChange: (stat?: StatOption) => void;
  options: ConversionSuggestionOption[];
  planB: ConversionSuggestionOption[];
}

const suggestionColumns: ColumnsType<ConversionSuggestionRow> = [
  { title: "Equipment", dataIndex: "equipment" },
  { title: "From", dataIndex: "from" },
  { title: "To", dataIndex: "to" },
  { title: "Gain", dataIndex: "gainLabel" },
  { title: "Materials Used", dataIndex: "materialsLabel" },
];

// A group of option cards, each its own small table with a "Label — total"
// heading above it — the shared rendering for both the affordable table and
// Plan B, since they're the same shape (a ranked list of equipment sets).
const OptionGroups = ({
  options,
  emptyMessage,
}: {
  options: ConversionSuggestionOption[];
  emptyMessage: string;
}) =>
  options.length > 0 ? (
    <>
      {options.map((option) => (
        <div key={option.key} style={{ marginBottom: 16 }}>
          <Text strong>{`${option.label} — ${option.totalLabel}`}</Text>
          <Table
            size="small"
            bordered
            pagination={false}
            dataSource={option.rows}
            rowKey="key"
            columns={suggestionColumns}
            style={{ marginTop: 4 }}
          />
        </div>
      ))}
    </>
  ) : (
    <Text type="secondary">{emptyMessage}</Text>
  );

// "What should I upgrade next" tool for enhancement calculators that spend
// a shared material pool across many equipment pieces. Purely
// presentational — every number is already computed and formatted by the
// screen that owns the material/level shapes (currently Conversion), so
// this component has no dependency on that data model at all.
const ConversionSuggestionPanel = ({
  materials,
  statOptions,
  priorityStat,
  onPriorityStatChange,
  options,
  planB,
}: ConversionSuggestionPanelProps) => (
  <div>
    <Divider orientation="left">Suggestion — Owned Resources</Divider>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {materials.map((mat) => (
        <div
          key={mat.key}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text>{mat.label}</Text>
          <InputNumber
            min={0}
            value={mat.value}
            onChange={(val) => mat.onChange(val ?? 0)}
          />
        </div>
      ))}
    </div>

    <Divider orientation="left">Priority Stat</Divider>
    <Text>
      Reads each equipment's "From" level in the table on the left as what
      you currently have. Pick the stat you want to grow the most.
    </Text>
    <div style={{ marginTop: 8 }}>
      <Select
        style={{ width: 220 }}
        placeholder="Select a stat to prioritize"
        value={priorityStat?.label}
        onChange={(val) => {
          const found = statOptions.find((it) => it.value === val);
          onPriorityStatChange(found);
        }}
        options={statOptions}
      />
    </div>

    {priorityStat && (
      <>
        <Divider orientation="left">
          Recommended Upgrades (within owned resources)
        </Divider>
        <OptionGroups
          options={options}
          emptyMessage="Not enough resources for any single tap yet."
        />

        <Divider orientation="left">
          Plan B — save up for a bigger payoff
        </Divider>
        <Text type="secondary">
          Pending Option 1 in favor of saving up for a set that costs more
          than you currently own but beats Option 1's total.
        </Text>
        <div style={{ marginTop: 8 }}>
          <OptionGroups
            options={planB}
            emptyMessage="Nothing beats Option 1 by saving up right now."
          />
        </div>
      </>
    )}
  </div>
);

export default ConversionSuggestionPanel;
