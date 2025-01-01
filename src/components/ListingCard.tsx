import { Card, Divider, Space, Typography } from "antd";
const { Text } = Typography;

interface ItemList {
  title: string;
  suffix?: string;
  value?: string | number;
}
interface ListingCardProps {
  title?: string;
  data: Array<ItemList>;
}

const ListingCard = ({ title, data }: ListingCardProps) => {
  const getStatRender = ({ title, suffix, value }: ItemList, idx: number) => {
    if (!value) {
      return;
    }
    return (
      <Text key={`item-${title}-${idx}`}>{`${title} +${value}${
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
