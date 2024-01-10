import { Collapse, CollapseProps, Divider, Slider, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { NamedEODMaterial } from "../../interface/Item.interface";
import { useMemo, useState } from "react";
import { SliderMarks } from "antd/es/slider";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";
import { NamedEODMaterialTable } from "../../data/NamedEODData";

interface TableResource {
  mats: string;
  amount: number;
}

const style: React.CSSProperties = {
  display: "inline-block",
  height: 300,
  marginLeft: 20,
  marginRight: 50,
  marginTop: 10,
  marginBottom: 30,
};

const marks: SliderMarks = {
  0: "+0",
  1: "+1",
  2: "+2",
  3: "+3",
  4: "+4",
  5: "+5",
  6: "+6",
  7: "+7",
  8: "+8",
  9: "+9",
  10: "+10",
};

interface NamedEODTableMaterialList {
  "Guide Star": number;
  "Twilight Essence": number;
  Gold: number;
}

const NamedEODEqContent = () => {
  const [namedEODData, setNamedEODData] = useState([0, 5]);
  const [checkedCraft, setCheckedCraft] = useState(false);

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const columnsMats: ColumnsType<NamedEODMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: <div>
        <p>Guide Star</p>
        <p>Twilight Essence</p>
        <p>Gold</p>
      </div>,
      responsive: ['xs'],
      render: (_, { guideStar, twilightEssence, gold }) => (
        <div>
          <p >{guideStar}(gs)</p>
          <p >{twilightEssence}(ess)</p>
          <p >{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Guide Star",
      dataIndex: "guideStar",
      responsive: ['sm']
    },
    {
      title: "Twilight Essence",
      dataIndex: "twilightEssence",
      responsive: ['sm']
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ['sm']
    },
  ];

  const ancDataSource: NamedEODTableMaterialList = useMemo(() => {
    const tempSlice = NamedEODMaterialTable.slice(
      namedEODData[0],
      namedEODData[1]
    );
    let tempGS = 0;
    let tempEss = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempGS += slicedItem.guideStar;
      tempEss += slicedItem.twilightEssence;
      tempGold += slicedItem.gold;
    });
    if (checkedCraft) {
      tempGS += 10;
      tempEss += 80;
      tempGold += 25;
    }
    const temp: NamedEODTableMaterialList = {
      "Guide Star": tempGS,
      "Twilight Essence": tempEss,
      Gold: tempGold,
    };
    return temp;
  }, [namedEODData, checkedCraft]);

  const onChangeCraft = (e: CheckboxChangeEvent) => {
    setCheckedCraft(e.target.checked);
  };

  const getCalc = () => {
    const onAfterChange = (value: number[]) => {
      setNamedEODData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 5]}
            max={10}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedCraft} onChange={onChangeCraft} >
              <Tooltip title="10 guide star, 80 Twilight Essence, 25 gold" trigger="hover" color="blue" placement="right" >
                Include Craft Mats
              </Tooltip>
            </Checkbox>
          </div>

          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(ancDataSource).map(([key, value]) => ({
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

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Named End of Dream Craft Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={NamedEODMaterialTable}
              columns={columnsMats}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Named End of Dream Calculator",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default NamedEODEqContent;
