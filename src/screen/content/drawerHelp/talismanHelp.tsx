import { PatchNoteLink } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const talismanHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.talismanBlackDragon,
    label: TAB_KEY.talismanBlackDragon,
    children: (
      <div>
        <p>
          <b>
            There are 6 Black Dragon's Talisman type but only 4 can be
            crafted.
          </b>
        </p>
        <p>
          To use the calculator, set the bottom point to your state right now
          and the top point to where you want to.
        </p>
        <p>You can trade this talisman (Reseal Count).</p>
        <p>
          <i>Most of the item is only drop from Black Dragon Nest.</i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/108/c/3"
          label="Black Dragon Talismans"
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.talismanEternal,
    label: TAB_KEY.talismanEternal,
    children: (
      <div>
        <p>
          <b>
            There are 3 Eternal Talisman type but only 2 can be crafted (
            <i>Eternal World Talisman</i> & <i>Eternal Pain Talisman</i>).
          </b>
        </p>
        <p>
          For <i>Eternal Chaos Talisman</i>, can be acquired within the
          Dimensional Rift & have a total of 5 additional stats determined at
          random.
        </p>
        <p>
          To use the calculator, set the bottom point to your state right now
          and the top point to where you want to.
        </p>
        <p>
          You can trade this talisman (Reseal Count), normal storage & server
          storage.
        </p>
        <p>
          <i>Most of the item is only drop from Dimensional Rift.</i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/129/c/3"
          label="Eternal Talisman"
        />
      </div>
    ),
  },
];
