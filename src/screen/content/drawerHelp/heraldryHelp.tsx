import { PatchNoteLink } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const heraldryHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.heraldryAncientGoddes,
    label: TAB_KEY.heraldryAncientGoddes,
    children: (
      <div>
        <p>
          <b>
            You don't need to buy the heraldry step by step from 1. You can
            directly buy the heraldry you want as long you have the required
            item.
          </b>
        </p>
        <p>
          To use the calculator, set the bottom point to your state right now
          and the top point to where you want to.
        </p>
        <p>
          You can always disassamble your heraldry but the gold cost for
          buying the blueprint item is not refunded.
        </p>
        <p>
          <i>
            Ancients' Blueprints can be bought from shop. It require 500 gold
            and 10 of Ancients' Blueprint Fragment
          </i>
        </p>
        <p>
          <i>You can access this shop via Heraldry NPC in Milla Laurel.</i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/123/c/2"
          label="Ancients' Goddess Heraldry"
        />
      </div>
    ),
  },
];
