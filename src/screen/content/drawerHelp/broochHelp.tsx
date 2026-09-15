import { PatchNoteSection } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

const calculatorHelp = (
  <>
    <p>
      Brooches are upgraded step by step at the Blacksmith (Craft Item -
      Brooch): Magic Lv.1-5, then Rare, Epic and Unique. Each step consumes the
      previous brooch plus the listed materials.
    </p>
    <p>
      To use the calculator, select From (your current brooch) and To (your
      target). Base means the unupgraded Sealed Power Brooch.
    </p>
    <p>
      <i>Brooches cannot be traded or moved to Server Storage.</i>
    </p>
  </>
);

export const broochHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.broochVelskud,
    label: TAB_KEY.broochVelskud,
    children: (
      <div>
        {calculatorHelp}
        <p>
          Unique grade (Dimensional Brooch) goes up to Lv.15 and boosts
          Dimensional Dragon Jade skill ATK.
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/144/c/1",
              label: "Dimensional Brooch - Velskud",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.broochNerwin,
    label: TAB_KEY.broochNerwin,
    children: (
      <div>
        {calculatorHelp}
        <p>
          Unique grade (Otherworldly Nerwin Brooch) goes up to Lv.15 and boosts
          Otherworldly Dragon Jade skill ATK.
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/160/c/9",
              label: "Otherworld-trapped Nerwin Brooch",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.broochTerramai,
    label: TAB_KEY.broochTerramai,
    children: (
      <div>
        {calculatorHelp}
        <p>
          Every step also costs a base crafting fee in Gold, and Rare Lv.1
          onward needs Terramai's Power. Tick the craft option to count
          Terramai's Power as its crafting materials instead.
        </p>
        <p>
          The Legend grade [Blessing: Otherworldly] Terramai Brooch of Faith is
          not craftable; it comes from the Terramai Brooch of Faith Box or the
          Brooch Shop.
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/190/c/3",
              label: "Terramai's Brooch",
            },
          ]}
        />
      </div>
    ),
  },
];
