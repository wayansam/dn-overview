import { theme, Collapse } from "antd";
import React from "react";
import type { CollapseProps } from 'antd';
import { Accordion, AccordionItem } from "@nextui-org/react";



const LunarJadeCalculatorContent = () => {
  // const {
  //   token: { colorBgContainer },
  // } = theme.useToken();

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

  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";



  return (
    <div
      style={{
        // textAlign: "center",
      }}
    >
      <Collapse items={items} size="small"
        defaultActiveKey={['2']} onChange={onChange} />;

      <Accordion variant="shadow">
        <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1">
          {defaultContent}
        </AccordionItem>
        <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
          {defaultContent}
        </AccordionItem>
        <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">
          {defaultContent}
        </AccordionItem>
      </Accordion>
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
