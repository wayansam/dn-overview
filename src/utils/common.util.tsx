import { ITEM_RARITY_COLOR } from "../constants/InGame.color.constants";
import { ITEM_RARITY } from "../constants/InGame.constants";

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
  return txt ? `${txt}${tailText ?? ""}` : customChange ?? "-";
};
