import { theme, Collapse, Table, Typography, Form, Input, InputNumber, Select, Space } from "antd";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CollapseProps, InputRef } from 'antd';
import { LunarJadeCraftAmountTable, LunarJadeCraftMaterialList } from "../../data/lunarData";
import { LunarFragmentData, LunarJadeCraftAmount, LunarJadeCraftMaterial } from "../../interface/Item.interface";
import { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { getColor } from "../../utils/common.util";
import { EQUIPMENT, LUNAR_JADE_RARITY } from "../../constants/InGame.constants";
import { LunarJadeCalculator } from "../../interface/Common.interface";
import { dataCalculator } from "../../data/lunarCalculatorData";
import type { FormInstance } from 'antd/es/form';
const { Text } = Typography;
const { Option } = Select;

interface TableResource {
  lunarFragment: LunarFragmentData;
  amount: number;
}
enum TAB {
  EQ = 'Equipment',
  QT = 'Quantity',
  FR = 'From',
  TO = 'To'
}

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

interface optItem {
  value: LUNAR_JADE_RARITY;
  label: LUNAR_JADE_RARITY;
  rateValue: number
}

const opt: optItem[] = [
  { value: LUNAR_JADE_RARITY.CRAFT, label: LUNAR_JADE_RARITY.CRAFT, rateValue: 1 },
  { value: LUNAR_JADE_RARITY.NORMAL, label: LUNAR_JADE_RARITY.NORMAL, rateValue: 2 },
  { value: LUNAR_JADE_RARITY.MAGIC, label: LUNAR_JADE_RARITY.MAGIC, rateValue: 3 },
  { value: LUNAR_JADE_RARITY.RARE, label: LUNAR_JADE_RARITY.RARE, rateValue: 4 },
  { value: LUNAR_JADE_RARITY.EPIC, label: LUNAR_JADE_RARITY.EPIC, rateValue: 5 },
  { value: LUNAR_JADE_RARITY.UNIQUE, label: LUNAR_JADE_RARITY.UNIQUE, rateValue: 6 },
  { value: LUNAR_JADE_RARITY.LEGEND, label: LUNAR_JADE_RARITY.LEGEND, rateValue: 7 },
]

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
  const [inputNumb, setInputNumb] = useState<number>(0);
  const [selectItem, setSelectItem] = useState<LUNAR_JADE_RARITY>(LUNAR_JADE_RARITY.CRAFT);
  const form = useContext(EditableContext)!;



  useEffect(() => {
    if (record?.defaultValue && title === TAB.QT) {
      setInputNumb(record.defaultValue)
    }
    if (record?.from && title === TAB.FR) {
      setSelectItem(record.from)
    }
    if (record?.to && title === TAB.TO) {
      setSelectItem(record.to)
    }
  }, [record, title])



  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };



  const onChange = (value: number | null) => {
    if (typeof value === 'number') {
      setInputNumb(value)
    }
  };

  const saveInput = () => {
    toggleEdit();
    handleSave({ ...record, defaultValue: inputNumb });
  }

  const handleChange = (value: LUNAR_JADE_RARITY) => {

    setSelectItem(value)
  };

  const saveSelect = () => {
    toggleEdit();
    if (title === TAB.FR) {
      handleSave({ ...record, from: selectItem });
    }
    if (title === TAB.TO) {
      handleSave({ ...record, to: selectItem });
    }
  }

  let childNode = children;
  const findFr = opt.find(item => item.value === record?.from)
  const findTo = opt.find(item => item.value === record?.to)
  if (editable) {

    childNode = editing ? (
      <>

        {title === TAB.QT &&
          <InputNumber min={record.min} max={record.max} defaultValue={inputNumb} onChange={onChange} onBlur={saveInput} autoFocus />}
        {(title === TAB.FR) && <Select
          defaultValue={selectItem}
          style={{ width: 120 }}
          onChange={handleChange}
          // options={opt}
          onBlur={saveSelect}
          autoFocus
        >{opt.map(item => {

          return (<Option value={item.value} label={item.label} key={item.value} disabled={(findTo?.rateValue ?? 0) <= item.rateValue}>
            <Space>
              {item.label}
            </Space>
          </Option>
          )
        })}</Select>}
        {(title === TAB.TO) && <Select
          defaultValue={selectItem}
          style={{ width: 120 }}
          onChange={handleChange}
          // options={opt}
          onBlur={saveSelect}
          autoFocus
        >{opt.map(item => {

          return (<Option value={item.value} label={item.label} key={item.value} disabled={(findFr?.rateValue ?? 8) >= item.rateValue}>
            <Space>
              {item.label}
            </Space>
          </Option>
          )
        })}</Select>}
      </>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit} >
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
      title: TAB.EQ,
      dataIndex: 'equipment',
    },
    {
      title: TAB.QT,
      dataIndex: 'defaultValue',
      editable: true
    },
    {
      title: TAB.FR,
      dataIndex: 'from', editable: true
    },
    {
      title: TAB.TO,
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
    console.log({ selectedRowKeys, dataSource });

    const tableResource: TableResource[] = useMemo(() => {
      let temp: TableResource[] = []
      selectedRowKeys.map(item => {
        const found = dataSource.find(dt => dt.key === item);

        if (found) {
          const { equipment, from, to, defaultValue } = found;
          let adding = false;
          let total = 0;
          LunarJadeCraftAmountTable.map(item => {
            if (adding) {
              total += item.quantity
            }
            if (item.rarity === from) {
              adding = true
            }
            if (item.rarity === to) {
              adding = false
            }

          })

          const foundMat = LunarJadeCraftMaterialList.find(mat => mat.equipmentType === equipment)
          if (foundMat) {
            foundMat.lunarFragment.map(frag => {
              const foundTempMat = temp.findIndex(tmp => tmp.lunarFragment.type === frag.type);
              if (foundTempMat === -1) {
                temp.push({ lunarFragment: frag, amount: total * defaultValue })
              } else {
                const old = temp[foundTempMat]
                temp[foundTempMat] = ({ ...old, amount: old.amount + (total * defaultValue) })
              }
            })
          }
        }

      })
      return temp
    }, [
      selectedRowKeys, dataSource
    ]);



    const columnsResource: ColumnsType<TableResource> = [
      {
        title: 'Fragment Mat',
        dataIndex: 'lunarFragment',
        render: (_, { lunarFragment }) => (
          <div>
            <Text style={{ color: lunarFragment.color, marginRight: 5 }}>{lunarFragment.type}</Text>
          </div>
        )
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        width: 150
      },
    ]

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
        pagination={false}
      />
      <Table size={'small'} dataSource={tableResource} columns={columnsResource} pagination={false} bordered />
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
