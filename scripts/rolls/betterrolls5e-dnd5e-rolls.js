import { RollHandlerBase5e } from "./base-dnd5e-rolls.js"

export class RollHandlerBetterRolls5e extends RollHandlerBase5e {
    constructor() {
        super();
    }

    /** @override */
    rollAbilityTestMacro(event, tokenId, checkId) {
        let actor = super.getActor(tokenId);
        
        let params = {adv:0, disadv:0};
		if (event.shiftKey) { params.adv = 1; }
        if (keyboard.isCtrl(event)) { params.disadv = 1; }
        
        //need to update function used once documentation is added.
        BetterRolls.rollCheck(actor, checkId, params);
    }

    /** @override */
    rollAbilitySaveMacro(event, tokenId, checkId) {
        let actor = super.getActor(tokenId);
        
        let params = {adv:0, disadv:0};
		if (event.shiftKey) { params.adv = 1; }
        if (keyboard.isCtrl(event)) { params.disadv = 1; }
        
        //need to update function used once documentation is added.
        BetterRolls.rollSave(actor, checkId, params);
    }
    
    /** @override */
    rollSkillMacro(event, tokenId, checkId) {
        let actor = super.getActor(tokenId);
        
        let params = {adv:0, disadv:0};
		if (event.shiftKey) { params.adv = 1; }
        if (keyboard.isCtrl(event)) { params.disadv = 1; }
        
        //need to update function used once documentation is added.
        BetterRolls.rollSkill(actor, checkId, params);
    }
    
    /** @override */
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);
    
        BetterRolls.quickRollById(actor._id, item._id);
    }
}