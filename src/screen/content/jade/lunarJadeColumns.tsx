import { Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  LunarFragmentData,
  LunarJadeCraftAmount,
  LunarJadeCraftMaterial,
  LunarJadeEnhanceMaterial,
  LunarJadeEnhancementMats,
} from "../../../interface/Item.interface";
import { getColor } from "../../../utils/common.util";

const { Text } = Typography;
export interface TableLunarResource {
  lunarFragment: LunarFragmentData;
  amountFragment: number;
  amountHGFragment: number;
}

// Reference/result table columns for the Lunar Jade screen. Kept out of the
// screen file so it holds the calculators, not ~450 lines of column JSX.
export const columnsResourceLunar: ColumnsType<TableLunarResource> = [
  {
    title: "Fragment Mat",
    dataIndex: "lunarFragment",
    render: (_, { lunarFragment }) => (
      <div>
        <Text style={{ color: lunarFragment.color, marginRight: 5 }}>
          {lunarFragment.type}
        </Text>
      </div>
    ),
  },
  {
    title: "Fragment",
    dataIndex: "amountFragment",
    width: 150,
    render: (_, { amountFragment }) => (
      <Text>{amountFragment.toLocaleString()}</Text>
    ),
  },
  {
    title: "High Grade Fragment",
    dataIndex: "amountHGFragment",
    width: 150,
    render: (_, { amountHGFragment }) => (
      <Text>{amountHGFragment.toLocaleString()}</Text>
    ),
  },
];

export const getCraftAmountColumns = (
  colorText: string
): ColumnsType<LunarJadeCraftAmount> => [
  {
    title: "Stage Rarity",
    dataIndex: "rarity",
    width: 150,
    render: (_, { rarity }) => (
      <div>
        <Text style={{ color: getColor(rarity, colorText) }}>{rarity}</Text>
      </div>
    ),
  },
  {
    title: (
      <div>
        <p>Fragment</p>
        <p>High Grade Fragment</p>
        <p>Stigmata</p>
        <p>Gold</p>
        <p>Tiger Intact Orb</p>
        <p>Conc. Dim. Energy</p>
      </div>
    ),
    responsive: ["xs"],
    render: (
      _,
      {
        quantity,
        quantityHg,
        stigmata,
        gold,
        tigerIntactOrb,
        concentratedDimensionalEnergy,
      }
    ) => (
      <div>
        <p>{quantity}</p>
        <p>{quantityHg}(hg)</p>
        <p>{stigmata}(s)</p>
        <p>{gold}(g)</p>
        <p>{tigerIntactOrb}(Orb)</p>
        <p>{concentratedDimensionalEnergy}(Dim)</p>
      </div>
    ),
  },
  {
    title: "Fragment",
    dataIndex: "quantity",
    responsive: ["sm"],
  },
  {
    title: "High Grade Fragment",
    dataIndex: "quantityHg",
    responsive: ["sm"],
  },
  {
    title: "Stigmata",
    dataIndex: "stigmata",
    responsive: ["sm"],
  },
  {
    title: "Gold",
    dataIndex: "gold",
    responsive: ["sm"],
  },
  {
    title: "Tiger Intact Orb",
    dataIndex: "tigerIntactOrb",
    responsive: ["sm"],
  },
  {
    title: "Conc. Dim. Energy",
    dataIndex: "concentratedDimensionalEnergy",
    responsive: ["sm"],
  },
];

export const columnsCraft: ColumnsType<LunarJadeCraftMaterial> = [
  {
    title: "Equipment",
    dataIndex: "equipmentType",
    width: 150,
  },
  {
    title: "Fragment Mat",
    dataIndex: "lunarFragment",
    render: (_, { lunarFragment }) => (
      <div>
        {lunarFragment.map((item) => (
          <Text key={item.type} style={{ color: item.color, marginRight: 5 }}>
            {item.type}
          </Text>
        ))}
      </div>
    ),
  },
];

export const columnsEnhance: ColumnsType<LunarJadeEnhanceMaterial> = [
  {
    title: "Jade Type",
    dataIndex: "jadeType",
    width: 150,
  },
  {
    title: "Fragment Mat",
    dataIndex: "lunarFragment",
    render: (_, { lunarFragment }) => (
      <div>
        {lunarFragment.map((item) => (
          <Text key={item.type} style={{ color: item.color, marginRight: 5 }}>
            {item.type}
          </Text>
        ))}
      </div>
    ),
  },
];

export const getMatsCol = (
  isAttack?: boolean
): ColumnsType<LunarJadeEnhancementMats> => [
  {
    title: "Enhancement",
    dataIndex: "encLevel",
  },
  {
    title: (
      <div>
        <p>Stigmata</p>
        {isAttack ? <p>Crystal</p> : <p>Remains</p>}
        <p>High Grade Fragment</p>
        <p>Gold</p>
      </div>
    ),
    responsive: ["xs"],
    render: (_, { stigmata, crystal, remains, gold, hgFragment }) => (
      <div>
        <p>{stigmata.toLocaleString()} (s)</p>
        {isAttack ? (
          <p>{crystal.toLocaleString()} (crs)</p>
        ) : (
          <p>{remains.toLocaleString()} (rem)</p>
        )}
        <p>{hgFragment.toLocaleString()} (hg frag)</p>
        <p>{gold.toLocaleString()} (g)</p>
      </div>
    ),
  },
  {
    title: "Stigmata",
    dataIndex: "stigmata",
    responsive: ["sm"],
    render: (_, { stigmata }) => <Text>{stigmata.toLocaleString()}</Text>,
  },
  ...(isAttack
    ? ([
        {
          title: "Crystal",
          dataIndex: "crystal",
          responsive: ["sm"],
          render: (_, { crystal }) => <Text>{crystal.toLocaleString()}</Text>,
        },
      ] as ColumnsType<LunarJadeEnhancementMats>)
    : ([
        {
          title: "Remains",
          dataIndex: "remains",
          responsive: ["sm"],
          render: (_, { remains }) => <Text>{remains.toLocaleString()}</Text>,
        },
      ] as ColumnsType<LunarJadeEnhancementMats>)),
  {
    title: "High Grade Fragment",
    dataIndex: "hgFragment",
    responsive: ["sm"],
    render: (_, { hgFragment }) => <Text>{hgFragment.toLocaleString()}</Text>,
  },
  {
    title: "Gold",
    dataIndex: "gold",
    responsive: ["sm"],
    render: (_, { gold }) => <Text>{gold.toLocaleString()}</Text>,
  },
];
