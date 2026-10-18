import { ClockCircleOutlined } from "@ant-design/icons";
import { Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { SERVER_TIME_ZONE } from "../constants/Task.constants";
import { formatCountdown, getNextReset } from "../utils/weeklyReset.util";
const { Text } = Typography;

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: SERVER_TIME_ZONE,
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// "Sat, 18 Oct 2026, 14:05:09"
export const formatServerTime = (date: Date) => formatter.format(date);

// Live server clock, ticking every second.
const ServerTime = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Space size={[12, 0]} wrap>
      <Space size={6} aria-label="Server time">
        <ClockCircleOutlined />
        <Text type="secondary">Server Time (UTC+8):</Text>
        <Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
          {formatServerTime(now)}
        </Text>
      </Space>
      <Text type="secondary" aria-label="Weekly reset">
        Weekly reset in {formatCountdown(getNextReset(now) - now.getTime())}
        <Text type="secondary" style={{ fontSize: 12 }}>
          {" "}
          (Sat 09:00)
        </Text>
      </Text>
    </Space>
  );
};

export default ServerTime;
