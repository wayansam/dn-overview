import { Alert, Collapse, CollapseProps, Table } from "antd";
import Slider, { SliderMarks } from "antd/es/slider";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import {
  AncientDJSkillMaterialTable,
  DMFDJSkillMaterialTable,
} from "../../data/SkillJadeData";

interface TableResource {
  mats: string;
  amount: number;
}

interface DreamyTableMaterialList {
  "Dreamy Core": number;
  "High Purity Dreamy Core": number;
  Gold: number;
}

interface BloodMoonTableMaterialList {
  "Blood Moon Core": number;
  "High Purity Blood Moon Core": number;
  Gold: number;
}

interface VerdureTableMaterialList {
  "Verdure Core": number;
  "High Purity Verdure Core": number;
  Gold: number;
}

interface AncientTableMaterialList {
  "Ancient Broken Dragon Jade Fragments": number;
  "Ancient Dragon Jade Fragments": number;
  Gold: number;
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
  11: {
    style: { color: "#f50" },
    label: <strong>+11</strong>,
  },
  12: {
    style: { color: "#f50" },
    label: <strong>+12</strong>,
  },
  13: {
    style: { color: "#f50" },
    label: <strong>+13</strong>,
  },
  14: {
    style: { color: "#f50" },
    label: <strong>+14</strong>,
  },
  15: {
    style: { color: "#f50" },
    label: <strong>+15</strong>,
  },
};

const SkillJadeContent = () => {
  const [AncData, setAncData] = useState([0, 10]);
  const [DData, setDData] = useState([0, 10]);
  const [BMData, setBMData] = useState([0, 10]);
  const [VData, setVData] = useState([0, 10]);

  const columnsResource: ColumnsType<TableResource> = [
    { title: "Materials", dataIndex: "mats" },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 150,
    },
  ];

  const dDataSource: DreamyTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(DData[0], DData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: DreamyTableMaterialList = {
      "Dreamy Core": tempLFrag,
      "High Purity Dreamy Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [DData]);

  const showDWarning = useMemo(() => {
    return DData.some((dt) => dt > 10);
  }, [DData]);

  const getDCalc = () => {
    const onAfterChange = (value: number[]) => {
      setDData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          {showDWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(dDataSource).map(([key, value]) => ({
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

  const bmDataSource: BloodMoonTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(BMData[0], BMData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: BloodMoonTableMaterialList = {
      "Blood Moon Core": tempLFrag,
      "High Purity Blood Moon Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [BMData]);

  const showBMWarning = useMemo(() => {
    return BMData.some((dt) => dt > 10);
  }, [BMData]);

  const getBMCalc = () => {
    const onAfterChange = (value: number[]) => {
      setBMData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          {showBMWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(bmDataSource).map(([key, value]) => ({
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

  const vDataSource: VerdureTableMaterialList = useMemo(() => {
    const tempSlice = DMFDJSkillMaterialTable.slice(VData[0], VData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: VerdureTableMaterialList = {
      "Verdure Core": tempLFrag,
      "High Purity Verdure Core": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [VData]);

  const showVWarning = useMemo(() => {
    return VData.some((dt) => dt > 10);
  }, [VData]);

  const getVCalc = () => {
    const onAfterChange = (value: number[]) => {
      setVData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          {showVWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
          <Table
            size={"small"}
            dataSource={Object.entries(vDataSource).map(([key, value]) => ({
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

  const ancDataSource: AncientTableMaterialList = useMemo(() => {
    const tempSlice = AncientDJSkillMaterialTable.slice(AncData[0], AncData[1]);
    let tempHFrag = 0;
    let tempLFrag = 0;
    let tempGold = 0;

    tempSlice.forEach((slicedItem) => {
      tempHFrag += slicedItem.higherFragment;
      tempLFrag += slicedItem.lowerFragment;
      tempGold += slicedItem.gold;
    });
    const temp: AncientTableMaterialList = {
      "Ancient Broken Dragon Jade Fragments": tempLFrag,
      "Ancient Dragon Jade Fragments": tempHFrag,
      Gold: tempGold,
    };
    return temp;
  }, [AncData]);

  const showAncWarning = useMemo(() => {
    return AncData.some((dt) => dt > 10);
  }, [AncData]);

  const getAncCalc = () => {
    const onAfterChange = (value: number[]) => {
      setAncData(value);
    };

    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <div style={style}>
          <Slider
            vertical
            range
            marks={marks}
            defaultValue={[0, 10]}
            max={15}
            min={0}
            onAfterChange={onAfterChange}
          />
        </div>
        <div>
          {showAncWarning && (
            <div>
              <Alert
                banner
                message="From +11 onward, the enhancement might fail"
                type="warning"
              />
            </div>
          )}
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
      label: "Dreamy Dragon Jade",
      children: getDCalc(),
    },
    {
      key: "2",
      label: "Blood Moon Dragon Jade",
      children: getBMCalc(),
    },
    {
      key: "3",
      label: "Verdure Dragon Jade",
      children: getVCalc(),
    },
    {
      key: "4",
      label: "Ancient Dragon Jade",
      children: getAncCalc(),
    },
  ];

  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["4"]} />
    </div>
  );
};

export default SkillJadeContent;
