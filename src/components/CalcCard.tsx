const CalcCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
    {children}
  </div>
);

export default CalcCard;
