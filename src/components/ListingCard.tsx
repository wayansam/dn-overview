import { Card, Divider, Space, Typography } from "antd";
const { Text } = Typography;

export interface ItemList {
  title: string;
  isHeader?: boolean;
  suffix?: string;
  value?: string | number;
  format?: boolean;
  children?: React.ReactNode;
  removeWidth?: boolean;
}
interface ListingCardProps {
  title?: string;
  keyId?: string;
  data: Array<ItemList>;
}

const ListingCard = ({ title, keyId, data }: ListingCardProps) => {
  const getStatRender = (
    { title, suffix, value, format, isHeader, children, removeWidth }: ItemList,
    idx: number
  ) => {
    if (isHeader) {
      return (
        <div
          key={`item-container-${title}-${idx}`}
          style={{ width: removeWidth ? "unset" : 400 }}
        >
          <Text strong key={`item-${title}-${idx}`}>
            {title}
          </Text>
          {children}
        </div>
      );
    }
    if (!value) {
      return;
    }
    const sign = typeof value !== "number" || value < 0 ? "" : "+";

    const tempValue = format
      ? value.toLocaleString()
      : typeof value === "number"
      ? value.toFixed(2)
      : value;
    return (
      <div key={`item-container-${title}-${idx}`}>
        <Text key={`item-${title}-${idx}`}>{`${title} ${sign}${tempValue}${
          suffix ?? ""
        }`}</Text>
        {children}
      </div>
    );
  };
  return (
    <div key={keyId}>
      {title && (
        <Divider key={`title-${keyId}`} orientation="left">
          {title}
        </Divider>
      )}
      <Card key={`card-${keyId}`} size="small" style={{ marginTop: 4 }}>
        <Space direction="vertical">
          {data.map((item, idx) => getStatRender(item, idx))}
        </Space>
      </Card>
    </div>
  );
};

export default ListingCard;
