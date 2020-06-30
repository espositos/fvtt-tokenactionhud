import { RollHandler } from "../rollHandler.js";
import * as settings from '../../settings.js';

export class RollHandlerBaseWfrp4e extends RollHandler {
    constructor() {
        super();
    }
    
    handleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('.');
        settings.Logger.debug(encodedValue);
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(actionId).data;

        let bypassData = {bypass: !!event.shiftKey};

        switch (macroType) {
            case "weapon":
                return actor.setupWeapon(item, bypassData);
            case "spell":
                return actor.spellDialog(item, bypassData);
            case "prayer":
                return actor.setupPrayer(item, bypassData);
            case "trait":
                return actor.setupTrait(item, bypassData);
            case "skill":
                return actor.setupSkill(item, bypassData);
            case "characteristic":
                return actor.setupCharacteristic(item, bypassData);
        }
    }
}
