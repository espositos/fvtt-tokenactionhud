import { RollHandler } from "./rollHandler.js"

export class RollHandlerBase5e extends RollHandler {
    constructor() {
        super();
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
    
        if (!item)
            ui.notifications.warn("No item found");
    
        if (item.data.type === "spell")
            return actor.useSpell(item);
    
        if (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value)
            return item.rollRecharge();
            
        return item.roll();
    }
}