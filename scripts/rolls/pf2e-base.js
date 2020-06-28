import { RollHandler } from './rollHandler.js';
import * as settings from '../settings.js';

export class RollHandlerBasePf2e extends RollHandler {
    constructor() {
        super();
    }
    
    handleActionEvent(event, encodedValue) {
        console.log(encodedValue);
        let payload = encodedValue.split('.');
        settings.Logger.debug(encodedValue);
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        switch (macroType) {
            case 'ability':
                this._rollAbility(event, tokenId, actionId);
                break;
            case 'save':
                this._rollSave(event, tokenId, actionId);
                break;
            case 'skill':
                this._rollSkill(event, tokenId, actionId);
                break;
            case 'strike':
                this._rollStrike(event, tokenId, actionId);
                break;    
            case 'lore':
                this._rollLoreSkill(event, tokenId, actionId);
                break;
            case 'action':
            case 'item':
                this._rollItem(event, tokenId, actionId);
                break;
        }
    }

    /** @private */
    _rollAbility(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        actor.rollAbility(event, actionId);
    }

    /** @private */
    _rollSave(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        actor.rollSave(event, actionId);
    }

    /** @private */
    _rollLoreSkill(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let item = actor.items.find(i => i._id === actionId);

        actor.rollLoreSkill(event, item);
    }

    /** @private */
    _rollSkill(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        actor.rollSkill(event, actionId);
    }

    /** @private */
    _rollStrike(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let actionParts = decodeURIComponent(actionId).split('>');
        console.log(actionParts);

        let strikeName = actionParts[0];
        let strikeType = actionParts[1];

        let strike = actor.data.data.actions.filter(a => a.type === 'strike').find(s => s.name === strikeName);

        switch (strikeType) {
            case 'damage':
                strike.damage(event);
                break;
            case 'critical':
                strike.critical(event);
                break;
            default:
                console.log(strikeType);
                strike.variants[strikeType]?.roll(event);
        }
    }

    /** @private */
    _rollItem(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let item = actor.items.find(i => i._id === actionId);
        console.log(actor, item);

        item.roll();
    }
}
