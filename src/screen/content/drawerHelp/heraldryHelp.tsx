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
  {
    key: TAB_KEY.heraldryGolden,
    label: TAB_KEY.heraldryGolden,
    children: (
      <div>
        <p>
          <b>
            There are 8 Golden Enhancement Heraldry types. Lv.1 to Lv.4 are
            crafted one level at a time, Blessed is crafted directly.
          </b>
        </p>
        <p>
          To use the calculator, set the bottom point to your state right now
          and the top point to where you want to.
        </p>
        <p>
          Lv.1 - Lv.4 use Epic (20%) or Unique (70%) Golden Plates. Failing
          returns the previous level heraldry but the other mats are lost.
          Turn on "Include expected failures" to estimate the mats with the
          success rate.
        </p>
        <p>
          Blessed uses a Legend Blessed Golden Plate (100%) and doesn't need a
          lower level heraldry.
        </p>
        <p>
          <i>
            Golden Enhancement Heraldry can't be equipped together with an
            Eternal Enhancement Heraldry of the same stat.
          </i>
        </p>
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/174/c/5"
          label="Golden Bear/Wind/Intellect/Vitality Enhancement Heraldry"
        />
        <PatchNoteLink
          href="https://patchnote.dragonnest.com/sea/202/c/2"
          label="Golden Iron Wall/Tent/Fatal/Limit Enhancement Heraldry"
        />
      </div>
    ),
  },
];
