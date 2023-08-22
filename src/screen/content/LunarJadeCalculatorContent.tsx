import { theme } from "antd";
import React from "react";

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <div
      style={{
        textAlign: "center",
      }}
    >
      <p>long content</p>
      {
        // indicates very long content
        Array.from({ length: 100 }, (_, index) => (
          <React.Fragment key={index}>
            {index % 20 === 0 && index ? "more" : "..."}
            <br />
          </React.Fragment>
        ))
      }
    </div>
  );
};

export default LunarJadeCalculatorContent;
