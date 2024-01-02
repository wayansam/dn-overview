import { Collapse, CollapseProps, Divider, Popover, Slider, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { ErosionConquerorJadeMaterialTable } from "../../data/ErosionData";
import { ErosionConquerorJadeMaterial } from "../../interface/Item.interface";
import { useMemo, useState } from "react";
import { SliderMarks } from "antd/es/slider";
import Checkbox, { CheckboxChangeEvent } from "antd/es/checkbox";

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
  5: "+5",
  10: "+10",
  15: "+15",
  20: "+20",
};

interface ErosionConquerorTableMaterialList {
  "Erosion Fragment": number;
  "Gold Lotus Crown": number;
  Gold: number;
}

const ErosionJadeContent = () => {
  const [erosionData, setErosionData] = useState([0, 10]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedTier, setCheckedTier] = useState(false);

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const columnsMats: ColumnsType<ErosionConquerorJadeMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: "Erosion Fragment",
      dataIndex: "erosionFragment",
    },
    {
      title: "Gold Lotus Crown",
      dataIndex: "goldLotusCrown",
    },
    {
      title: "Gold",
      dataIndex: "gold",
    },
  ];

  const ancDataSource: ErosionConquerorTableMaterialList = useMemo(() => {
    const tempSlice = ErosionConquerorJadeMaterialTable.slice(
      erosionData[0],
      erosionData[1]
    );
    let tempErFrag = 0;
    let tempGLC = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempErFrag += slicedItem.erosionFragment;
      tempGLC += slicedItem.goldLotusCrown;
      tempGold += slicedItem.gold;
    });
    if (checkedCraft) {
      tempErFrag += 10;
      tempGold += 10000;
    }
    if (checkedTier) {
      tempErFrag += 100;
      tempGold += 10000;
    }
    const temp: ErosionConquerorTableMaterialList = {
      "Erosion Fragment": tempErFrag,
      "Gold Lotus Crown": tempGLC,
      Gold: tempGold,
    };
    return temp;
  }, [erosionData, checkedCraft, checkedTier]);

  const onChangeCraft = (e: CheckboxChangeEvent) => {
    setCheckedCraft(e.target.checked);
  };
  const onChangeTier = (e: CheckboxChangeEvent) => {
    setCheckedTier(e.target.checked);
  };

  const getCalc = () => {
    const onAfterChange = (value: number[]) => {
      setErosionData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={20}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedCraft} onChange={onChangeCraft} >
              <Tooltip title="10 fragment, 10k gold" trigger="hover" color="blue" placement="right" >
                Include 1st shop Mats
              </Tooltip>
            </Checkbox>


          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox checked={checkedTier} onChange={onChangeTier} >
              <Tooltip title="+20 tier 1, 100 fragment, 10k gold" trigger="hover" color="blue" placement="right" >
                Include Tier 2 evolve
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
      label: "Erosion Conqueror Craft Table",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={ErosionConquerorJadeMaterialTable}
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
      label: "Erosion Conqueror Calculator",
      children: getCalc(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["2"]} />
    </div>
  );
};

export default ErosionJadeContent;
