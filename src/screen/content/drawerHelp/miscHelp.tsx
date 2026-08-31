import { PatchNoteSection } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const miscHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.miscConversion,
    label: TAB_KEY.miscConversion,
    children: (
      <div>
        <p>
          <b>
            Armor, Accessories and WTD type Conversion can be obtain from
            beginner guide mission.
          </b>
        </p>
        <p>
          <b>
            Weapon type Conversion can be obtain via Cherry store &#40;NPC,
            trade some point&#41; or buy from Trading House.
          </b>
        </p>
        <p>
          To use the calculator, please select the equipment you want to
          calculate.
        </p>
        <p>
          You can always open Mats Reference if you are not sure about the
          number.
        </p>
        <p>
          Select the From &#38; To option in correct progression of the
          equipment. &#40; 0 to 10, and evolve to legend&#41;
        </p>
        <p>
          Calculated material only shown when you input the correct From, To
          and select the equipment.
        </p>
        <p>
          <i>
            You can always custom input everything in tab From, and To, but
            remember your custom input will be override by The Settings if you
            change it.
          </i>
        </p>
        <p>
          <i>
            Best way to do this is setup everything in common from settings,
            then adjust things you needed.
          </i>
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/111/c/1",
              label: "Legend Conversion Armor",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/117/c/2",
              label: "Legend Conversion Accessories",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/126/c/12",
              label: "Legend Conversion Weapon",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/144/c/5",
              label:
                "Legend Conversion WTD & Enhancement Legend Conversion Armor (+1 to +3)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/162/c/5",
              label: "Enhancement Legend Conversion Accessories (+1 to +3)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/171/c/2",
              label: "Enhancement Legend Conversion Weapon (+1 to +3)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/174/c/15",
              label: "Enhancement Legend Conversion WTD (+1 to +3)",
            },
          ]}
        />

        <PatchNoteSection
          heading="KR Patch Note related :"
          entries={[
            {
              href: "https://patchnote.dragonnest.com/kr/149/c/8",
              label: "Enhancement Legend Conversion Armor",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.miscBestie,
    label: TAB_KEY.miscBestie,
    children: (
      <div>
        <p>
          <b>
            Growing version 2 of the bestie star only available after the
            version 1 is reach lv.30.
          </b>
        </p>
        <p>
          To use the calculator, please filled in Grow type, then version and
          range (current enhance level to your target).
        </p>

        <p>
          <i>
            Enhance list limited to 2 (because only 2 type, mount & spirit).
            The list inside also limited to 2 since as per this page released,
            only have version 1 & 2.
          </i>
        </p>
        <p>
          <i>
            You can check which input is not correct in below warning message
            (yellow text).
          </i>
        </p>
        <PatchNoteSection
          entries={[
            {
              href: "https://patchnote.dragonnest.com/sea/133/c/2",
              label: "Bestie Star v.1 (First Release)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/144/c/8",
              label: "Bestie Star v.2",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/162/c/3",
              label: "Bestie Star v.3",
            },
          ]}
        />
      </div>
    ),
  },
];
