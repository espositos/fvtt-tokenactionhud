import { RollHandlerBase5e } from './dnd5e-base.js'

export class RollHandlerBetterRolls5e extends RollHandlerBase5e {
    constructor() {
        super();
    }

    /** @override */
    rollAbilityCheckMacro(event, tokenId, checkId) {
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

        if (this.needsRecharge(item)) {
            item.rollRecharge();
            return;
        }

        let rightClick = event.originalEvent.button === 2;
        let shiftKey = event.shiftKey;
        let ctrlKey = keyboard.isCtrl(event);
        let altKey = event.altKey;
        if (rightClick && ctrlKey) {
            item.rollAttack();
            return;
        }
        if (rightClick && altKey) {
            item.rollDamage();
            return;
        }

        let params = {
            adv: 0,
            disadv: 0,
        }

		if (shiftKey) { params.adv = 1; }
        if (ctrlKey) { params.disadv = 1; }

        params.preset = altKey ? 1 : 0;

        BetterRolls.rollItem(item, params).toMessage();
    }
}