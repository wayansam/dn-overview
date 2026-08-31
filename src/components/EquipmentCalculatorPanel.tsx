import { Checkbox, Divider, Select, Tooltip } from "antd";
import CalcCard from "./CalcCard";
import EquipmentTable, {
  EquipmentTableCalculator,
  ExtraColumnConfig,
} from "./EquipmentTable";
import FlagAlert from "./FlagAlert";
import ListingCard, { ItemList } from "./ListingCard";
import MaterialListTable from "./MaterialListTable";
import RangeFromTo from "./RangeFromTo";
import TradingHouseCalc, { CalcData } from "./TradingHouseCalc";
import TypeFilterToggle, { TypeFilterOption } from "./TypeFilterToggle";
import { CommonItemStats } from "../interface/ItemStat.interface";
import { getStatDif } from "../utils/common.util";

export interface EquipmentModuleFlag {
  show: boolean;
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export interface EquipmentModuleToggle {
  key: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
}

export interface EquipmentModuleRange {
  from: number;
  to: number;
  onFromChange: (value: number) => void;
  onToChange: (value: number) => void;
  max: number;
  customLabeling?: (item: number) => string;
}

// A Settings dropdown (e.g. Ancient's old/new craft-table version, SpunGold's
// craft tier) — the non-boolean sibling of `toggles`. Value/onChange are
// typed loosely (string | number) so a screen can mix a string-valued select
// (Ancient's version) with a number-valued one (SpunGold's craft tier) in
// the same `selects` array.
export interface EquipmentModuleSelect {
  key: string;
  label: React.ReactNode;
  value: string | number;
  options: Array<{ label: string; value: string | number }>;
  onChange: (value: string | number) => void;
  width?: number;
}

// The "Calculate" tab every equipment screen builds: an editable
// EquipmentTable next to a Settings card (range/type-filter/toggles/mats)
// plus whichever of stats/rateSummary/tradingHouse the equipment actually
// has. Each section is optional and renders only when its data is passed in
// — a new equipment type that has no rate summary or trading house simply
// omits those props, no extra CalcCard or computation happens for it. The
// calculation itself (useInvalidRange, useEquipmentAccumulator,
// useEquipmentStatDiff, etc.) stays in the screen, since the toggle state
// and per-equipment reduceRow logic genuinely differ per screen — this
// component only owns the repeated layout around that data.
interface EquipmentCalculatorPanelProps<T extends EquipmentTableCalculator> {
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: React.Dispatch<React.SetStateAction<React.Key[]>>;
  dataSource: T[];
  setDataSource: React.Dispatch<React.SetStateAction<T[]>>;
  customLabeling?: (item: number) => string;
  extraColumns?: ExtraColumnConfig<T>[];

  invalid: boolean;
  invalidMessage?: string;
  flags?: EquipmentModuleFlag[];
  typeFilter?: TypeFilterOption[];
  range?: EquipmentModuleRange;
  toggles?: EquipmentModuleToggle[];
  selects?: EquipmentModuleSelect[];

  mats?: { data: object; hideZero?: boolean; footer?: string };
  stats?: { statDif: CommonItemStats };
  rateSummary?: { items: ItemList[] };
  tradingHouse?: {
    data: CalcData[];
    additionalTotal?: number;
    customTitle?: string;
  };
  // Escape hatch for one-off sections that don't fit the shapes above (e.g.
  // VIPAcc's enhancement-level stat chart). Rendered last, wrapped in the
  // same CalcCard every other section gets, so the caller only supplies the
  // inner content.
  extra?: React.ReactNode;
  // A "what should I upgrade next" tool (currently Conversion's suggestion
  // engine) — kept separate from `extra` so it always gets its own card
  // instead of being stacked under whatever else `extra` renders.
  suggestion?: React.ReactNode;
}

const EquipmentCalculatorPanel = <T extends EquipmentTableCalculator>({
  selectedRowKeys,
  setSelectedRowKeys,
  dataSource,
  setDataSource,
  customLabeling,
  extraColumns,
  invalid,
  invalidMessage = "From cannot exceed the To option",
  flags = [],
  typeFilter,
  range,
  toggles = [],
  selects = [],
  mats,
  stats,
  rateSummary,
  tradingHouse,
  extra,
  suggestion,
}: EquipmentCalculatorPanelProps<T>) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <CalcCard>
        <EquipmentTable
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          dataSource={dataSource}
          setDataSource={setDataSource}
          customLabeling={customLabeling}
          extraColumns={extraColumns}
        />
      </CalcCard>
      <CalcCard>
        <FlagAlert show={invalid} message={invalidMessage} type="error" />
        {flags.map((flag, idx) => (
          <FlagAlert key={`extra-flag-${idx}`} {...flag} />
        ))}
        {(typeFilter || range || selects.length > 0 || toggles.length > 0) && (
          <Divider orientation="left">Settings</Divider>
        )}
        {typeFilter && (
          <TypeFilterToggle
            selectedRowKeys={selectedRowKeys}
            onChange={setSelectedRowKeys}
            options={typeFilter}
          />
        )}
        {range && (
          <RangeFromTo
            from={range.from}
            to={range.to}
            onFromChange={range.onFromChange}
            onToChange={range.onToChange}
            max={range.max}
            customLabeling={range.customLabeling}
          />
        )}
        {selects.map((sel) => (
          <div key={sel.key} style={{ marginBottom: 4 }}>
            {sel.label}
            <Divider type="vertical" />
            <Select
              defaultValue={sel.value}
              style={{ width: sel.width ?? 120 }}
              onChange={sel.onChange}
              options={sel.options}
            />
          </div>
        ))}
        {toggles.map((toggle) => (
          <div key={toggle.key} style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={toggle.checked}
              onChange={(e) => toggle.onChange(e.target.checked)}
            >
              {toggle.tooltip ? (
                <Tooltip
                  title={toggle.tooltip}
                  trigger="hover"
                  color="blue"
                  placement="right"
                >
                  {toggle.label}
                </Tooltip>
              ) : (
                toggle.label
              )}
            </Checkbox>
          </div>
        ))}
        {mats && (
          <MaterialListTable
            data={mats.data}
            hideZero={mats.hideZero}
            footer={mats.footer}
          />
        )}
      </CalcCard>
      {rateSummary && (
        <CalcCard>
          <ListingCard keyId="extra-info" title="Extra Info" data={rateSummary.items} />
        </CalcCard>
      )}
      {stats && (
        <CalcCard>
          <ListingCard title="Status Increase" data={getStatDif(stats.statDif)} />
        </CalcCard>
      )}
      {tradingHouse && (
        <CalcCard>
          <TradingHouseCalc
            customTitle={tradingHouse.customTitle}
            data={tradingHouse.data}
            additionalTotal={tradingHouse.additionalTotal}
          />
        </CalcCard>
      )}
      {extra && <CalcCard>{extra}</CalcCard>}
      {suggestion && <CalcCard>{suggestion}</CalcCard>}
    </div>
  );
};

export default EquipmentCalculatorPanel;
