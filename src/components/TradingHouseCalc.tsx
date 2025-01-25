import { Card, Divider, InputNumber, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
const { Text } = Typography;

interface CalcData {
  name: string;
  amt: number;
}
interface CalcDataMapped extends CalcData {
  partialHave: number;
  price: number;
}

interface TradingHouseCalcProps {
  data: CalcData[];
  additionalTotal?: number;
}

const TradingHouseCalc = ({
  data,
  additionalTotal = 0,
}: TradingHouseCalcProps) => {
  const [dt, setDt] = useState<CalcDataMapped[]>([]);

  useEffect(() => {
    setDt(
      data.map((it) => {
        const found = dt.find((i) => i.name === it.name);
        return {
          ...it,
          price: found?.price ?? 0,
          partialHave: found?.partialHave ?? 0,
        };
      })
    );
  }, [data]);

  const updateDt = (
    val: number | null,
    name: string,
    key: "price" | "partial"
  ) => {
    const tempDt = dt.map((item) => {
      if (item.name !== name) {
        return item;
      }

      return {
        ...item,
        ...(key === "price" ? { price: val ?? 0 } : { partialHave: val ?? 0 }),
      };
    });
    setDt(tempDt);
  };

  const totalGold = useMemo(() => {
    const temp = dt.reduce(
      (sum, a) => sum + (a.amt - a.partialHave) * a.price,
      0
    );
    return temp + additionalTotal;
  }, [dt, additionalTotal]);

  return (
    <div>
      <Divider orientation="left">Buy from Trading House</Divider>
      {dt.map((it) => (
        <div>
          <Card
            size="small"
            style={{ marginTop: 4, marginLeft: 8, marginRight: 8 }}
          >
            <div style={{ marginBottom: 4 }}>
              <Text>{it.name}:</Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Divider type="vertical" />
              <Text>
                {it.amt} -{" "}
                <InputNumber
                  min={0}
                  max={it.amt}
                  value={it.partialHave}
                  onChange={(val) => {
                    updateDt(val, it.name, "partial");
                  }}
                  size="middle"
                  style={{ width: 120 }}
                />
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Divider type="vertical" />
              <Text>
                x{" "}
                <InputNumber
                  min={0}
                  value={it.price}
                  onChange={(val) => {
                    updateDt(val, it.name, "price");
                  }}
                  size="middle"
                  style={{ width: 120 }}
                />
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Divider type="vertical" />
              <Divider type="vertical" />
              <Text italic>
                = {((it.amt - it.partialHave) * it.price).toLocaleString()}
              </Text>
            </div>
          </Card>
        </div>
      ))}
      <div style={{ marginBottom: 4 }}>
        <Divider type="vertical" />
        <Text italic>Total Gold need: {totalGold.toLocaleString()}</Text>
      </div>
    </div>
  );
};

export default TradingHouseCalc;
