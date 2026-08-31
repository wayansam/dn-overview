import { PatchNoteSection } from "../../../components/PatchNoteLink";
import { TAB_KEY } from "../../../constants/Common.constants";
import { HelpItem } from "./helpItem.type";

export const equipmentHelpItems: HelpItem[] = [
  {
    key: TAB_KEY.eqAncient,
    label: TAB_KEY.eqAncient,
    children: (
      <div>
        <p>
          <b>
            For the mentioned weapon is Tier 2 Ancient Weapon, so you at least
            need to have +0 tier 2 ancient weapon first.
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
          Select the From &#38; To option in correct progression of the
          equipment. &#40; 0 to 20 &#41;
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
              href: "https://patchnote.dragonnest.com/sea/156/c/2",
              label: "Ancient's Equipment cost change",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.eqNamedEOD,
    label: TAB_KEY.eqNamedEOD,
    children: (
      <div>
        <p>To use the calculator, please drag the pointer.</p>
        <p>
          <i>
            Materials needed to craft one weapon are 10 Guide Star, 80
            Twilight Essence and 25 Gold.
          </i>
        </p>
      </div>
    ),
  },
  {
    key: TAB_KEY.eqBoneDragon,
    label: TAB_KEY.eqBoneDragon,
    children: (
      <div>
        <p>
          <b>
            Bone Armor & Weapon can be obtain via Trading House. Additionally,
            Bone Armor can be obtained by evolving Ancient Armor T2 & Bone
            Weapon from Bone Weapon Pouch.
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
          equipment &#40;0 to 20&#41;.
        </p>
        <p>
          Calculated material only shown when you input the correct From, To
          and select the equipment.
        </p>
        <p>
          <i>
            You can always custom input everything in tab Specific Type, From,
            and To, but remember your custom input will be override by The
            Settings if you change it.
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
              href: "https://patchnote.dragonnest.com/sea/126/c/1",
              label: "Bone Dragon Nest Equipment",
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
  {
    key: TAB_KEY.eqVIPAcc,
    label: TAB_KEY.eqVIPAcc,
    children: (
      <div>
        <p>
          <b>
            Iona Accessories can be obtain via Merchant Pania or Merchant
            Farvana in certain towns. Additionally, Iona Accessories can be
            obtained by exchanging your Argenta or Gerraint Accessories.
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
          equipment &#40;0 to 20&#41;.
        </p>
        <p>
          Calculated material only shown when you input the correct From, To
          and select the equipment.
        </p>
        <p>
          <i>
            You can always custom input everything in tab Specific Type, From,
            and To, but remember your custom input will be override by The
            Settings if you change it.
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
              href: "https://patchnote.dragonnest.com/sea/111/c/10",
              label: "Iona Accessory",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/126/c/5",
              label: "Iona Accessory New Level release (+4 to +9)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/144/c/6",
              label: "Iona Accessory New Level release (+10 to +12)",
            },
            {
              href: "https://patchnote.dragonnest.com/sea/162/c/4",
              label: "Iona Accessory New Level release (+13 to +15)",
            },
          ]}
        />
      </div>
    ),
  },
  {
    key: TAB_KEY.eqKilos,
    label: TAB_KEY.eqKilos,
    children: (
      <div>
        <p>
          <b>
            If you want to only calculate tier 2, please put Tier 1 +20 in
            'From' tab as Tier 2 +0 placeholder.
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
          Select the From &#38; To option in correct progression of the
          equipment. &#40; 0 to 20 in each Tier&#41;
        </p>
        <p>
          Calculated material only shown when you input the correct From, To
          and select the equipment.
        </p>
        <p>
          Please check the 'Evo Tier 2' tab if you want to evolve Tier 1 Kilos
          to Tier 2. Check the 'Change Needle to Craft mats' in setting if you
          want to craft it.
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
      </div>
    ),
  },
  {
    key: TAB_KEY.eqSpunGold,
    label: TAB_KEY.eqSpunGold,
    children: (
      <div>
        <p>
          <b>
            For the mentioned armor is evolved from Ancient Armor (tier 1 or
            2) & weapon from Otherworldly Ancient Weapon, so you at least need
            to have those item first.
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
          Select the From &#38; To option in correct progression of the
          equipment. &#40; 0 to 10 &#41;
        </p>
        <p>
          Calculated material only shown when you input the correct From, To
          and select the equipment. Additionally, you can include materials
          for crafting the evolver from Ancient Equipment.
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
              href: "https://patchnote.dragonnest.com/sea/160/c/2",
              label: "Spun Gold Equipment",
            },
          ]}
        />
      </div>
    ),
  },
];
