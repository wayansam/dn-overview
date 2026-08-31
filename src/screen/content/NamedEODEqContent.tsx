import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import { useCallback, useState } from "react";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentCalculatorPanel from "../../components/EquipmentCalculatorPanel";
import StatReferenceTables from "../../components/StatReferenceTables";
import { TAB_KEY } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  useEquipmentAccumulator,
  useEquipmentStatDiff,
  useInvalidRange,
} from "../../hooks/useEquipmentCalculator";
import {
  dataNamedEODCalculator,
  NamedEODMainStatTable,
  NamedEODMaterialTable,
  NamedEODSecondStatTable,
} from "../../data/NamedEODData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { NamedEODMaterial } from "../../interface/Item.interface";
import { getResource } from "../../utils/resource.util";

interface NamedEODTableMaterialList {
  "Guide Star": number;
  "Twilight Essence": number;
  Gold: number;
}

const NamedEODEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<CommonEquipmentCalculator[]>(
    dataNamedEODCalculator
  );
  const [checkedCraft, setCheckedCraft] = useState(false);

  const columnsMats = makeCraftMaterialColumns<NamedEODMaterial>([
    { dataIndex: "guideStar", label: "Guide Star", shortLabel: "(gs)" },
    {
      dataIndex: "twilightEssence",
      label: "Twilight Essence",
      shortLabel: "(ess)",
    },
    { dataIndex: "gold", label: "Gold", shortLabel: "(g)" },
  ]);

  const invalidDtSrc = useInvalidRange(selectedRowKeys, dataSource);

  const getNamedEODMatsTable = useCallback(
    (): NamedEODMaterial[] => NamedEODMaterialTable,
    []
  );

  const emptyNamedEODMats: NamedEODTableMaterialList = {
    "Guide Star": 0,
    "Twilight Essence": 0,
    Gold: 0,
  };

  const reduceNamedEODRow = useCallback(
    (
      acc: NamedEODTableMaterialList,
      slice: NamedEODMaterial[]
    ): NamedEODTableMaterialList => {
      const next = { ...acc };
      slice.forEach((slicedItem) => {
        next["Guide Star"] += slicedItem.guideStar;
        next["Twilight Essence"] += slicedItem.twilightEssence;
        next.Gold += slicedItem.gold;
      });
      if (checkedCraft) {
        next["Guide Star"] += 10;
        next["Twilight Essence"] += 80;
        next.Gold += 25;
      }
      return next;
    },
    [checkedCraft]
  );

  const tableResource = useEquipmentAccumulator(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getNamedEODMatsTable,
    emptyNamedEODMats,
    reduceNamedEODRow
  );

  const getNamedEODStatsTable = useCallback(
    (equipment: EQUIPMENT) => getResource(TAB_KEY.eqNamedEOD, equipment),
    []
  );

  const statDif = useEquipmentStatDiff(
    selectedRowKeys,
    dataSource,
    invalidDtSrc,
    getNamedEODStatsTable
  );

  const getStatContent = () => {
    const flags = {
      phyMagAtkMinFlag: true,
      phyMagAtkMaxFlag: true,
      phyMagAtkPercentFlag: true,
      crtFlag: true,
      cdmFlag: true,
    };
    return (
      <StatReferenceTables
        entries={[
          {
            key: "1",
            label: "Main Weapon",
            dataSource: NamedEODMainStatTable,
            flags,
          },
          {
            key: "2",
            label: "Second Weapon",
            dataSource: NamedEODSecondStatTable,
            flags,
          },
        ]}
      />
    );
  };

  const getMatsContent = () => {
    return (
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
    );
  };

  const getCalculator = () => (
    <EquipmentCalculatorPanel
      selectedRowKeys={selectedRowKeys}
      setSelectedRowKeys={setSelectedRowKeys}
      dataSource={dataSource}
      setDataSource={setDataSource}
      invalid={invalidDtSrc}
      toggles={[
        {
          key: "craft",
          label: "Include Craft Mats",
          tooltip: "10 guide star, 80 Twilight Essence, 25 gold per weapon",
          checked: checkedCraft,
          onChange: setCheckedCraft,
        },
      ]}
      mats={{ data: tableResource }}
      stats={{ statDif }}
    />
  );

  const items: CollapseProps["items"] = [
    {
      key: "1",
      label: "Stats - Named EOD",
      children: getStatContent(),
    },
    {
      key: "2",
      label: "Mats - Named EOD",
      children: getMatsContent(),
    },
    {
      key: "3",
      label: "Calculate - Named EOD",
      children: getCalculator(),
    },
  ];
  return (
    <div>
      <Collapse items={items} size="small" defaultActiveKey={["3"]} />
    </div>
  );
};

export default NamedEODEqContent;
