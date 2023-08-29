import { LUNAR_JADE_RARITY_COLOR } from "../constants/InGame.color.constants";
import { LUNAR_JADE_RARITY } from "../constants/InGame.constants";

export const getColor = (type: LUNAR_JADE_RARITY) => {
    switch (type) {
        case LUNAR_JADE_RARITY.NORMAL:
            return LUNAR_JADE_RARITY_COLOR.NORMAL
        case LUNAR_JADE_RARITY.MAGIC:
            return LUNAR_JADE_RARITY_COLOR.MAGIC
        case LUNAR_JADE_RARITY.RARE:
            return LUNAR_JADE_RARITY_COLOR.RARE
        case LUNAR_JADE_RARITY.EPIC:
            return LUNAR_JADE_RARITY_COLOR.EPIC
        case LUNAR_JADE_RARITY.UNIQUE:
            return LUNAR_JADE_RARITY_COLOR.UNIQUE
        case LUNAR_JADE_RARITY.LEGEND:
            return LUNAR_JADE_RARITY_COLOR.LEGEND

        default:
            return LUNAR_JADE_RARITY_COLOR.CRAFT
    }
}