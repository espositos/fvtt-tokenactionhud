import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseSymbaroum extends RollHandler {
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
            case 'weapon':
                this._handleWeapon(macroType, event, actor, itemId);
                break;
            case 'armor':
                this._handleArmor(macroType, event, actor, itemId);
                break;
            case 'ability':
                this._handleAbility(macroType, event, actor, itemId);
                break;
            case 'mysticalPower':
                this._handleMysticalPowers(macroType, event, actor, itemId);
                break;
            case 'attribute':
                this._handleAttributes(macroType, event, actor, itemId);
                break;
        }
        
    }

    _handleWeapon(macroType, event, actor, actionId) {

        let usedItem = actor.data.data.weapons.filter(item => item._id === actionId);
        actor.rollWeapon(usedItem[0]);
    }

    _handleArmor(macroType, event, actor, actionId) {

        actor.rollArmor();
    }

    _handleAbility(macroType, event, actor, actionId) {

        let usedPower = actor.items.filter(item => item.data?._id === actionId);
        actor.usePower(usedPower[0]);
    }

    _handleMysticalPowers(macroType, event, actor, actionId) {

        let usedPower = actor.items.filter(item => item.data?._id === actionId);
        actor.usePower(usedPower[0]);
    }

    _handleAttributes(macroType, event, actor, actionId) {
        actor.rollAttribute(actionId);
    }
}