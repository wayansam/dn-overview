import { Divider, InputNumber, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
const { Text } = Typography;

interface CalcData {
  name: string;
  amt: number;
}
interface CalcDataMapped extends CalcData {
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
    setDt(data.map((it) => ({ ...it, price: 0 })));
  }, [data]);

  const updateDt = (val: number | null, name: string) => {
    const tempDt = dt.map((item) => {
      if (item.name !== name) {
        return item;
      }

      return { ...item, price: val ?? 0 };
    });
    setDt(tempDt);
  };

  const totalGold = useMemo(() => {
    const temp = dt.reduce((sum, a) => sum + a.amt * a.price, 0);
    return temp + additionalTotal;
  }, [dt, additionalTotal]);

  return (
    <div>
      <Divider orientation="left">Buy from Trading House</Divider>
      {dt.map((it) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Text>
              {it.name}: {it.amt} x{" "}
              <InputNumber
                min={0}
                defaultValue={it.price}
                onChange={(val) => {
                  updateDt(val, it.name);
                }}
                size="middle"
                style={{ width: 120 }}
              />
            </Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Divider type="vertical" />
            <Text italic>= {(it.amt * it.price).toLocaleString()}</Text>
          </div>
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
