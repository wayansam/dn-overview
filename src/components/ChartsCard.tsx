import { Line } from "@ant-design/charts";
import { Card, Divider, Space, Typography } from "antd";
import { EQUIPMENT } from "../constants/InGame.constants";
import { useAppSelector } from "../hooks";

export interface ChartItem {
  enhance: string;
  value: number;
  type: EQUIPMENT;
}
interface ChartsCardProps {
  title?: string;
  keyId?: string;
  data: Array<ChartItem>;
}

const ChartsCard = ({ title, keyId }: ChartsCardProps) => {
  const isDarkMode = useAppSelector((state) => state.UIState.isDarkMode);
  const data = [
    { enhance: "1991", value: 3, type: "A" },
    { enhance: "1991", value: 3, type: "B" },
    { enhance: "1992", value: 6, type: "A" },
    { enhance: "1992", value: 4, type: "B" },
    { enhance: "1993", value: 3.5, type: "B" },
    { enhance: "1994", value: 5, type: "B" },
    { enhance: "1995", value: 4.9, type: "B" },
    { enhance: "1996", value: 6, type: "B" },
    { enhance: "1997", value: 7, type: "B" },
    { enhance: "1998", value: 9, type: "B" },
    { enhance: "1999", value: 13, type: "B" },
  ];
  const config = {
    data,
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
  };
  return (
    <div key={keyId} style={{ minWidth: 400 }}>
      {title && (
        <Divider key={`title-${keyId}`} orientation="left">
          {title}
        </Divider>
      )}
      <Card key={`card-${keyId}`} size="small" style={{ marginTop: 4 }}>
        <Line {...config} />
      </Card>
    </div>
  );
};

export default ChartsCard;
