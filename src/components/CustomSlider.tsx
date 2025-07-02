import { Slider } from "antd";
import { SliderMarks } from "antd/es/slider";
import React, { useState } from "react";

interface CustomSliderProps {
  id?: string;
  value?: [number, number];
  onChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  mark?: SliderMarks;
}

const CustomSlider: React.FC<CustomSliderProps> = (props) => {
  const {
    id,
    value,
    onChange,
    min = 0,
    max = 20,
    mark = {
      0: "+0",
      5: "+5",
      10: "+10",
      15: "+15",
      20: "+20",
    },
  } = props;
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
        min={min}
        max={max}
        range
        marks={mark}
      />
    </span>
  );
};

export default CustomSlider;
