import {
  PatchNoteLink,
  PatchNoteSection,
} from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { equipmentCraftOpt } from "../jade/LunarJadeCalculatorContent";
import { HelpItem } from "./helpItem.type";

export const jadeHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.jadeLunar,
    label: TAB_KEY.jadeLunar,
    children: (
      <div>
        <p>
          <b>~Craft Section~</b>
        </p>
        <p>
          <b>
            The Max settings for armor is only available with tier 2 Ancient
            Armor and its upgrade (can put additional attack jade in it) & VIP
            ring (put additional defense jade in it start from Evo Ring).
          </b>
        </p>
        <p>
          To use the calculator, please select the equipment you want to
          calculate.
        </p>
        <p>
          You can always open Craft Reference if you are not sure about the
          number.
        </p>
        <p>
          Please add the quantity so it can calculate precisely based on your
          need.
        </p>
        <p>
          Select the From &#38; To option in correct progression of the
          equipment. &#40;
          {equipmentCraftOpt.map((item) => item.label).join(" > ")} &#41;
        </p>
        <p>
          Calculated material only shown when you input the correct amount,
          From, To and select the equipment.
        </p>
        <p>
          <i>
            You can always custom input everything in tab Quantity, From, and
            To, but remember your custom input will be override by The
            Settings if you change it.
          </i>
        </p>
        <p>
          <i>
            Best way to do this is setup everything in common from settings,
            then adjust things you needed.
          </i>
        </p>
        <p>
          <b>~Enhance Section~</b>
        </p>
        <p>
          <b>
            Enhancing lunar dragon jade only available for 'Ancient grade'
            jade. And the stat increase is added to your current jade stat.
          </b>
        </p>
        <p>
          To use the calculator, please filled in Jade type, then amount and
          range (current enhance level to your target).
        </p>
        <p>
          Main Weapon Attack Dragon Jade does not have Final Damage as an
          additional stat. Final Damage only appears with a value of 150 at
          +20.
        </p>
        <p>
          <i>
            Enhance list limited to 2 (because only 2 type, attack & defense).
            But the list inside you can put up to 20 depends on your current
            plan.
          </i>
        </p>
        <p>
          <i>
            You can check which input is not correct in below warning message
            (yellow text).
          </i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/108/c/5"
          label="Lunar Eclipse Dragon Jade Ancient Grade – Enhancement"
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.jadeSkill,
    label: TAB_KEY.jadeSkill,
    children: (
      <div>
        <p>
          <b>
            After +10, all jade enhancement will have probability to fail,
            proceed with caution.
          </b>
        </p>
        <p>To use the calculator, please drag the pointer.</p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/138/c/3",
              label: "Dimensional Dragon Jade",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/160/c/4",
              label: "Otherworldly Dragon Jade",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.jadeErosion,
    label: TAB_KEY.jadeErosion,
    children: (
      <div>
        <p>
          <b>This calculator only calculated Tier 1 Jade.</b>
        </p>
        <p>To use the calculator, please drag the pointer.</p>
        <p>
          <i>
            After Tier 2, all jade enhancement will have probability to fail,
            proceed with caution.
          </i>
        </p>
        <p>
          <i>
            Materials needed from +0 to +20 is the same, which is 10
            Concentrated Erosion Fragment, 300 Gold Lotus Crown and 5000 Gold.
          </i>
        </p>
      </div>
    ),
  },
  {
    key: TAB_KEY.jadeCollapse,
    label: TAB_KEY.jadeCollapse,
    children: (
      <div>
        <p>
          To use the calculator, please filled in Jade type, then amount and
          range (current enhance level to your target). Check the craft
          checkbox to include the material into calculation.
        </p>
        <p>
          <i>
            Enhance list limited to 2 (because only 2 type, attack & defense).
            But the list inside you can put up to 20 depends on your current
            plan.
          </i>
        </p>
        <p>
          <i>
            You can check which input is not correct in below warning message
            (yellow text).
          </i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/160/c/2"
          label="Collapse Dragon Jade"
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.jadeDeepVariant,
    label: TAB_KEY.jadeDeepVariant,
    children: (
      <div>
        <p>
          <b>
            This jade slot only available on certain type of equipment, please
            refer to patch note below.
          </b>
        </p>
        <p>Go to blacksmith to craft this jade.</p>
        <p>Only Corupted Origin is tradable, other materials is not.</p>
        <p>
          <b>~Unique Section~</b>
        </p>
        <p>To use the calculator, please drag the pointer.</p>
        <p>Hover to setting option to find out about what it needed.</p>
        <p>
          <b>~Legend/Ancient Section~</b>
        </p>
        <p>
          To use the calculator, please filled in the range (current enhance
          level to your target).
        </p>
        <p>
          Enhancement can be done on Legend grade and Ancient grade. If you
          evolve the Legend to Ancient, the enhancement level will be
          maintained.
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/166/c/2",
              label: "Deeply Rooted Variant Dragon Jade",
            },
          ]}
        />
        <p>Special Thanks</p>
        <p>
          <i>~BananaCredits~</i>
        </p>
      </div>
    ),
  },
];
