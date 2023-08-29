import { LUNAR_FRAGMENT_TYPE_COLOR } from "../constants/InGame.color.constants";
import { EQUIPMENT, LUNAR_FRAGMENT_TYPE, LUNAR_JADE_RARITY } from "../constants/InGame.constants";
import { LunarJadeCalculator } from "../interface/Common.interface";
import { LunarFragment, LunarFragmentData, LunarJadeCraftAmount, LunarJadeCraftMaterial } from "../interface/Item.interface";

export const LunarJadeCraftAmountTable: LunarJadeCraftAmount[] = [
    { rarity: LUNAR_JADE_RARITY.CRAFT, quantity: 0 },
    { rarity: LUNAR_JADE_RARITY.NORMAL, quantity: 100 },
    { rarity: LUNAR_JADE_RARITY.MAGIC, quantity: 300 },
    { rarity: LUNAR_JADE_RARITY.RARE, quantity: 1500 },
    { rarity: LUNAR_JADE_RARITY.EPIC, quantity: 6300 },
    { rarity: LUNAR_JADE_RARITY.UNIQUE, quantity: 25500 },
    { rarity: LUNAR_JADE_RARITY.LEGEND, quantity: 102300 },
]

export const LunarFragmentList: LunarFragment = {
    holy: {
        type: LUNAR_FRAGMENT_TYPE.HOLY,
        color: LUNAR_FRAGMENT_TYPE_COLOR.HOLY
    },
    crystal: {
        type: LUNAR_FRAGMENT_TYPE.CRYSTAL,
        color: LUNAR_FRAGMENT_TYPE_COLOR.CRYSTAL
    },
    burning: {
        type: LUNAR_FRAGMENT_TYPE.BURNING,
        color: LUNAR_FRAGMENT_TYPE_COLOR.BURNING
    },
    pitch: {
        type: LUNAR_FRAGMENT_TYPE.PITCH,
        color: LUNAR_FRAGMENT_TYPE_COLOR.PITCH
    },
    tailwind: {
        type: LUNAR_FRAGMENT_TYPE.TAILWIND,
        color: LUNAR_FRAGMENT_TYPE_COLOR.TAILWIND
    },
    ardent: {
        type: LUNAR_FRAGMENT_TYPE.ARDENT,
        color: LUNAR_FRAGMENT_TYPE_COLOR.ARDENT
    }
}


export const LunarJadeCraftMaterialList: LunarJadeCraftMaterial[] = [
    {
        equipmentType: EQUIPMENT.HELM,
        lunarFragment: [LunarFragmentList.holy, LunarFragmentList.crystal]
    },
    {
        equipmentType: EQUIPMENT.UPPER,
        lunarFragment: [LunarFragmentList.crystal, LunarFragmentList.burning]
    },
    {
        equipmentType: EQUIPMENT.LOWER,
        lunarFragment: [LunarFragmentList.burning, LunarFragmentList.pitch]
    },
    {
        equipmentType: EQUIPMENT.GLOVE,
        lunarFragment: [LunarFragmentList.pitch, LunarFragmentList.tailwind]
    },
    {
        equipmentType: EQUIPMENT.SHOES,
        lunarFragment: [LunarFragmentList.tailwind, LunarFragmentList.ardent]
    },
    {
        equipmentType: EQUIPMENT.MAIN_WEAPON,
        lunarFragment: [LunarFragmentList.holy, LunarFragmentList.crystal, LunarFragmentList.ardent]
    },
    {
        equipmentType: EQUIPMENT.SECOND_WEAPON,
        lunarFragment: [LunarFragmentList.holy, LunarFragmentList.crystal, LunarFragmentList.pitch]
    },
    {
        equipmentType: EQUIPMENT.NECKLACE,
        lunarFragment: [LunarFragmentList.holy, LunarFragmentList.ardent]
    },
    {
        equipmentType: EQUIPMENT.EARRING,
        lunarFragment: [LunarFragmentList.burning, LunarFragmentList.tailwind]
    },
    {
        equipmentType: EQUIPMENT.RING,
        lunarFragment: [LunarFragmentList.holy, LunarFragmentList.pitch]
    },
]

