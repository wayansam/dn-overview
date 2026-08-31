import { Collapse, CollapseProps } from "antd";
import { SliderMarks } from "antd/es/slider";
import Table, { ColumnsType } from "antd/es/table";
import { useCallback, useState } from "react";
import JadeCalculatorPanel from "../../../components/JadeCalculatorPanel";
import { useRangeAccumulator } from "../../../hooks/useJadeCalculator";
import { ErosionConquerorJadeMaterialTable } from "../../../data/jade/ErosionData";
import { ErosionConquerorJadeMaterial } from "../../../interface/Item.interface";

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

const emptyErosionMats: ErosionConquerorTableMaterialList = {
  "Erosion Fragment": 0,
  "Gold Lotus Crown": 0,
  Gold: 0,
};

const ErosionJadeContent = () => {
  const [erosionData, setErosionData] = useState<[number, number]>([0, 10]);
  const [checkedCraft, setCheckedCraft] = useState(false);
  const [checkedTier, setCheckedTier] = useState(false);

  const columnsMats: ColumnsType<ErosionConquerorJadeMaterial> = [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          <p>Erosion Fragment</p>
          <p>Gold Lotus Crown</p>
          <p>Gold</p>
        </div>
      ),
      responsive: ["xs"],
      render: (_, { erosionFragment, goldLotusCrown, gold }) => (
        <div>
          <p>{erosionFragment}(Fragment)</p>
          <p>{goldLotusCrown}(Crown)</p>
          <p>{gold}(g)</p>
        </div>
      ),
    },
    {
      title: "Erosion Fragment",
      dataIndex: "erosionFragment",
      responsive: ["sm"],
    },
    {
      title: "Gold Lotus Crown",
      dataIndex: "goldLotusCrown",
      responsive: ["sm"],
    },
    {
      title: "Gold",
      dataIndex: "gold",
      responsive: ["sm"],
    },
  ];

  const reduceErosionSlice = useCallback(
    (
      acc: ErosionConquerorTableMaterialList,
      slice: ErosionConquerorJadeMaterial[]
    ): ErosionConquerorTableMaterialList => {
      const next = { ...acc };
      slice.forEach((slicedItem) => {
        next["Erosion Fragment"] += slicedItem.erosionFragment;
        next["Gold Lotus Crown"] += slicedItem.goldLotusCrown;
        next.Gold += slicedItem.gold;
      });
      return next;
    },
    []
  );

  const finalizeErosionMats = useCallback(
    (
      acc: ErosionConquerorTableMaterialList,
      ctx: { checkedCraft: boolean; checkedTier: boolean }
    ): ErosionConquerorTableMaterialList => {
      const next = { ...acc };
      if (ctx.checkedCraft) {
        next["Erosion Fragment"] += 10;
        next.Gold += 10000;
      }
      if (ctx.checkedTier) {
        next["Erosion Fragment"] += 100;
        next.Gold += 10000;
      }
      return next;
    },
    []
  );

  const ancDataSource = useRangeAccumulator(
    erosionData,
    false,
    ErosionConquerorJadeMaterialTable,
    emptyErosionMats,
    reduceErosionSlice,
    { checkedCraft, checkedTier },
    finalizeErosionMats
  );

  const getCalc = () => (
    <JadeCalculatorPanel
      rangeSlider={{
        value: erosionData,
        onChange: (value) => setErosionData(value as [number, number]),
        max: 20,
        marks,
      }}
      toggles={[
        {
          key: "craft",
          label: "Include 1st shop Mats",
          tooltip: "10 fragment, 10k gold",
          checked: checkedCraft,
          onChange: setCheckedCraft,
        },
        {
          key: "tier",
          label: "Include Tier 2 evolve",
          tooltip: "+20 tier 1, 100 fragment, 10k gold",
          checked: checkedTier,
          onChange: setCheckedTier,
        },
      ]}
      mats={{ data: ancDataSource }}
    />
  );

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
