import { Collapse, CollapseProps, Table } from "antd";
import { useCallback, useEffect, useState } from "react";
import { makeCraftMaterialColumns } from "../../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../../components/EquipmentCalculatorPanel";
import { EQUIPMENT } from "../../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useInvalidRange,
} from "../../../hooks/useEquipmentCalculator";
import { dataKilosCalculator } from "../../../data/equipment/KilosCalculatorData";
import {
  KilosT1ArmorCraftMaterial,
  KilosT1ArmorEnhanceMaterialTable,
  KilosT2ArmorEnhanceMaterialTable,
  NeedleOfIntelectCraftMaterial,
} from "../../../data/equipment/KilosData";
import { KilosCalculator } from "../../../interface/Common.interface";
import { KilosArmorCraftMaterial } from "../../../interface/Item.interface";

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

  const emptyKilosMats: TableMaterialList = {
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

  const getKilosMatsTable = useCallback(
    (equipment: EQUIPMENT): KilosArmorCraftMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          return encTable;

        default:
          return [];
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reduceKilosRow = useCallback(
    (
      acc: TableMaterialList,
      slice: KilosArmorCraftMaterial[],
      row: KilosCalculator
    ): TableMaterialList => {
      const next = { ...acc };

      let tempFragment = 0;
      let tempJoySorrow = 0;
      let tempHGJoySorrow = 0;
      let tempThreadIntel = 0;
      let tempGold = 0;

      slice.forEach((slicedItem) => {
        tempFragment += slicedItem.eqTypeFragment;
        tempJoySorrow += slicedItem.joySorrow;
        tempHGJoySorrow += slicedItem.joySorrowHG;
        tempThreadIntel += slicedItem.threadIntelect;
        tempGold += slicedItem.gold;
      });

      if (row.craft) {
        tempFragment += KilosT1ArmorCraftMaterial.eqTypeFragment;
        tempThreadIntel += KilosT1ArmorCraftMaterial.threadIntelect;
        tempGold += KilosT1ArmorCraftMaterial.gold;
      }

      next["Joys & Sorrow of Kilos"] += tempJoySorrow;
      next["High Grade Joys & Sorrow of Kilos"] += tempHGJoySorrow;
      next["Thread of Intellect"] += tempThreadIntel;
      next.Gold += tempGold;
      next["Needle of Intellect"] += row.evoTier2 ? 1 : 0;

      switch (row.equipment) {
        case EQUIPMENT.HELM:
          next["Helm Fragment"] += tempFragment;
          break;
        case EQUIPMENT.UPPER:
          next["Upper Fragment"] += tempFragment;
          break;
        case EQUIPMENT.LOWER:
          next["Lower Fragment"] += tempFragment;
          break;
        case EQUIPMENT.GLOVE:
          next["Gloves Fragment"] += tempFragment;
          break;
        case EQUIPMENT.SHOES:
          next["Shoes Fragment"] += tempFragment;
          break;

        default:
          break;
      }

      return next;
    },
    []
  );

  const finalizeKilosMats = useCallback(
    (
      acc: TableMaterialList,
      ctx: { checkedChange: boolean }
    ): TableMaterialList => {
      if (!ctx.checkedChange) {
        return acc;
      }
      const next = { ...acc };
      next["Joys & Sorrow of Kilos"] +=
        next["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.joySorrow;
      next["Thread of Intellect"] +=
        next["Needle of Intellect"] *
        NeedleOfIntelectCraftMaterial.threadIntelect;
      next.Gold +=
        next["Needle of Intellect"] * NeedleOfIntelectCraftMaterial.gold;
      next["Needle of Intellect"] = 0;
      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getKilosMatsTable,
    emptyKilosMats,
    reduceKilosRow,
    { checkedChange },
    finalizeKilosMats
  );

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

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      customLabeling={getLabel}
      extraColumns={[
        { type: "switch", dataIndex: "craft", label: "Craft" },
        { type: "switch", dataIndex: "evoTier2", label: "Evo Tier 2" },
      ]}
      invalid={invalidDtSrc}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: encTable.length,
        customLabeling: getLabel,
      }}
      toggles={[
        {
          key: "craft",
          label: "Include Craft mats",
          checked: checkedCraft,
          onChange: setCheckedCraft,
        },
        {
          key: "evo",
          label: "Include Evo mats",
          checked: checkedEvo,
          onChange: setCheckedEvo,
        },
        {
          key: "change",
          label: "Change Needle to Craft mats",
          tooltip: "300 Joy&Sorrow, 2600 thread, 5k gold",
          checked: checkedChange,
          onChange: setCheckedChange,
        },
      ]}
      mats={{ data: tableResource }}
    />
  );

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
