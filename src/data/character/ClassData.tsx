import {
  CHARACTER_2NDJOB,
  CHARACTER_CLASS,
  SKILL_SLOT,
} from "../../constants/InGame.constants";
import { ClassInfo, ClassSkill } from "../../interface/Account.interface";

// Class ids are persisted in localStorage (Character.classId), so never
// rename or reuse an existing id — add a new one instead.
export const ClassData: ClassInfo[] = [
  // Warrior
  { id: "gladiator", name: "Gladiator", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.SWORDSMAN },
  { id: "moonlord", name: "Moonlord", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.SWORDSMAN },
  { id: "barbarian", name: "Barbarian", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.MERCENARY },
  { id: "destroyer", name: "Destroyer", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.MERCENARY },
  { id: "dark-avenger", name: "Dark Avenger", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.AVENGER },
  { id: "mystic-knight", name: "Mystic Knight", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.KNIGHT },
  { id: "grand-master", name: "Grand Master", baseClass: CHARACTER_CLASS.WARRIOR, secondJob: CHARACTER_2NDJOB.KNIGHT },
  // Archer
  { id: "sniper", name: "Sniper", baseClass: CHARACTER_CLASS.ARCHER, secondJob: CHARACTER_2NDJOB.BOWMASTER },
  { id: "artillery", name: "Artillery", baseClass: CHARACTER_CLASS.ARCHER, secondJob: CHARACTER_2NDJOB.BOWMASTER },
  { id: "tempest", name: "Tempest", baseClass: CHARACTER_CLASS.ARCHER, secondJob: CHARACTER_2NDJOB.ACROBAT },
  { id: "wind-walker", name: "Wind Walker", baseClass: CHARACTER_CLASS.ARCHER, secondJob: CHARACTER_2NDJOB.ACROBAT },
  { id: "silver-hunter", name: "Silver Hunter", baseClass: CHARACTER_CLASS.ARCHER, secondJob: CHARACTER_2NDJOB.HUNTER },
  // Sorceress
  { id: "saleana", name: "Saleana", baseClass: CHARACTER_CLASS.SORCERESS, secondJob: CHARACTER_2NDJOB.ELEMENTALLORD },
  { id: "elestra", name: "Elestra", baseClass: CHARACTER_CLASS.SORCERESS, secondJob: CHARACTER_2NDJOB.ELEMENTALLORD },
  { id: "smasher", name: "Smasher", baseClass: CHARACTER_CLASS.SORCERESS, secondJob: CHARACTER_2NDJOB.FORCEUSER },
  { id: "majesty", name: "Majesty", baseClass: CHARACTER_CLASS.SORCERESS, secondJob: CHARACTER_2NDJOB.FORCEUSER },
  { id: "black-mara", name: "Black Mara", baseClass: CHARACTER_CLASS.SORCERESS, secondJob: CHARACTER_2NDJOB.MARA },
  // Cleric
  { id: "guardian", name: "Guardian", baseClass: CHARACTER_CLASS.CLERIC, secondJob: CHARACTER_2NDJOB.PALADIN },
  { id: "crusader", name: "Crusader", baseClass: CHARACTER_CLASS.CLERIC, secondJob: CHARACTER_2NDJOB.PALADIN },
  { id: "saint", name: "Saint", baseClass: CHARACTER_CLASS.CLERIC, secondJob: CHARACTER_2NDJOB.PRIEST },
  { id: "inquisitor", name: "Inquisitor", baseClass: CHARACTER_CLASS.CLERIC, secondJob: CHARACTER_2NDJOB.PRIEST },
  { id: "arch-heretic", name: "Arch Heretic", baseClass: CHARACTER_CLASS.CLERIC, secondJob: CHARACTER_2NDJOB.HERETIC },
  // Academic
  { id: "shooting-star", name: "Shooting Star", baseClass: CHARACTER_CLASS.ACADEMIC, secondJob: CHARACTER_2NDJOB.ENGINEER },
  { id: "gear-master", name: "Gear Master", baseClass: CHARACTER_CLASS.ACADEMIC, secondJob: CHARACTER_2NDJOB.ENGINEER },
  { id: "adept", name: "Adept", baseClass: CHARACTER_CLASS.ACADEMIC, secondJob: CHARACTER_2NDJOB.ALCHEMIST },
  { id: "physician", name: "Physician", baseClass: CHARACTER_CLASS.ACADEMIC, secondJob: CHARACTER_2NDJOB.ALCHEMIST },
  { id: "ray-mechanic", name: "Ray Mechanic", baseClass: CHARACTER_CLASS.ACADEMIC, secondJob: CHARACTER_2NDJOB.MECHANIC },
  // Kali
  { id: "dark-summoner", name: "Dark Summoner", baseClass: CHARACTER_CLASS.KALI, secondJob: CHARACTER_2NDJOB.SCREAMER },
  { id: "soul-eater", name: "Soul Eater", baseClass: CHARACTER_CLASS.KALI, secondJob: CHARACTER_2NDJOB.SCREAMER },
  { id: "blade-dancer", name: "Blade Dancer", baseClass: CHARACTER_CLASS.KALI, secondJob: CHARACTER_2NDJOB.DANCER },
  { id: "spirit-dancer", name: "Spirit Dancer", baseClass: CHARACTER_CLASS.KALI, secondJob: CHARACTER_2NDJOB.DANCER },
  { id: "oracle-elder", name: "Oracle Elder", baseClass: CHARACTER_CLASS.KALI, secondJob: CHARACTER_2NDJOB.ORACLE },
  // Assassin
  { id: "ripper", name: "Ripper", baseClass: CHARACTER_CLASS.ASSASSIN, secondJob: CHARACTER_2NDJOB.CHASER },
  { id: "raven", name: "Raven", baseClass: CHARACTER_CLASS.ASSASSIN, secondJob: CHARACTER_2NDJOB.CHASER },
  { id: "light-fury", name: "Light Fury", baseClass: CHARACTER_CLASS.ASSASSIN, secondJob: CHARACTER_2NDJOB.BRINGER },
  { id: "abyss-walker", name: "Abyss Walker", baseClass: CHARACTER_CLASS.ASSASSIN, secondJob: CHARACTER_2NDJOB.BRINGER },
  { id: "bleed-phantom", name: "Bleed Phantom", baseClass: CHARACTER_CLASS.ASSASSIN, secondJob: CHARACTER_2NDJOB.PHANTOM },
  // Lancea
  { id: "flurry", name: "Flurry", baseClass: CHARACTER_CLASS.LANCEA, secondJob: CHARACTER_2NDJOB.PIERCER },
  { id: "sting-breezer", name: "Sting Breezer", baseClass: CHARACTER_CLASS.LANCEA, secondJob: CHARACTER_2NDJOB.PIERCER },
  { id: "avalanche", name: "Avalanche", baseClass: CHARACTER_CLASS.LANCEA, secondJob: CHARACTER_2NDJOB.KNIGHTESS },
  { id: "randgrid", name: "Randgrid", baseClass: CHARACTER_CLASS.LANCEA, secondJob: CHARACTER_2NDJOB.KNIGHTESS },
  { id: "vena-plaga", name: "Vena Plaga", baseClass: CHARACTER_CLASS.LANCEA, secondJob: CHARACTER_2NDJOB.PLAGA },
  // Machina
  { id: "defensio", name: "Defensio", baseClass: CHARACTER_CLASS.MACHINA, secondJob: CHARACTER_2NDJOB.PATRONA },
  { id: "ruina", name: "Ruina", baseClass: CHARACTER_CLASS.MACHINA, secondJob: CHARACTER_2NDJOB.PATRONA },
  { id: "impactor", name: "Impactor", baseClass: CHARACTER_CLASS.MACHINA, secondJob: CHARACTER_2NDJOB.LAUNCHER },
  { id: "luster", name: "Luster", baseClass: CHARACTER_CLASS.MACHINA, secondJob: CHARACTER_2NDJOB.LAUNCHER },
  { id: "beastia-reina", name: "Beastia Reina", baseClass: CHARACTER_CLASS.MACHINA, secondJob: CHARACTER_2NDJOB.BEASTIA },
  // Vandar
  { id: "duelist", name: "Duelist", baseClass: CHARACTER_CLASS.VANDAR, secondJob: CHARACTER_2NDJOB.TREASUREHUNTER },
  { id: "trickster", name: "Trickster", baseClass: CHARACTER_CLASS.VANDAR, secondJob: CHARACTER_2NDJOB.TREASUREHUNTER },
  { id: "revenant", name: "Revenant", baseClass: CHARACTER_CLASS.VANDAR, secondJob: CHARACTER_2NDJOB.WANDERER },
  { id: "maverick", name: "Maverick", baseClass: CHARACTER_CLASS.VANDAR, secondJob: CHARACTER_2NDJOB.WANDERER },
  { id: "lux-ascendant", name: "Lux Ascendant", baseClass: CHARACTER_CLASS.VANDAR, secondJob: CHARACTER_2NDJOB.ASCENDANT },
  // Arta
  { id: "ring-master", name: "Ring Master", baseClass: CHARACTER_CLASS.ARTA, secondJob: CHARACTER_2NDJOB.ARTIST },
];

// Column order of each classSkills() entry below.
const SKILL_SLOT_ORDER: { slot: SKILL_SLOT; key: string }[] = [
  { slot: SKILL_SLOT.MASTERY3, key: "mastery3" },
  { slot: SKILL_SLOT.ULTIMATE1, key: "ultimate1" },
  { slot: SKILL_SLOT.EX50, key: "ex50" },
  { slot: SKILL_SLOT.SECONDARY, key: "secondary" },
  { slot: SKILL_SLOT.MAIN, key: "main" },
];

const classSkills = (
  classId: string,
  names: [string, string, string, string, string],
): ClassSkill[] =>
  SKILL_SLOT_ORDER.map(({ slot, key }, idx) => ({
    id: `${classId}-${key}`,
    classId,
    slot,
    name: names[idx],
  }));

// Order per class: Mastery 3, 1st Ultimate, 2nd Lv.50 EX, Secondary, Main.
// Skill names are not unique across classes (e.g. Divine Combo), so each
// row belongs to exactly one class.
export const SkillData: ClassSkill[] = [
  ...classSkills("gladiator", ["Heavy Slash", "Infinity Edge", "Finish Attack", "Dash Slash", "Deep Straight"]),
  ...classSkills("moonlord", ["Impact Wave", "Great Wave", "Moon Blade Dance", "Provoking Slam", "Moonlight Splitter"]),
  ...classSkills("barbarian", ["Impact Punch", "Wheel Typhoon", "Bone Crash", "Dash Upper", "Circle Swing"]),
  ...classSkills("destroyer", ["Circle Break", "Gigantic Bomb", "Maelstrom Howl", "Soccer Kick Combo", "Circle Bombs"]),
  ...classSkills("dark-avenger", ["Rising Slash", "Death Knell", "Dark Crash", "Dark Riser", "Graves"]),
  ...classSkills("mystic-knight", ["Beat Crush", "Battle Master", "Over Line", "Dive Comet", "Rash Upper"]),
  ...classSkills("grand-master", ["Avoid Shot", "Dreadnought", "Crossover", "Assault Slash", "Wind Breaker"]),
  ...classSkills("sniper", ["Piercing Shot", "Arrow Barrage", "Range Ender", "Fake Shot", "Siege Stance"]),
  ...classSkills("artillery", ["Magic Arrow", "Revolution Ballista", "Detonating Arrow", "Aerial Chain Shot", "Scope Arrow"]),
  ...classSkills("tempest", ["Twin Shot", "Astral Illusion", "Hurricane Dance", "Circle Shot", "Double Somersault Kick"]),
  ...classSkills("wind-walker", ["Willow Kick", "Spiral Edge", "Rising Storm", "Spirit Shot", "Cyclone Kick"]),
  ...classSkills("silver-hunter", ["Moon Kick", "Hunting Area", "Tornado Shot", "Flamingo", "Falcon Raid"]),
  ...classSkills("saleana", ["Flame Worm", "Fiery Vortex", "Rolling Lava", "Flame Spark", "Fire Wall"]),
  ...classSkills("elestra", ["Glacial Spike", "Blizzard Storm", "Ice Spear", "Glacial Wave", "Icy Shards"]),
  ...classSkills("smasher", ["Shockwave", "Eraser", "Laser Cutter", "Force Wave", "Energy Blast"]),
  ...classSkills("majesty", ["Void Explosion", "Meteor Storm", "Switch Gravity", "Gravity Sphere", "Triple Orbs"]),
  ...classSkills("black-mara", ["Wheeling Staff", "Deadly Smoke", "Inhale", "Ebony Spark", "Ripping"]),
  ...classSkills("guardian", ["Shield Blow", "Divine Avatar", "Justice Crash", "Shield Charge", "Armor Break"]),
  ...classSkills("crusader", ["Divine Combo", "Thor's Hammer", "Judgment Hammer", "Divine Breaker", "Sacred Hammering"]),
  ...classSkills("saint", ["Holy Bolt", "Sacred Wish", "Shock of Relic", "Shock Smash", "Lightning Relic"]),
  ...classSkills("inquisitor", ["Charge Bolt", "Heavenly Judgment", "Lightning Storm", "Holy Wave", "Mind Breaker"]),
  ...classSkills("arch-heretic", ["Divine Combo", "Death Gate", "Sawblade", "Chaos Shield", "Carnage"]),
  ...classSkills("shooting-star", ["Quick Shot", "Summon Buster", "Splash", "Chemical Grenade", "AP Launcher"]),
  ...classSkills("gear-master", ["Air Shot", "Extreme Tower", "Big Mecha Bomb", "Gravity Grenade", "Mechanic Chainsaw"]),
  ...classSkills("adept", ["Napalm Bomb", "Icicle Expression", "Ice Beam", "Icing Mass", "Magma Wall"]),
  ...classSkills("physician", ["Force Out", "Poison Pool", "Love Virus", "Disease", "Poison Charging"]),
  ...classSkills("ray-mechanic", ["Force Out", "Singularity", "Dynamic Vortex", "Dodge Attack", "Electronic Spanner"]),
  ...classSkills("dark-summoner", ["Despair Needle", "Phantom's Avenger", "Chaos Formation", "Spirit Twinge", "Rampage Claw"]),
  ...classSkills("soul-eater", ["Soul Wind", "Dragon's Soul", "Specter of Pain", "Grudge Formation", "Soul Gate"]),
  ...classSkills("blade-dancer", ["Fancy Turn", "Inner Fire", "Gust Dementia", "Sinia Turn", "Graze Dance"]),
  ...classSkills("spirit-dancer", ["Spirit Blow", "Storm of Ewiniar", "Praetor", "Mist Step", "Dusk Hunter"]),
  ...classSkills("oracle-elder", ["Sting Breeze", "Ancient Grace", "Flash Tempest", "Diffused Rays", "Wild Spada"]),
  ...classSkills("ripper", ["Shadow Hand", "Crippling Punisher", "Artful Chaser", "Burning Coal", "Shift Blow"]),
  ...classSkills("raven", ["Edged Fan", "The End", "Umbra", "Excess Chain", "Punishment"]),
  ...classSkills("light-fury", ["Edged Fan", "Ring of Energy", "Sunshine Spark", "Piercing Star", "Chakra Rush"]),
  ...classSkills("abyss-walker", ["Speedy Cut", "Dark Conviction", "Nightfall", "Rubicon", "Line of Darkness"]),
  ...classSkills("bleed-phantom", ["Speedy Cut", "Painkiller", "Shadow Overdrive", "Deathweb", "Madness"]),
  ...classSkills("flurry", ["Deep Pierce", "Fling Sky", "Rough Sweep", "Rushing Blade", "Spinning Swing"]),
  ...classSkills("sting-breezer", ["Cross Cutter", "Champagne", "Poking Beehive", "Spring Haze", "Dent Blow"]),
  ...classSkills("avalanche", ["Wheel Blade", "Icy Blast", "Fatal Stinger", "Brandish", "Momentary Phantasm"]),
  ...classSkills("randgrid", ["Flash Lift", "Blaze Strike", "Counter Flare", "Rising Lava", "Land Crush"]),
  ...classSkills("vena-plaga", ["Grudge", "Sacrifice", "Lonely Cloud", "Injury", "Thorn of Reproof"]),
  ...classSkills("defensio", ["Lariat", "Man to Man", "Taunting Blow", "Foot Stomp", "Ruination"]),
  ...classSkills("ruina", ["Low Reel Hook", "Deus Ex Machina", "Palm Strike", "Body Blow", "Flow Up"]),
  ...classSkills("impactor", ["Body Check", "Limit Runner", "Skip", "Mirage", "Stunt Rush"]),
  ...classSkills("luster", ["Pivot Gun Shot", "Hyper Galaxy", "Cast Cassia", "Shoulder Crash", "Flood Trick"]),
  // The 1st Ultimate is two skills, intentionally kept as one entry.
  ...classSkills("beastia-reina", ["Low Reel Hook", "Binding Thread, Jelly Party", "Ramble and Catch", "Deep Skewer", "Ivory"]),
  ...classSkills("duelist", ["Double Slash", "Requiem", "Phase Blade", "Blading Edge", "Pale Burst"]),
  ...classSkills("trickster", ["Crossfire", "Shoot the Moon", "Sword Storm", "Falling Arms", "Out Link"]),
  ...classSkills("revenant", ["Low Slicer", "Last Bliss", "Sword of Liberation", "Quick Airborne", "Distribution"]),
  ...classSkills("maverick", ["Crossfire", "Ashes to Dust", "Finale", "Wild Card", "Jackpot"]),
  // TODO: lux-ascendant, ring-master skills
];

export const getClassById = (classId?: string) =>
  ClassData.find((item) => item.id === classId);

export const getSkillsByClassId = (classId?: string) =>
  SkillData.filter((item) => item.classId === classId);
