import { Checkbox, Collapse, CollapseProps, Divider, Table, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import CalcCard from "../../components/CalcCard";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentTable from "../../components/EquipmentTable";
import FlagAlert from "../../components/FlagAlert";
import MaterialListTable from "../../components/MaterialListTable";
import RangeFromTo from "../../components/RangeFromTo";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  useInvalidRange,
  useSelectedRows,
} from "../../hooks/useEquipmentCalculator";
import { dataKilosCalculator } from "../../data/KilosCalculatorData";
import {
  KilosT1ArmorCraftMaterial,
  KilosT1ArmorEnhanceMaterialTable,
  KilosT2ArmorEnhanceMaterialTable,
  NeedleOfIntelectCraftMaterial,
} from "../../data/KilosData";
import { KilosCalculator } from "../../interface/Common.interface";
import { KilosArmorCraftMaterial } from "../../interface/Item.interface";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Joys & Sorrow of Kilos": number;
  "High Grade Joys & Sorrow of Kilos": number;
  "Thread of Intellect": number;
  Gold: number;
  "Needle of Intellect": number;
}

const getLabel = (item: number) => {
  return item <= 20 ? `Tier 1 +${item}` : `Tier 2 +${item - 20}`;
};

const KilosEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<KilosCalculator[]>(dataKilosCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);
  const [checkedChange, setCheckedChange] = useState(false);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedEvo, setCheckedEvo] = useState(false);

  const encTable = [
    ...KilosT1ArmorEnhanceMaterialTable,
    ...KilosT2ArmorEnhanceMaterialTable,
  ];

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);

  const selectedRows = useSelectedRows(selectedRowKeys, dataSource);

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
      "Helm Fragment": 0,
      "Upper Fragment": 0,
      "Lower Fragment": 0,
      "Gloves Fragment": 0,
      "Shoes Fragment": 0,
      "Joys & Sorrow of Kilos": 0,
      "High Grade Joys & Sorrow of Kilos": 0,
      "Thread of Intellect": 0,
      Gold: 0,
      "Needle of Intellect": 0,
    };
    if (invalidDtSrc) {
      return temp;
    }

    selectedRows.forEach(({ equipment, from, to, evoTier2, craft }) => {
      let tempSlice: KilosArmorCraftMaterial[] = [];
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          tempSlice = encTable.slice(from, to);
          break;

        default:
          break;
      }

      let tempFragment = 0;
      let tempJoySorrow = 0;
      let tempHGJoySorrow = 0;
      let tempThreadIntel = 0;
      let tempGold = 0;

      tempSlice.forEach((slicedItem) => {
        tempFragment += slicedItem.eqTypeFragment;
        tempJoySorrow += slicedItem.joySorrow;
        tempHGJoySorrow += slicedItem.joySorrowHG;
        tempThreadIntel += slicedItem.threadIntelect;
        tempGold += slicedItem.gold;
      });

      if (craft) {
        tempFragment += KilosT1ArmorCraftMaterial.eqTypeFragment;
        tempThreadIntel += KilosT1ArmorCraftMaterial.threadIntelect;
        tempGold += KilosT1ArmorCraftMaterial.gold;
      }

      temp["Joys & Sorrow of Kilos"] += tempJoySorrow;
      temp["High Grade Joys & Sorrow of Kilos"] += tempHGJoySorrow;
      temp["Thread of Intellect"] += tempThreadIntel;
      temp["Gold"] += tempGold;
      temp["Needle of Intellect"] += evoTier2 ? 1 : 0;
      switch (equipment) {
        case EQUIPMENT.HELM:
          temp["Helm Fragment"] += tempFragment;
          break;
        case EQUIPMENT.UPPER:
          temp["Upper Fragment"] += tempFragment;
          break;
        case EQUIPMENT.LOWER:
          temp["Lower Fragment"] += tempFragment;
          break;
        case EQUIPMENT.GLOVE:
          temp["Gloves Fragment"] += tempFragment;
          break;
        case EQUIPMENT.SHOES:
          temp["Shoes Fragment"] += tempFragment;
          break;

        default:
          break;
      }
    });
    if (checkedChange) {
      temp["Joys & Sorrow of Kilos"] +=
        temp["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.joySorrow;
      temp["Thread of Intellect"] +=
        temp["Needle of Intellect"] *
        NeedleOfIntelectCraftMaterial.threadIntelect;
      temp.Gold +=
        temp["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.gold;
      temp["Needle of Intellect"] = 0;
    }
    return temp;
  }, [selectedRows, invalidDtSrc, checkedChange]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
      craft: checkedCraft,
      evoTier2: checkedEvo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo, checkedCraft, checkedEvo]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <CalcCard>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
            customLabeling={getLabel}
            extraColumns={[
              { type: "switch", dataIndex: "craft", label: "Craft" },
              { type: "switch", dataIndex: "evoTier2", label: "Evo Tier 2" },
            ]}
          />
        </CalcCard>
        <CalcCard>
          <FlagAlert
            show={invalidDtSrc}
            message="From cannot exceed the To option"
            type="error"
          />
          <Divider orientation="left">Settings</Divider>
          <RangeFromTo
            from={selectFrom}
            to={selectTo}
            onFromChange={setSelectFrom}
            onToChange={setSelectTo}
            max={encTable.length}
            customLabeling={getLabel}
          />
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={checkedCraft}
              onChange={(e) => {
                setCheckedCraft(e.target.checked);
              }}
            >
              Include Craft mats
            </Checkbox>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={checkedEvo}
              onChange={(e) => {
                setCheckedEvo(e.target.checked);
              }}
            >
              Include Evo mats
            </Checkbox>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={checkedChange}
              onChange={(e) => {
                setCheckedChange(e.target.checked);
              }}
            >
              <Tooltip
                title="300 Joy&Sorrow, 2600 thread, 5k gold"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Change Needle to Craft mats
              </Tooltip>
            </Checkbox>
          </div>
          <MaterialListTable data={tableResource} />
        </CalcCard>
      </div>
    );
  };

  const threadIntelectGoldFields = [
    { dataIndex: "threadIntelect" as const, label: "Thread of Intellect", shortLabel: "(Thr)" },
    { dataIndex: "gold" as const, label: "Gold", shortLabel: "(g)" },
  ];

  const columnsArmorT1 = makeCraftMaterialColumns<KilosArmorCraftMaterial>([
    { dataIndex: "eqTypeFragment", label: "Eq. Fragment", shortLabel: "(Fragment)" },
    { dataIndex: "joySorrow", label: "Joys & Sorrow", shortLabel: "(Joy)" },
    ...threadIntelectGoldFields,
  ]);

  const columnsArmorT2 = makeCraftMaterialColumns<KilosArmorCraftMaterial>([
    { dataIndex: "eqTypeFragment", label: "Eq. Fragment", shortLabel: "(Fragment)" },
    { dataIndex: "joySorrowHG", label: "HG Joys & Sorrow", shortLabel: "(HG Joy)" },
    ...threadIntelectGoldFields,
  ]);

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Armor Tier 1 Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={KilosT1ArmorEnhanceMaterialTable}
              columns={columnsArmorT1}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Armor Tier 2 Craft Reference",
      children: (
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: 250, marginRight: 10 }}>
            <Table
              size={"small"}
              dataSource={KilosT2ArmorEnhanceMaterialTable}
              columns={columnsArmorT2}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Calculate",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default KilosEqContent;
