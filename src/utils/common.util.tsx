import { Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableResource } from "../constants/Common.constants";
import { ITEM_RARITY_COLOR } from "../constants/InGame.color.constants";
import { ITEM_RARITY } from "../constants/InGame.constants";
const { Text } = Typography;

export const getColor = (type: ITEM_RARITY, custom?: string) => {
  switch (type) {
    case ITEM_RARITY.NORMAL:
      return ITEM_RARITY_COLOR.NORMAL;
    case ITEM_RARITY.MAGIC:
      return ITEM_RARITY_COLOR.MAGIC;
    case ITEM_RARITY.RARE:
      return ITEM_RARITY_COLOR.RARE;
    case ITEM_RARITY.EPIC:
      return ITEM_RARITY_COLOR.EPIC;
    case ITEM_RARITY.UNIQUE:
      return ITEM_RARITY_COLOR.UNIQUE;
    case ITEM_RARITY.LEGEND:
      return ITEM_RARITY_COLOR.LEGEND;
    case ITEM_RARITY.ANCIENT:
      return ITEM_RARITY_COLOR.ANCIENT;

    default:
      return custom ?? ITEM_RARITY_COLOR.CRAFT;
  }
};

export const getBDTalisFd = (type: ITEM_RARITY) => {
  switch (type) {
    case ITEM_RARITY.UNIQUE:
      return [0, 149, 298];
    case ITEM_RARITY.LEGEND:
      return [149, 298, 447];
    case ITEM_RARITY.ANCIENT:
      return [298, 447, 596];

    default:
      return [];
  }
};

export const getTextEmpty = ({
  txt,
  tailText,
  customChange,
}: {
  txt: string | number | undefined;
  tailText?: string;
  customChange?: string;
}) => {
  return txt ? `${txt.toLocaleString()}${tailText ?? ""}` : customChange ?? "-";
};

export function getComparedData<T>(arr: Array<T>, min: number, max: number) {
  const dt1 = arr.length >= min ? arr[min - 1] : undefined;
  const dt2 = arr.length >= max ? arr[max - 1] : undefined;
  return { dt1, dt2 };
}

export const columnsResource: ColumnsType<TableResource> = [
  {
    title: "Materials",
    dataIndex: "mats",
    render: (_, { mats, customLabel }) => (
      <Text
        key={`col-resource-name-${mats}`}
        style={{ color: customLabel?.lunarStyle?.color ?? undefined }}
      >
        {mats}
      </Text>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    width: 150,
    render: (_, { amount, mats }) => (
      <Text key={`col-resource-value-${mats}`}>{amount.toLocaleString()}</Text>
    ),
  },
];

export const copyTextToClipboard = async (txt: string) => {
  try {
    await navigator.clipboard.writeText(txt);
    console.log("Content copied to clipboard");
    // messageApi.open({
    //   type: 'success',
    //   content: 'This is a success message',
    // });
  } catch (err) {
    console.error("Failed to copy: ", err);
    // messageApi.open({
    //   type: 'error',
    //   content: 'This is an error message',
    // });
  }
};
