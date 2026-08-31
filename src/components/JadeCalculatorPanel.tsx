import { Checkbox, Divider, Select, Slider, Tooltip } from "antd";
import { SliderMarks } from "antd/es/slider";
import CalcCard from "./CalcCard";
import {
  EquipmentModuleFlag,
  EquipmentModuleSelect,
  EquipmentModuleToggle,
} from "./EquipmentCalculatorPanel";
import FlagAlert from "./FlagAlert";
import ListingCard, { ItemList } from "./ListingCard";
import MaterialListTable from "./MaterialListTable";
import RangeFromTo from "./RangeFromTo";
import TradingHouseCalc, { CalcData } from "./TradingHouseCalc";
import { CommonItemStats } from "../interface/ItemStat.interface";
import { getStatDif } from "../utils/common.util";

const sliderStyle: React.CSSProperties = {
  display: "inline-block",
  height: 300,
  marginLeft: 20,
  marginRight: 50,
  marginTop: 10,
  marginBottom: 30,
};

// The single-range "Calculate" tab every jade screen builds: an
// enhancement-range picker next to a Settings card (toggles/selects/mats)
// plus whichever of stats/rateSummary/tradingHouse the jade actually has.
// Sibling to EquipmentCalculatorPanel with the same optional-section rule —
// a section renders only when its data is passed in — but for a single
// implicit item instead of a multi-row equipment table, so there's no
// EquipmentTable/type-filter here, and reuses the same toggle/select/flag
// shapes (EquipmentModule*) since those controls aren't equipment-specific.
//
// The range picker itself comes in the two shapes jade screens actually use:
// `rangeSlider` (a vertical two-handle Slider, e.g. Erosion) or `rangeSelect`
// (a From/To Select pair via the same RangeFromTo Equipment screens use,
// e.g. DeeplyVar's Legend/Ancient grade). Exactly one should be passed.
interface JadeCalculatorPanelProps {
  rangeSlider?: {
    value: [number, number];
    onChange: (value: number[]) => void;
    max: number;
    min?: number;
    marks: SliderMarks;
  };
  rangeSelect?: {
    from: number;
    to: number;
    onFromChange: (value: number) => void;
    onToChange: (value: number) => void;
    max: number;
    min?: number;
    customLabeling?: (item: number) => string;
  };

  invalid?: boolean;
  invalidMessage?: string;
  flags?: EquipmentModuleFlag[];
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
  extra?: React.ReactNode;
}

const JadeCalculatorPanel = ({
  rangeSlider,
  rangeSelect,
  invalid = false,
  invalidMessage = "From cannot exceed the To option",
  flags = [],
  toggles = [],
  selects = [],
  mats,
  stats,
  rateSummary,
  tradingHouse,
  extra,
}: JadeCalculatorPanelProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      {rangeSlider && (
        <div style={sliderStyle}>
          <Slider
            vertical
            range
            marks={rangeSlider.marks}
            defaultValue={rangeSlider.value}
            max={rangeSlider.max}
            min={rangeSlider.min ?? 0}
            onChangeComplete={rangeSlider.onChange}
          />
        </div>
      )}
      <CalcCard>
        <FlagAlert show={invalid} message={invalidMessage} type="error" />
        {flags.map((flag, idx) => (
          <FlagAlert key={`extra-flag-${idx}`} {...flag} />
        ))}
        {(rangeSelect || selects.length > 0 || toggles.length > 0) && (
          <Divider orientation="left">Settings</Divider>
        )}
        {rangeSelect && (
          <RangeFromTo
            from={rangeSelect.from}
            to={rangeSelect.to}
            onFromChange={rangeSelect.onFromChange}
            onToChange={rangeSelect.onToChange}
            max={rangeSelect.max}
            min={rangeSelect.min}
            customLabeling={rangeSelect.customLabeling}
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
    </div>
  );
};

export default JadeCalculatorPanel;
