import {
  Collapse,
  CollapseProps,
  Divider,
  Form,
  FormInstance,
  Select,
  Space,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { AncientArmorCraftMaterialTable } from "../../data/AncientData";
import { ColumnGroupType, ColumnType, ColumnsType } from "antd/es/table";
import { AncientArmorCraftMaterial } from "../../interface/Item.interface";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AncientCalculator } from "../../interface/Common.interface";
import { dataAncCalculator } from "../../data/AncientCalculatorData";
import React from "react";
import { EQUIPMENT } from "../../constants/InGame.constants";

const { Option } = Select;

interface TableMaterialList {
  helmFragment: number;
  upperFragment: number;
  lowerFragment: number;
  glovesFragment: number;
  shoesFragment: number;
  ancKnowledge: number;
  ancInsignia: number;
  gold: number;
}

interface TableResource {
  mats: string;
  amount: number;
}

enum TAB {
  EQ = "Equipment",
  FR = "From",
  TO = "To",
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

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof AncientCalculator;
  record: AncientCalculator;
  handleSave: (record: AncientCalculator) => void;
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
  const [selectItem, setSelectItem] = useState<number>(0);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (record?.from && title === TAB.FR) {
      setSelectItem(record.from);
    }
    if (record?.to && title === TAB.TO) {
      setSelectItem(record.to);
    }
  }, [record, title]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const handleChange = (value: number) => {
    setSelectItem(value);
  };

  const saveSelect = () => {
    toggleEdit();
    if (title === TAB.FR) {
      handleSave({ ...record, from: selectItem });
    }
    if (title === TAB.TO) {
      handleSave({ ...record, to: selectItem });
    }
  };

  let childNode = children;

  const findFr = record?.from ?? 0;
  const findTo = record?.to ?? 0;

  const opt = useCallback(
    (start: number, end: number) =>
      Array.from({ length: end + 1 - start }, (_, k) => k + start).map(
        (item) => ({
          label: item,
          value: item,
        })
      ),
    []
  );

  if (editable) {
    childNode = editing ? (
      <>
        {title === TAB.FR && (
          <Select
            defaultValue={selectItem}
            style={{ width: 80 }}
            onChange={handleChange}
            options={opt(record.min, record.max)}
            onBlur={saveSelect}
            autoFocus
            status={findTo <= findFr ? "error" : undefined}
            size="small"
          ></Select>
        )}
        {title === TAB.TO && (
          <Select
            defaultValue={selectItem}
            style={{ width: 80 }}
            onChange={handleChange}
            options={opt(record.min, record.max)}
            onBlur={saveSelect}
            autoFocus
            status={findFr >= findTo ? "error" : undefined}
            size="small"
          ></Select>
        )}
      </>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
          color:
            (title === TAB.FR || title === TAB.TO) && findTo <= findFr
              ? "red"
              : "black",
          minWidth: title === TAB.FR || title === TAB.TO ? 80 : undefined,
          paddingTop: 1,
          paddingBottom: 1,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type ColumnTypes = (
  | ColumnGroupType<AncientCalculator>
  | ColumnType<AncientCalculator>
)[];

const AncientEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<AncientCalculator[]>(dataAncCalculator);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: AncientCalculator[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columnsCalculator: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: TAB.EQ,
      dataIndex: "equipment",
    },
    {
      title: TAB.FR,
      dataIndex: "from",
      editable: true,
    },
    {
      title: TAB.TO,
      dataIndex: "to",
      editable: true,
    },
  ];

  const handleSave = (row: AncientCalculator) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const columns = columnsCalculator.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: AncientCalculator) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
      helmFragment: 0,
      upperFragment: 0,
      lowerFragment: 0,
      glovesFragment: 0,
      shoesFragment: 0,
      ancKnowledge: 0,
      ancInsignia: 0,
      gold: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, max, min } = found;
        const tempSlice = AncientArmorCraftMaterialTable.slice(from, to);
        // const sumWithInitial = temp.reduce(
        //   (accumulator, currentValue) => accumulator + currentValue,
        //   initialValue
        // );

        let tempFragment = 0;
        let tempAncKnowledge = 0;
        let tempAncInsignia = 0;
        let tempGold = 0;

        tempSlice.forEach((slicedItem) => {
          tempFragment += slicedItem.eqTypeFragment;
          tempAncKnowledge += slicedItem.ancKnowledge;
          tempAncInsignia += slicedItem.ancInsignia;
          tempGold += slicedItem.gold;
        });

        temp.ancKnowledge += tempAncKnowledge;
        temp.ancInsignia += tempAncInsignia;
        temp.gold += tempGold;
        switch (equipment) {
          case EQUIPMENT.HELM:
            temp.helmFragment += tempFragment;
            break;
          case EQUIPMENT.UPPER:
            temp.upperFragment += tempFragment;
            break;
          case EQUIPMENT.LOWER:
            temp.lowerFragment += tempFragment;
            break;
          case EQUIPMENT.GLOVE:
            temp.glovesFragment += tempFragment;
            break;
          case EQUIPMENT.SHOES:
            temp.shoesFragment += tempFragment;
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const columnsResource: ColumnsType<TableResource> = [
    // {
    //   title: "Enhancement",
    //   dataIndex: "encLevel",
    // },
    // {
    //   title: "Eq. Fragment",
    //   dataIndex: "eqTypeFragment",
    // },
    // {
    //   title: "A. Knowledge",
    //   dataIndex: "ancKnowledge",
    // },
    // {
    //   title: "A. Insignia",
    //   dataIndex: "ancInsignia",
    // },
    // {
    //   title: "Gold",
    //   dataIndex: "gold",
    // },

    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={{ marginRight: 10, marginBottom: 10 }}>
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            components={components}
            rowClassName={() => "editable-row"}
            bordered
            dataSource={dataSource}
            columns={columns as ColumnTypes}
            pagination={false}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10 }}>
          <Divider orientation="left">Settings</Divider>
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            // dataSource={tableResource}
            dataSource={Object.entries(tableResource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
        </div>
      </div>
    );
  };

  const columnsArmor: ColumnsType<AncientArmorCraftMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Eq. Fragment",
      dataIndex: "eqTypeFragment",
    },
    {
      title: "A. Knowledge",
      dataIndex: "ancKnowledge",
    },
    {
      title: "A. Insignia",
      dataIndex: "ancInsignia",
    },
    {
      title: "Gold",
      dataIndex: "gold",
    },
  ];
  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Armor Craft Reference",
      children: (
        <div>
          <Table
            size={"small"}
            dataSource={AncientArmorCraftMaterialTable}
            columns={columnsArmor}
            pagination={false}
            bordered
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Weapon Craft Reference",
      children: (
        <div>
          {/* <Table
            size={"small"}
            dataSource={AncientArmorCraftMaterialTable}
            columns={columnsArmor}
            pagination={false}
            bordered
          /> */}
        </div>
      ),
    },
    {
      key: "3",
      label: "Accessories Craft Reference",
      children: (
        <div>
          {/* <Table
            size={"small"}
            dataSource={AncientArmorCraftMaterialTable}
            columns={columnsArmor}
            pagination={false}
            bordered
          /> */}
        </div>
      ),
    },
    {
      key: "4",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse
        items={items}
        size="small"
        defaultActiveKey={["4"]}
        // onChange={onChange}
      />
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

export default AncientEqContent;
