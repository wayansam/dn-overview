import { theme, Collapse, Table, Typography } from "antd";
import React, { useState } from "react";
import type { CollapseProps } from 'antd';
import { LunarJadeCraftAmountTable, LunarJadeCraftMaterialList } from "../../data/lunarData";
import { LunarJadeCraftAmount, LunarJadeCraftMaterial } from "../../interface/Item.interface";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { getColor } from "../../utils/common.util";
import { EQUIPMENT, LUNAR_JADE_RARITY } from "../../constants/InGame.constants";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import { dataCalculator } from "../../data/lunarCalculatorData";
const { Text } = Typography;




const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;


  const columnsCalculator: ColumnsType<LunarJadeCalculator> = [
    {
      title: 'Equipment',
      dataIndex: 'equipment',
    },
    {
      title: 'Quantity',
      dataIndex: '',
    },
    {
      title: 'From',
      dataIndex: 'from',
    },
    {
      title: 'To',
      dataIndex: 'to',
    },
  ];




  const getCalculator = () => {
    return <div>
      <Table
        rowSelection={rowSelection}
        columns={columnsCalculator}
        dataSource={dataCalculator}
      />
    </div>
  }



  const columnsLunar: ColumnsType<LunarJadeCraftAmount> = [
    {
      title: 'Stage Rarity',
      dataIndex: 'rarity',
      width: 100,
      render: (_, { rarity }) => (
        <div>
          <Text style={{ color: getColor(rarity) }}>{rarity}</Text>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'quantity',
    },
  ]

  const columnsCraft: ColumnsType<LunarJadeCraftMaterial> = [
    {
      title: 'Equipment',
      dataIndex: 'equipmentType',
      width: 150
    },
    {
      title: 'Fragment Mat',
      dataIndex: 'lunarFragment',
      render: (_, { lunarFragment }) => (
        <div>
          {lunarFragment.map((item) => <Text style={{ color: item.color, marginRight: 5 }}>{item.type}</Text>)}
        </div>
      )
    },
  ]

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: 'Craft Reference',
      children: <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ width: 200, marginRight: 10 }}>
          <Title level={5}>{'Lunar Fragment Amount'}</Title>
          <Table size={'small'} dataSource={LunarJadeCraftAmountTable} columns={columnsLunar} pagination={false} bordered />
        </div>
        <div style={{ width: 400 }}>
          <Title level={5}>{'Craftable'}</Title>
          <Table size={'small'} dataSource={LunarJadeCraftMaterialList} columns={columnsCraft} pagination={false} bordered />
        </div>
      </div>,
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
        defaultActiveKey={['2']} onChange={onChange} />
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
