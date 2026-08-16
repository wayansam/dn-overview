import { Alert } from "antd";

interface FlagAlertProps {
  show: boolean;
  message: string;
  type: "error" | "warning" | "info" | "success";
}

// The repeated "{flag && <Alert banner .../>}" conditional warning used
// throughout the equipment calculators (invalid range, enhancement risk
// thresholds, etc).
const FlagAlert: React.FC<FlagAlertProps> = ({ show, message, type }) =>
  show ? (
    <div>
      <Alert banner message={message} type={type} />
    </div>
  ) : null;

export default FlagAlert;
