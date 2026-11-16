import {
  PatchNoteLink,
  PatchNoteSection,
} from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

const PARADOX_PATCH_NOTE = (
  <PatchNoteLink
    href="https://patchnote.dragonnest.com/sea/202/c/1"
    label="Paradox Warrior"
  />
);

// KR got Paradox Warrior first (KR patch 195). Its numbers mostly match SEA;
// only the differences are listed per tab. The calculators use SEA values.
const KR_PATCH_NOTE = (
  <PatchNoteSection
    heading="KR Patch Note related :"
    entries={[
      {
        href: "https://patchnote.dragonnest.com/kr/195/c/1",
        label: "Paradox Warrior (KR)",
      },
    ]}
  />
);

const krDiff = (lines: string[]) => (
  <>
    <p>
      <b>KR patch differences</b> (this page uses the SEA values):
    </p>
    <ul style={{ paddingLeft: 20 }}>
      {lines.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  </>
);

export const paradoxHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.paradoxEquipment,
    label: TAB_KEY.paradoxEquipment,
    children: (
      <div>
        <p>
          <b>
            Paradox Warrior-exclusive armor, weapons and accessories. Only
            Paradox Warrior can equip them.
          </b>
        </p>
        <p>
          Each grade (Normal → Magic → Rare → Epic → Unique) enhances to +10,
          then evolves into the next grade's +0 with an Upgrade Chip.
        </p>
        <p>
          To use the calculator, select the equipment, then pick From (where
          you are now, or Buy if you don't own it yet) and To.
        </p>
        <p>
          <i>
            Status Increase only compares each grade's base stats. The patch
            note doesn't list the bonus per enhancement level.
          </i>
        </p>
        {krDiff([
          "Epic weapon skill add-on: KR lists 150% + 50%, SEA lists 150% + 100%.",
          "Stats and enhancement costs are the same in both.",
        ])}
        {PARADOX_PATCH_NOTE}
        {KR_PATCH_NOTE}
      </div>
    ),
  },
  {
    key: TAB_KEY.paradoxSkillJade,
    label: TAB_KEY.paradoxSkillJade,
    children: (
      <div>
        <p>
          <b>
            Paradox Warrior's Skill Dragon Jade costs only Paradox Fragments
            from +1 to +10, always 100%.
          </b>
        </p>
        <p>Pick the jade type and the range to see the Fragments needed.</p>
        <p>
          <i>
            +11 to +20 is the same as other classes' Skill Dragon Jades, check
            the Skill Jade tab for that.
          </i>
        </p>
        {krDiff([
          "Dreamy / Blood Moon / Verdure +6 to +9: KR 3, 3, 4, 4 (SEA 8, 10, 10, 12).",
          "Dimension / Otherworldly +5 to +9: KR 15, 11, 11, 13, 13 (SEA 10, 10, 15, 15, 20).",
          "Ancient +10: KR 120 (SEA 125).",
        ])}
        {PARADOX_PATCH_NOTE}
        {KR_PATCH_NOTE}
      </div>
    ),
  },
  {
    key: TAB_KEY.paradoxShop,
    label: TAB_KEY.paradoxShop,
    children: (
      <div>
        <p>
          <b>
            Paradox Shop prices, plus Paradox Dragon Jade and Frozen Paradox
            Rune info.
          </b>
        </p>
        <p>
          Paradox Fragments and Paradox Stones are bought here with stage &
          nest currencies, some with a weekly limit.
        </p>
        {krDiff([
          "Paradox Stone for 30 Paradox Fragments: KR 3 times weekly (SEA 5 times weekly).",
          "KR: Paradox Warrior can't do the existing Beginner's Guides, only its own (SEA doesn't mention this).",
          "KR: Horizon Cleave charges in up to 3 stages and refunds 25% of its cooldown if not fully charged (SEA says 75%).",
        ])}
        {PARADOX_PATCH_NOTE}
        {KR_PATCH_NOTE}
      </div>
    ),
  },
];
