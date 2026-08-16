import { Divider, Tag } from "antd";

const { CheckableTag } = Tag;

export interface TypeFilterOption {
  label: string;
  keys: React.Key[];
}

interface TypeFilterToggleProps {
  label?: string;
  options: TypeFilterOption[];
  selectedRowKeys: React.Key[];
  onChange: (keys: React.Key[]) => void;
}

// The repeated "Spesific Type" group-selection control used by several
// equipment calculators. Each option is a multi-select toggle: its checked
// state is derived from selectedRowKeys (so it stays in sync with individual
// row checkboxes in EquipmentTable), and toggling it adds/removes that
// group's keys from the current selection rather than replacing it.
const TypeFilterToggle: React.FC<TypeFilterToggleProps> = ({
  label = "Spesific Type",
  options,
  selectedRowKeys,
  onChange,
}) => {
  const isActive = (option: TypeFilterOption) =>
    option.keys.length > 0 &&
    option.keys.every((key) => selectedRowKeys.includes(key));

  const toggle = (option: TypeFilterOption, checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...selectedRowKeys, ...option.keys])));
    } else {
      onChange(selectedRowKeys.filter((key) => !option.keys.includes(key)));
    }
  };

  return (
    <div style={{ marginBottom: 4 }}>
      {label}
      <Divider type="vertical" />
      {options.map((option) => (
        <CheckableTag
          key={option.label}
          checked={isActive(option)}
          onChange={(checked) => toggle(option, checked)}
          style={{
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            padding: "0 12px",
            marginInlineEnd: 8,
          }}
        >
          {option.label}
        </CheckableTag>
      ))}
    </div>
  );
};

export default TypeFilterToggle;
