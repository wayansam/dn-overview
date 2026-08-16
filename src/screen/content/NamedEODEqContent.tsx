import { Alert, Checkbox, Divider, Tooltip } from "antd";
import Collapse, { CollapseProps } from "antd/es/collapse";
import Table from "antd/es/table";
import { useMemo, useState } from "react";
import { makeCraftMaterialColumns } from "../../components/CraftMaterialColumns";
import EquipmentTable from "../../components/EquipmentTable";
import ListingCard from "../../components/ListingCard";
import { EmptyCommonnStat } from "../../constants/Common.constants";
import { EQUIPMENT } from "../../constants/InGame.constants";
import {
  dataNamedEODCalculator,
  NamedEODMainStatTable,
  NamedEODMaterialTable,
  NamedEODSecondStatTable,
} from "../../data/NamedEODData";
import { CommonEquipmentCalculator } from "../../interface/Common.interface";
import { NamedEODMaterial } from "../../interface/Item.interface";
import { CommonItemStats } from "../../interface/ItemStat.interface";
import {
  columnsResource,
  combineEqStats,
  getColumnsStats,
  getComparedData,
  getStatDif,
} from "../../utils/common.util";

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

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found && found.to <= found.from) {
        flag = true;
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

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

  const statDif: CommonItemStats = useMemo(() => {
    let temp: CommonItemStats = { ...EmptyCommonnStat };
    if (invalidDtSrc) {
      return temp;
    }
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (found) {
        const { equipment, from, to } = found;
        const tableHolder =
          equipment === EQUIPMENT.MAIN_WEAPON
            ? NamedEODMainStatTable
            : NamedEODSecondStatTable;
        const { dt1, dt2 } = getComparedData(tableHolder, from + 1, to + 1);
        if (dt2) {
          const dt = dt1 ? combineEqStats(dt2, dt1, "minus") : dt2;
          temp = combineEqStats(temp, dt, "add");
        }
      }
    });
    return temp;
  }, [selectedRowKeys, dataSource, invalidDtSrc]);

  const getStatContent = () => {
    const columnsStats = getColumnsStats({
      phyMagAtkMinFlag: true,
      phyMagAtkMaxFlag: true,
      phyMagAtkPercentFlag: true,
      crtFlag: true,
      cdmFlag: true,
    });
    const itemStat: CollapseProps["items"] = [
      {
        key: "1",
        label: "Main Weapon",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={NamedEODMainStatTable}
            columns={columnsStats}
            pagination={false}
            bordered
          />
        ),
      },
      {
        key: "2",
        label: "Second Weapon",
        children: (
          <Table
            style={{ marginRight: 10, marginBottom: 10 }}
            size={"small"}
            dataSource={NamedEODSecondStatTable}
            columns={columnsStats}
            pagination={false}
            bordered
          />
        ),
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        <Collapse items={itemStat} size="small" />
      </div>
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
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <EquipmentTable
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            dataSource={dataSource}
            setDataSource={setDataSource}
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          {invalidDtSrc && (
            <div>
              <Alert
                banner
                message="From cannot exceed the To option"
                type="error"
              />
            </div>
          )}
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
          <Divider orientation="left">Material List</Divider>
          <Table
            size={"small"}
            dataSource={Object.entries(tableResource).map(([key, value]) => ({
              mats: key,
              amount: value,
            }))}
            columns={columnsResource}
            pagination={false}
            bordered
          />
        </div>
        <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
          <ListingCard title="Status Increase" data={getStatDif(statDif)} />
        </div>
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
