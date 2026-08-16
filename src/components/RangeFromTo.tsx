import { Divider, Select } from "antd";
import { getListOpt } from "./EquipmentTable";

interface RangeFromToProps {
  from: number;
  to: number;
  onFromChange: (value: number) => void;
  onToChange: (value: number) => void;
  min?: number;
  max: number;
  customLabeling?: (item: number) => string;
}

// The repeated "From" / "To" enhancement-range Select pair used by every
// equipment calculator's Settings panel.
const RangeFromTo: React.FC<RangeFromToProps> = ({
  from,
  to,
  onFromChange,
  onToChange,
  min = 0,
  max,
  customLabeling,
}) => {
  const options = getListOpt(min, max, customLabeling);
  return (
    <>
      <div style={{ marginBottom: 4 }}>
        From
        <Divider type="vertical" />
        <Select
          defaultValue={from}
          style={{ width: 120 }}
          onChange={onFromChange}
          options={options}
        />
      </div>
      <div style={{ marginBottom: 4 }}>
        To
        <Divider type="vertical" />
        <Select
          defaultValue={to}
          style={{ width: 120 }}
          onChange={onToChange}
          options={options}
        />
      </div>
    </>
  );
};

export default RangeFromTo;
