import { Slider } from "antd";
import React, { useState } from "react";

interface CustomSliderProps {
  id?: string;
  value?: [number, number];
  onChange?: (value: number[]) => void;
}

const CustomSlider: React.FC<CustomSliderProps> = (props) => {
  const { id, value, onChange } = props;
  const [localRange, setLocalRange] = useState<number[]>(value ?? [0, 0]);

  const triggerChange = (changedValue: { range?: number[] }) => {
    onChange?.(changedValue?.range || localRange);
  };

  const onChangeComplete = (value: number[]) => {
    if (!("range" in value)) {
      setLocalRange(value);
    }
    triggerChange({ range: value });
  };

  return (
    <span id={id}>
      <Slider
        onChangeComplete={onChangeComplete}
        style={{ marginRight: 20 }}
        defaultValue={localRange}
        min={0}
        max={20}
        range
        marks={{
          0: "+0",
          5: "+5",
          10: "+10",
          15: "+15",
          20: "+20",
        }}
      />
    </span>
  );
};

export default CustomSlider;
