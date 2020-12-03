
import { PreRollHandler } from './preRollHandler.js';
import * as settings from '../settings.js';

export class ItemMacroPreRollHandler extends PreRollHandler {
    constructor() {super();}

    /** @override */
    prehandleActionEvent(event, encodedValue) {
        this.registerKeyPresses(event);
        
        let payload = encodedValue.split('|');
        
        if (payload.length != 3)
            return false;
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        if (macroType != 'itemMacro')
            return false;
        
        if (this.isRenderItem()) {
            this.doRenderItem(tokenId, actionId);
            return true;
        }

        return this._tryExecuteItemMacro(event, tokenId, actionId);
    }

    _tryExecuteItemMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        try {
            if(actor.isToken)
            {
                ItemMacro.runMacro(tokenId, actionId);
            }else{
                ItemMacro.runMacro(actor.id, actionId);
            } 
        } catch (e) {
            settings.Logger.error('ItemMacro error: ', e);
            return false;
        }

        return true;
    }
}