import { Line } from "@ant-design/charts";
import { Card, Divider, Grid, Select } from "antd";
import { useEffect, useMemo } from "react";
import { EQUIPMENT } from "../constants/InGame.constants";
import { useAppSelector } from "../hooks";
import { getAllStatDesc } from "../utils/common.util";

const { useBreakpoint } = Grid;

export const CHARTS_OPT = {
  TOTAL: "total",
  STEP: "step",
};

const previewOpt = [
  { label: "by Total Change", value: CHARTS_OPT.TOTAL },
  { label: "by Step Difference", value: CHARTS_OPT.STEP },
];

export interface ChartItem {
  enhance: string;
  total: number;
  step: number;
  type: EQUIPMENT;
}
interface ChartsCardProps {
  title?: string;
  keyId?: string;
  data: Array<ChartItem>;
  statVal?: { label: string; value: string };
  setStatVal?: (s?: { label: string; value: string }) => void;
  statPrev?: { label: string; value: string };
  setStatPrev?: (s?: { label: string; value: string }) => void;
}

const ChartsCard = ({
  title,
  keyId,
  data,
  statVal,
  setStatVal,
  statPrev,
  setStatPrev,
}: ChartsCardProps) => {
  const screens = useBreakpoint();
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);

  const config = useMemo(
    () => ({
      data,
      height: 500,
      xField: "enhance",
      yField:
        statPrev?.value === CHARTS_OPT.STEP
          ? CHARTS_OPT.STEP
          : CHARTS_OPT.TOTAL,
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
    [data, isDarkMode, statPrev]
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
    setStatPrev?.(previewOpt[0]);
  }, []);
  return (
    <div key={keyId} style={{ minWidth: screens?.xs ? 200 : 400 }}>
      {title && (
        <Divider key={`title-${keyId}`} orientation="left">
          {title}
        </Divider>
      )}

      {/* Selectors — label left, select right */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>Stat</span>
          <Select
            value={statVal?.label}
            style={{ width: 200 }}
            onChange={(val) => {
              const found = allDesc.find((it) => it.value === val);
              setStatVal?.(found);
            }}
            options={allDesc}
            size="small"
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>Preview</span>
          <Select
            value={statPrev?.label}
            style={{ width: 200 }}
            onChange={(val) => {
              const found = previewOpt.find((it) => it.value === val);
              setStatPrev?.(found);
            }}
            options={previewOpt}
            size="small"
          />
        </div>
      </div>

      <Card key={`card-${keyId}`} size="small">
        <Line {...config} />
      </Card>
    </div>
  );
};

export default ChartsCard;
