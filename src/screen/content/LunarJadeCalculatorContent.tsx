import { theme, Collapse } from "antd";
import React from "react";
import type { CollapseProps } from 'antd';

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const getCalculator = () => {
    return <div>
      <p>{text}</p>
      <p>{text}</p>
    </div>
  }

  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;


  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Craft Reference',
      children: <p>{text}</p>,
    },
    {
      key: '2',
      label: 'Calculate',
      children: getCalculator(),
    },
  ];

  const onChange = (key: string | string[]) => {
    console.log(key);
  };



  return (
    <div
      style={{
        // textAlign: "center",
      }}
    >
      <Collapse items={items} size="small"
        defaultActiveKey={['2']} onChange={onChange} />;
      {/* <p>long content</p>
      {
        // indicates very long content
        Array.from({ length: 100 }, (_, index) => (
          <React.Fragment key={index}>
            {index % 20 === 0 && index ? "more" : "..."}
            <br />
          </React.Fragment>
        ))
      } */}
    </div>
  );
};

export default LunarJadeCalculatorContent;
