import { RollHandler } from "./rollHandler.js"

export class RollHandlerBetterRolls5e extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    handleActionEvent(event, value) {
        console.log(value);
        let payload = value.split('.');
        
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];
        
        switch (macroType) {
            case "ability":
                this.rollAbilityMacro(event, tokenId, actionId);
                break;
            case "skill":
                this.rollSkillMacro(event, tokenId, actionId);
                break;
            case "item":
            case "spell":
            case "feat":
                this.rollItemMacro(event, tokenId, actionId);
                break;
            default:
                break;
        }
    }
    
    rollAbilityMacro(event, tokenId, checkId) {
        let actor = super.getActor(tokenId);
        
        let params = {adv:0, disadv:0};
		if (event.shiftKey) { params.adv = 1; }
        if (keyboard.isCtrl(event)) { params.disadv = 1; }
        
        //need to update function used once documentation is added.
        BetterRolls.rollAbilityCheck(actor._id, checkId, params);
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        let actor = super.getActor(tokenId);
        
        let params = {adv:0, disadv:0};
		if (event.shiftKey) { params.adv = 1; }
        if (keyboard.isCtrl(event)) { params.disadv = 1; }
        
        //need to update function used once documentation is added.
        BetterRolls.rollSkillCheck(actor._id, checkId, params);
    }
    
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);
    
        BetterRolls.quickRollById(actor._id, item._id);
    }
}