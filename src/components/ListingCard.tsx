import { Card, Divider, Space, Typography } from "antd";
const { Text } = Typography;

export interface ItemList {
  title: string;
  isHeader?: boolean;
  suffix?: string;
  value?: string | number;
  format?: boolean;
}
interface ListingCardProps {
  title?: string;
  data: Array<ItemList>;
}

const ListingCard = ({ title, data }: ListingCardProps) => {
  const getStatRender = (
    { title, suffix, value, format, isHeader }: ItemList,
    idx: number
  ) => {
    if (isHeader) {
      return (
        <Text strong key={`item-${title}-${idx}`}>
          {title}
        </Text>
      );
    }
    if (!value) {
      return;
    }
    const sign = typeof value !== "number" || value < 0 ? "" : "+";
    const tempValue = format ? value.toLocaleString() : value;
    return (
      <Text key={`item-${title}-${idx}`}>{`${title} ${sign}${tempValue}${
        suffix ?? ""
      }`}</Text>
    );
  };
  return (
    <div>
      {title && <Divider orientation="left">{title}</Divider>}
      <Card size="small" style={{ marginTop: 4 }}>
        <Space direction="vertical">
          {data.map((item, idx) => getStatRender(item, idx))}
        </Space>
      </Card>
    </div>
  );
};

export default ListingCard;
