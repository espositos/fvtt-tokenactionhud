
import { PreRollHandler } from '../preRollHandler.js';

export class MagicItemsPreRollHandler extends PreRollHandler {
    constructor() {super();}

    /** @override */
    prehandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3)
            return false;
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        if (macroType != 'magicItem')
            return false;

        this._magicItemMacro(event, tokenId, actionId);
        return true;
    }

    _magicItemMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let actionParts = actionId.split('>');

        let itemId = actionParts[0];
        let magicEffectId = actionParts[1];

        let magicItemActor = MagicItems.actor(actor._id);

        magicItemActor.roll(itemId, magicEffectId);
        
        Hooks.callAll('forceUpdateTokenActionHUD');
    }
}