import { Card, Divider, Space, Typography } from "antd";
const { Text } = Typography;

interface ItemList {
  title: string;
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
    { title, suffix, value, format }: ItemList,
    idx: number
  ) => {
    if (!value) {
      return;
    }
    const tempValue = format ? value.toLocaleString() : value;
    return (
      <Text key={`item-${title}-${idx}`}>{`${title} +${tempValue}${
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
