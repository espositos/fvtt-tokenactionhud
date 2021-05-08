import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseCthack extends RollHandler {
    constructor() {
        super();
    }
    
    doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }

        let macroType = payload[0];
        let tokenId = payload[1];
        let itemId = payload[2];

        let actor = super.getActor(tokenId);
        switch (macroType) {
            case 'save':
                this._handleSaves(macroType, event, actor, itemId);
                break;
            case 'resource':
                this._handleResources(macroType, event, actor, itemId);
                break; 
            case 'damage':
                this._handleDamages(macroType, event, actor, itemId);
                break; 
            case 'weapon':
                this._handleWeapon(macroType, event, actor, itemId);
                break;
            case 'item':
                this._handleItem(macroType, event, actor, itemId);
                break;
            case 'ability':
                this._handleAbility(macroType, event, actor, itemId);
                break;               
        }        
    }

    _handleSaves(macroType, event, actor, actionId) {
        actor.rollSave(actionId);
    }

    _handleResources(macroType, event, actor, actionId) {
        actor.rollResource(actionId);
    }

    _handleDamages(macroType, event, actor, actionId) {
        actor.rollDamageRoll(actionId);
    }

    _handleWeapon(macroType, event, actor, actionId) {
        let item = actor.getOwnedItem(actionId);
        actor.rollMaterial(item);
    }

    _handleItem(macroType, event, actor, actionId) {
        let item = actor.getOwnedItem(actionId);
        actor.rollMaterial(item);
    }

    _handleAbility(macroType, event, actor, actionId) {
        let usedPower = actor.items.filter(item => item.data?._id === actionId);
        actor.usePower(usedPower[0]);
    }
}