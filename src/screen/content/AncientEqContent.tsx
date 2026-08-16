import { Alert, Collapse, CollapseProps, Divider, Radio, Select, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import CalcCard from "../../components/CalcCard";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentTable from "../../components/EquipmentTable";
import MaterialListTable from "../../components/MaterialListTable";
import RangeFromTo from "../../components/RangeFromTo";
import { EQUIPMENT } from "../../constants/InGame.constants";
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

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const showWarningAcc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (
        !flag &&
        found &&
        (found.equipment === EQUIPMENT.NECKLACE ||
          found.equipment === EQUIPMENT.EARRING ||
          found.equipment === EQUIPMENT.RING1)
      ) {
        if (found.from > 10 || found.to > 10) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  const tableResource: TableMaterialList = useMemo(() => {
    let temp: TableMaterialList = {
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
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.map((item) => {
      const found = dataSource.find((dt) => dt.key === item);

      if (found) {
        const { equipment, from, to, max, min } = found;
        let tempSlice: AncientArmorCraftMaterial[] = [];
        switch (equipment) {
          case EQUIPMENT.HELM:
          case EQUIPMENT.UPPER:
          case EQUIPMENT.LOWER:
          case EQUIPMENT.GLOVE:
          case EQUIPMENT.SHOES:
            tempSlice = (
              selectVersion === versionOpt[0].value
                ? AncientArmorCraftMaterialTableV2
                : AncientArmorCraftMaterialTable
            ).slice(from, to);
            break;
          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            tempSlice = (
              selectVersion === versionOpt[0].value
                ? AncientWeaponT2CraftMaterialTableV2
                : AncientWeaponT2CraftMaterialTable
            ).slice(from, to);
            break;
          case EQUIPMENT.NECKLACE:
          case EQUIPMENT.EARRING:
          case EQUIPMENT.RING1:
            tempSlice = (
              selectVersion === versionOpt[0].value
                ? AncientAccessoryCraftMaterialTableV2
                : AncientAccessoryCraftMaterialTable
            ).slice(from, to);
            break;

          default:
            break;
        }

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

        temp["Ancient Knowledge"] += tempAncKnowledge;
        temp["Ancient Insignia"] += tempAncInsignia;
        temp["Gold"] += tempGold;
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
          case EQUIPMENT.MAIN_WEAPON:
          case EQUIPMENT.SECOND_WEAPON:
            temp["Otherworldly Ancient Weapon Fragment"] += tempFragment;
            break;
          case EQUIPMENT.NECKLACE:
          case EQUIPMENT.EARRING:
          case EQUIPMENT.RING1:
            temp["Unknown Ancient Accessory Fragment"] += tempFragment;
            break;

          default:
            break;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc, selectVersion]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <CalcCard>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
            customLabeling={(item) => `${item}`}
          />
        </CalcCard>
        <CalcCard>
          {invalidDtSrc && (
            <div>
              <Alert
                banner
                message="From cannot exceed the To option"
                type="error"
              />
            </div>
          )}
          {showWarningAcc && (
            <div>
              <Alert
                banner
                message="From +11 onward, your accessory might break"
                type="warning"
              />
            </div>
          )}
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            Version
            <Divider type="vertical" />
            <Select
              defaultValue={selectVersion}
              style={{ width: 120 }}
              onChange={(val) => {
                setSelectVersion(val);
              }}
              options={versionOpt}
            />
          </div>
          <div style={{ marginBottom: 4 }}>
            Spesific Type
            <Divider type="vertical" />
            <Radio.Group
              value={selectedRowKeys}
              onChange={(e) => {
                setSelectedRowKeys(e.target.value);
              }}
            >
              <Radio.Button
                value={["1", "2", "3", "4", "5"]}
                onClick={() => setSelectedRowKeys(["1", "2", "3", "4", "5"])}
              >
                Armor
              </Radio.Button>
              <Radio.Button
                value={["6", "7"]}
                onClick={() => setSelectedRowKeys(["6", "7"])}
              >
                Weapon
              </Radio.Button>
              <Radio.Button
                value={["8", "9", "10", "11"]}
                onClick={() => setSelectedRowKeys(["8", "9", "10", "11"])}
              >
                Accessories
              </Radio.Button>
            </Radio.Group>
          </div>
          <RangeFromTo
            from={selectFrom}
            to={selectTo}
            onFromChange={setSelectFrom}
            onToChange={setSelectTo}
            max={20}
            customLabeling={(item) => `${item}`}
          />
          <MaterialListTable data={tableResource} />
        </CalcCard>
      </div>
    );
  };

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
