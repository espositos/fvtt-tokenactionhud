import * as settings from "../settings.js"; 
import { RollHandler } from "./rollHandler.js"

export class RollHandlerBase5e extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    handleActionEvent(event, encodedValue) {
        settings.Logger.debug(encodedValue);
        let payload = encodedValue.split('.');
        
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
            case "abilitySave":
                this.rollAbilitySaveMacro(event, tokenId, actionId);
                break;
            case "abilityCheck":
                this.rollAbilityCheckMacro(event, tokenId, actionId);
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
        super.getActor(tokenId).rollAbility(checkId, {event: event});
    }
    
    rollAbilityCheckMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollAbilityTest(checkId, {event: event});
    }

    rollAbilitySaveMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollAbilitySave(checkId, {event: event});
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollSkill(checkId, {event: event});
    }
    
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);
    
        if (!item) {
            settings.Logger.error(`No item found with id ${itemId}`);
            return;
        }
    
        if (item.data.type === "spell")
            return actor.useSpell(item);
    
        if (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value)
            return item.rollRecharge();
            
        return item.roll();
    }
}