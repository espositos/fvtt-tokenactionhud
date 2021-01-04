import { RollHandlerBase5e } from "./dnd5e-base.js";

export class RollHandlerObsidian extends RollHandlerBase5e {
  constructor() {
    super();
  }

  /** @override */
  rollAbilityCheckMacro(event, tokenId, checkId) {
    let actor = super.getActor(tokenId);
    OBSIDIAN.Items.roll(actor, { roll: "abl", abl: checkId });
  }

  /** @override */
  rollAbilitySaveMacro(event, tokenId, checkId) {
    let actor = super.getActor(tokenId);
    OBSIDIAN.Items.roll(actor, { roll: "save", save: checkId });
  }

  /** @override */
  rollSkillMacro(event, tokenId, checkId) {
    let actor = super.getActor(tokenId);
    OBSIDIAN.Items.roll(actor, { roll: "skl", skl: checkId });
  }

  /** @override */
  rollItemMacro(event, tokenId, itemId) {
    let actor = super.getActor(tokenId);
    OBSIDIAN.Items.roll(actor, { roll: "item", id: itemId });
  }
}
