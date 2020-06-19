import { RollHandler } from "./rollHandler.js"

export class RollHandlerMinorQol5e extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    handleActionEvent(event, encodedValue) {
        console.log(encodedValue);
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
    
    rollSkillMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollSkill(checkId, {event: event});
    }
    
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);
    
        MinorQOL.doMacroRoll(event, item.data.name, item.data.type);
    }
}