import { Line } from "@ant-design/charts";
import { Card, Divider, Select } from "antd";
import { useEffect, useMemo } from "react";
import { EQUIPMENT } from "../constants/InGame.constants";
import { useAppSelector } from "../hooks";
import { getAllStatDesc } from "../utils/common.util";

export interface ChartItem {
  enhance: string;
  value: number;
  type: EQUIPMENT;
}
interface ChartsCardProps {
  title?: string;
  keyId?: string;
  data: Array<ChartItem>;
  statVal?: { label: string; value: string };
  setStatVal?: (s?: { label: string; value: string }) => void;
}

const ChartsCard = ({
  title,
  keyId,
  data,
  statVal,
  setStatVal,
}: ChartsCardProps) => {
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  const config = useMemo(
    () => ({
      data,
      height: 500,
      xField: "enhance",
      yField: "value",
      point: {
        shapeField: "square",
        sizeField: 4,
      },
      interaction: {
        tooltip: {
          marker: false,
        },
      },
      style: {
        lineWidth: 2,
      },
      theme: { type: isDarkMode ? "dark" : "light" },
      colorField: "type",
    }),
    [data]
  );

  const allDesc = Object.entries(getAllStatDesc())
    .map(([key, value]) => ({
      label: value.long,
      value: key,
    }))
    .filter((it) => it.label !== "-");

  useEffect(() => {
    if (allDesc.length > 0) {
      const stat = allDesc[0];
      setStatVal?.(stat);
    }
  }, []);
  return (
    <div key={keyId} style={{ minWidth: 400 }}>
      {title && (
        <Divider key={`title-${keyId}`} orientation="left">
          {title}
        </Divider>
      )}
      <div style={{ marginBottom: 4 }}>
        Stat:
        <Divider type="vertical" />
        <Select
          value={statVal?.label}
          style={{ width: 200 }}
          onChange={(val) => {
            const found = allDesc.find((it) => it.value === val);
            setStatVal?.(found);
          }}
          options={allDesc}
        />
      </div>
      <Card key={`card-${keyId}`} size="small" style={{ marginTop: 4 }}>
        <Line {...config} />
      </Card>
    </div>
  );
};

export default ChartsCard;
