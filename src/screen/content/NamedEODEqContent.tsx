import { Checkbox, Divider, Tooltip } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import { useCallback, useMemo, useState } from "react";
import CalcCard from "../../components/CalcCard";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentTable from "../../components/EquipmentTable";
import FlagAlert from "../../components/FlagAlert";
import ListingCard from "../../components/ListingCard";
import MaterialListTable from "../../components/MaterialListTable";
import StatReferenceTables from "../../components/StatReferenceTables";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
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
import { CommonItemStats } from "../../interface/ItemStat.interface";
import { getStatDif } from "../../utils/common.util";

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

  const tableResource: NamedEODTableMaterialList = useMemo(() => {
    const temp: NamedEODTableMaterialList = {
      "Guide Star": 0,
      "Twilight Essence": 0,
      Gold: 0,
    };
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const tempSlice = NamedEODMaterialTable.slice(found.from, found.to);
        tempSlice.forEach((slicedItem) => {
          temp["Guide Star"] += slicedItem.guideStar;
          temp["Twilight Essence"] += slicedItem.twilightEssence;
          temp["Gold"] += slicedItem.gold;
        });
        if (checkedCraft) {
          temp["Guide Star"] += 10;
          temp["Twilight Essence"] += 80;
          temp["Gold"] += 25;
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc, checkedCraft]);

  const getNamedEODStatsTable = useCallback(
    (equipment: EQUIPMENT): CommonItemStats[] =>
      equipment === EQUIPMENT.MAIN_WEAPON
        ? NamedEODMainStatTable
        : NamedEODSecondStatTable,
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

  const getCalculator = () => {
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <CalcCard>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </CalcCard>
        <CalcCard>
          <FlagAlert
            show={invalidDtSrc}
            message="From cannot exceed the To option"
            type="error"
          />
          <Divider orientation="left">Settings</Divider>
          <div style={{ marginBottom: 4 }}>
            <Divider type="vertical" />
            <Checkbox
              checked={checkedCraft}
              onChange={(e) => setCheckedCraft(e.target.checked)}
            >
              <Tooltip
                title="10 guide star, 80 Twilight Essence, 25 gold per weapon"
                trigger="hover"
                color="blue"
                placement="right"
              >
                Include Craft Mats
              </Tooltip>
            </Checkbox>
          </div>
          <MaterialListTable data={tableResource} />
        </CalcCard>
        <CalcCard>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </CalcCard>
      </div>
    );
  };

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
