import { theme, Collapse, Table, Typography, Form, Input, InputNumber } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import type { CollapseProps, InputRef } from 'antd';
import { LunarJadeCraftAmountTable, LunarJadeCraftMaterialList } from "../../data/lunarData";
import { LunarJadeCraftAmount, LunarJadeCraftMaterial } from "../../interface/Item.interface";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { getColor } from "../../utils/common.util";
import { EQUIPMENT, LUNAR_JADE_RARITY } from "../../constants/InGame.constants";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import { dataCalculator } from "../../data/lunarCalculatorData";
import type { FormInstance } from 'antd/es/form';
const { Text } = Typography;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof LunarJadeCalculator;
  record: LunarJadeCalculator;
  handleSave: (record: LunarJadeCalculator) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;


  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    console.log({ title, record });

    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex.toString()}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
        <InputNumber min={record.min} max={record.max} defaultValue={record.defaultValue} ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];
type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

const LunarJadeCalculatorContent = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<LunarJadeCalculator[]>(dataCalculator)

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: LunarJadeCalculator[]
  ) => {
    console.log('selectedRowKeys changed: ', { newSelectedRowKeys, selectedRows });
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  const handleSave = (row: LunarJadeCalculator) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columnsCalculator: (ColumnsType[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Equipment',
      dataIndex: 'equipment',
    },
    {
      title: 'Quantity',
      dataIndex: 'defaultValue',
      editable: true
    },
    {
      title: 'From',
      dataIndex: 'from', editable: true
    },
    {
      title: 'To',
      dataIndex: 'to', editable: true
    },
  ];


  const columns = columnsCalculator.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: LunarJadeCalculator) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const getCalculator = () => {
    return <div>
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection
        }}
        // columns={columnsCalculator}
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
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
