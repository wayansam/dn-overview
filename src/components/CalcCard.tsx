const CalcCard: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{ marginRight: 10, marginBottom: 10, overflowX: "auto", ...style }}
  >
    {children}
  </div>
);

export default CalcCard;
