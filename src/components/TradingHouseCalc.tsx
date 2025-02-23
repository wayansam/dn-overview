import { Card, Divider, InputNumber, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
const { Text } = Typography;

interface CalcData {
  name: string;
  amt?: number;
  useCustomAmt?: boolean;
}
interface CalcDataMapped extends CalcData {
  partialHave: number;
  price: number;
  customAmt: number;
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
    setDt((prevDt) =>
      data.map((it) => {
        const found = prevDt.find((i) => i.name === it.name);
        return {
          ...it,
          price: found?.price ?? 0,
          partialHave: Math.min(found?.partialHave ?? 0, found?.amt ?? 0),
          customAmt: found?.customAmt ?? 0,
        };
      })
    );
  }, [data]);

  const updateDt = (
    val: number | null,
    name: string,
    key: keyof CalcDataMapped
  ) => {
    const tempDt = dt.map((item) => {
      if (item.name !== name) {
        return item;
      }

      return {
        ...item,
        [key]: val ?? 0,
      };
    });
    setDt(tempDt);
  };

  const totalGold = useMemo(() => {
    const temp = dt.reduce(
      (sum, a) => sum + ((a.amt ?? 0) - a.partialHave) * a.price,
      0
    );
    return temp + additionalTotal;
  }, [dt, additionalTotal]);

  return (
    <div>
      <Divider orientation="left">Buy from Trading House</Divider>
      {dt
        .filter((item) => item.amt && item.amt !== 0)
        .map((it) => (
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
                {it.useCustomAmt ? (
                  <Text>
                    <InputNumber
                      min={0}
                      value={it.customAmt}
                      onChange={(val) => {
                        updateDt(val, it.name, "customAmt");
                      }}
                      size="middle"
                      style={{ width: 120 }}
                    />
                  </Text>
                ) : (
                  <Text>
                    {it.amt} -{" "}
                    <InputNumber
                      min={0}
                      max={it.amt}
                      value={it.partialHave}
                      onChange={(val) => {
                        updateDt(val, it.name, "partialHave");
                      }}
                      size="middle"
                      style={{ width: 120 }}
                    />
                  </Text>
                )}
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
                  ={" "}
                  {(
                    (it.useCustomAmt
                      ? it.customAmt
                      : (it.amt ?? 0) - it.partialHave) * it.price
                  ).toLocaleString()}
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
