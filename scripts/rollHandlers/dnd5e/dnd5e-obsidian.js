import { RollHandlerBase5e } from "./dnd5e-base.js";

export class RollHandlerObsidian extends RollHandlerBase5e {
  constructor() {
    super();
  }

  /** @override */
  rollAbilityCheckMacro(tokenId, checkId) {
    let actor = super.getActor(tokenId);
    Rolls.create(actor, { roll: "abl", abl: checkId });
  }

  /** @override */
  rollAbilitySaveMacro(tokenId, checkId) {
    let actor = super.getActor(tokenId);
    Rolls.create(actor, { roll: "save", save: checkId });
  }

  /** @override */
  rollSkillMacro(tokenId, checkId) {
    let actor = super.getActor(tokenId);
    Rolls.create(actor, { roll: "skl", skl: checkId });
  }

  /** @override */

  rollItemMacro(tokenId, itemId) {
    let actor = super.getActor(tokenId);
    ObsidianItems.roll(actor, { roll: "item", id: itemId });
  }
}
