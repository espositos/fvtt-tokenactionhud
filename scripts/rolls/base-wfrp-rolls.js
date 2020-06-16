import { RollHandler } from "./rollHandler.js";

export class RollHandlerBaseWfrp extends RollHandler {
    constructor() {
        super();
    }
    
    handleActionEvent(event, value) {
        let payload = value.split('.');
        console.log(value);
        if (payload.length != 3) {
            throw new Error("invalid button value received.");
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(actionId).data;
        console.log(item);
        console.log(event);

        let bypassData = {bypass: !!event.shiftKey};
        console.log("BypassData: ", bypassData);

        switch (macroType) {
            case "weapon":
                return actor.setupWeapon(item, bypassData)
            case "spell":
                return actor.spellDialog(item)
            case "prayer":
                return actor.setupPrayer(item)
            case "trait":
                return actor.setupTrait(item, bypassData)
            case "skill":
                return actor.setupSkill(item, bypassData)
            case "characteristic":
                return actor.setupCharacteristic(item, bypassData)
        }
    }
}
