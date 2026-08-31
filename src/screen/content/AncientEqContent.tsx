import { Collapse, CollapseProps, Table } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../components/EquipmentCalculatorPanel";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useInvalidRange,
  useSelectionFlag,
} from "../../hooks/useEquipmentCalculator";
import { dataAncCalculator } from "../../data/AncientCalculatorData";
import {
  AncientAccessoryCraftMaterialTable,
  AncientAccessoryCraftMaterialTableV2,
  AncientArmorCraftMaterialTable,
  AncientArmorCraftMaterialTableV2,
  AncientWeaponT2CraftMaterialTable,
  AncientWeaponT2CraftMaterialTableV2,
} from "../../data/AncientData";
import { AncientCalculator } from "../../interface/Common.interface";
import { AncientArmorCraftMaterial } from "../../interface/Item.interface";

interface TableMaterialList {
  "Helm Fragment": number;
  "Upper Fragment": number;
  "Lower Fragment": number;
  "Gloves Fragment": number;
  "Shoes Fragment": number;
  "Otherworldly Ancient Weapon Fragment": number;
  "Unknown Ancient Accessory Fragment": number;
  "Ancient Knowledge": number;
  "Ancient Insignia": number;
  Gold: number;
}

const versionOpt = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Old",
    value: "old",
  },
];

const AncientEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<AncientCalculator[]>(dataAncCalculator);
  const [selectVersion, setSelectVersion] = useState<string>(
    versionOpt[0].value
  );
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(20);

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);

  const showWarningAcc = useSelectionFlag(
    selectedRowKeys,
    dataSource,
    (row) =>
      (row.equipment === EQUIPMENT.NECKLACE ||
        row.equipment === EQUIPMENT.EARRING ||
        row.equipment === EQUIPMENT.RING1) &&
      (row.from > 10 || row.to > 10)
  );

  const getAncientMatsTable = useCallback(
    (equipment: EQUIPMENT): AncientArmorCraftMaterial[] => {
      switch (equipment) {
        case EQUIPMENT.HELM:
        case EQUIPMENT.UPPER:
        case EQUIPMENT.LOWER:
        case EQUIPMENT.GLOVE:
        case EQUIPMENT.SHOES:
          return selectVersion === versionOpt[0].value
            ? AncientArmorCraftMaterialTableV2
            : AncientArmorCraftMaterialTable;
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          return selectVersion === versionOpt[0].value
            ? AncientWeaponT2CraftMaterialTableV2
            : AncientWeaponT2CraftMaterialTable;
        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
          return selectVersion === versionOpt[0].value
            ? AncientAccessoryCraftMaterialTableV2
            : AncientAccessoryCraftMaterialTable;
        default:
          return [];
      }
    },
    [selectVersion]
  );

  const emptyAncientMats: TableMaterialList = {
    "Helm Fragment": 0,
    "Upper Fragment": 0,
    "Lower Fragment": 0,
    "Gloves Fragment": 0,
    "Shoes Fragment": 0,
    "Otherworldly Ancient Weapon Fragment": 0,
    "Unknown Ancient Accessory Fragment": 0,
    "Ancient Knowledge": 0,
    "Ancient Insignia": 0,
    Gold: 0,
  };

  const reduceAncientRow = useCallback(
    (
      acc: TableMaterialList,
      slice: AncientArmorCraftMaterial[],
      row: AncientCalculator
    ): TableMaterialList => {
      const next = { ...acc };

      let tempFragment = 0;
      let tempAncKnowledge = 0;
      let tempAncInsignia = 0;
      let tempGold = 0;

      slice.forEach((slicedItem) => {
        tempFragment += slicedItem.eqTypeFragment;
        tempAncKnowledge += slicedItem.ancKnowledge;
        tempAncInsignia += slicedItem.ancInsignia;
        tempGold += slicedItem.gold;
      });

      next["Ancient Knowledge"] += tempAncKnowledge;
      next["Ancient Insignia"] += tempAncInsignia;
      next.Gold += tempGold;
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
        case EQUIPMENT.MAIN_WEAPON:
        case EQUIPMENT.SECOND_WEAPON:
          next["Otherworldly Ancient Weapon Fragment"] += tempFragment;
          break;
        case EQUIPMENT.NECKLACE:
        case EQUIPMENT.EARRING:
        case EQUIPMENT.RING1:
          next["Unknown Ancient Accessory Fragment"] += tempFragment;
          break;

        default:
          break;
      }

      return next;
    },
    []
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getAncientMatsTable,
    emptyAncientMats,
    reduceAncientRow
  );

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      customLabeling={(item) => `${item}`}
      invalid={invalidDtSrc}
      flags={[
        {
          show: showWarningAcc,
          message: "From +11 onward, your accessory might break",
          type: "warning",
        },
      ]}
      typeFilter={[
        { label: "Armor", keys: ["1", "2", "3", "4", "5"] },
        { label: "Weapon", keys: ["6", "7"] },
        { label: "Accessories", keys: ["8", "9", "10", "11"] },
      ]}
      range={{
        from: selectFrom,
        to: selectTo,
        onFromChange: setSelectFrom,
        onToChange: setSelectTo,
        max: 20,
        customLabeling: (item) => `${item}`,
      }}
      selects={[
        {
          key: "version",
          label: "Version",
          value: selectVersion,
          onChange: (val) => setSelectVersion(val as string),
          options: versionOpt,
        },
      ]}
      mats={{ data: tableResource }}
    />
  );

  const ancKnowledgeInsigniaGoldFields = [
    { dataIndex: "ancKnowledge" as const, label: "A. Knowledge", shortLabel: "(Know)" },
    { dataIndex: "ancInsignia" as const, label: "A. Insignia", shortLabel: "(Ins)" },
    { dataIndex: "gold" as const, label: "Gold", shortLabel: "(g)" },
  ];

  const columnsArmor = makeCraftMaterialColumns<AncientArmorCraftMaterial>([
    { dataIndex: "eqTypeFragment", label: "Eq. Fragment", shortLabel: "(Fragment)" },
    ...ancKnowledgeInsigniaGoldFields,
  ]);
  const columnsWeapon = makeCraftMaterialColumns<AncientArmorCraftMaterial>([
    {
      dataIndex: "eqTypeFragment",
      label: "Otherworldly A. Weapon Fragment",
      shortLabel: "(Fragment)",
    },
    ...ancKnowledgeInsigniaGoldFields,
  ]);
  const columnsAccessory = makeCraftMaterialColumns<AncientArmorCraftMaterial>([
    {
      dataIndex: "eqTypeFragment",
      label: "Unknown Ancient Accessory Fragment",
      shortLabel: "(Fragment)",
    },
    ...ancKnowledgeInsigniaGoldFields,
  ]);
  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Armor Craft Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "New table"}
              size={"small"}
              dataSource={AncientArmorCraftMaterialTableV2}
              columns={columnsArmor}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "Old table"}
              size={"small"}
              dataSource={AncientArmorCraftMaterialTable}
              columns={columnsArmor}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Weapon Craft Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "New table"}
              size={"small"}
              dataSource={AncientWeaponT2CraftMaterialTableV2}
              columns={columnsWeapon}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "Old table"}
              size={"small"}
              dataSource={AncientWeaponT2CraftMaterialTable}
              columns={columnsWeapon}
              pagination={false}
              bordered
            />
          </div>
        </div>
      ),
    },
    {
      key: "3",
      label: "Accessories Craft Reference",
      children: (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "New table"}
              size={"small"}
              dataSource={AncientAccessoryCraftMaterialTableV2}
              columns={columnsAccessory}
              pagination={false}
              bordered
            />
          </div>
          <div style={{ marginRight: 10, marginBottom: 10 }}>
            <Table
              title={() => "Old table"}
              size={"small"}
              dataSource={AncientAccessoryCraftMaterialTable}
              columns={columnsAccessory}
              pagination={false}
              bordered
            />
          </div>
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
      <Collapse items={items} size="small" defaultActiveKey={["4"]} />
    </div>
  );
};

export default AncientEqContent;
