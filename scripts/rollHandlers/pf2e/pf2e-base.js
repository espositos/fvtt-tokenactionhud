import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBasePf2e extends RollHandler {
    constructor() {
        super();
    }
    
    handleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('.');
        settings.Logger.debug(encodedValue);
        if (payload.length != 4) {
            super.throwInvalidValueErr();
        }
        
        let charType = payload[0];
        let macroType = payload[1];
        let tokenId = payload[2];
        let actionId = payload[3];

        switch (charType) {
            case 'npc':
                this._handleNpcActions(macroType, event, tokenId, actionId);
                break;
            case 'character':
                this._handleCharacterActions(macroType, event, tokenId, actionId);
                break;
        }
    }

    /** @private */
    _handleCharacterActions(macroType, event, tokenId, actionId) {
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
            case 'attribute':
                this._rollAttribute(event, tokenId, actionId);
                break;
            case 'action':
            case 'spell':
            case 'feat':
            case 'item':
                this._rollItem(event, tokenId, actionId);
                break;
        }
    }

    /** @private */
    _handleNpcActions(macroType, event, tokenId, actionId) {
        switch (macroType) {
            case 'ability':
                this._rollAbility(event, tokenId, actionId);
                break;
            case 'save':
                this._rollSaveNpc(event, tokenId, actionId);
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
            case 'attribute':
                this._rollAttributeNpc(event, tokenId, actionId);
                break;
            case 'action':
            case 'spell':
            case 'feat':
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
    _rollAttribute(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let attribute = actor.data.data.attributes[actionId];
        if (!attribute) {
            actor.rollAttribute(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', attribute]);
            attribute.roll(event, opts);
        }
    }

    /** @private */
    _rollAttributeNpc(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        actor.rollAttribute(event, actionId);
    }

    /** @private */
    _rollSave(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let save = actor.data.data.saves[actionId];
        if (!save) {
            actor.rollSave(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', 'saving-throw', save]);
            save.roll(event, opts);
        }
    }

    

    /** @private */
    _rollSaveNpc(event, tokenId, actionId) {
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

        let skill = actor.data.data.skills[actionId];
        if (!skill) {
            actor.rollSkill(event, actionId);
        }
        else {
            const opts = actor.getRollOptions(['all', 'skill-check', CONFIG.PF2E.skills[actionId] ?? actionId]);
            skill.roll(event);
        }
    }

    /** @private */
    _rollStrike(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeName = actionParts[0];
        let strikeType = actionParts[1];

        let strike = actor.data.data.actions.filter(a => a.type === 'strike').find(s => s.name === strikeName);
        const opts = actor.getRollOptions(['all', 'attack-roll']);

        switch (strikeType) {
            case 'damage':
                strike.damage(event, opts);
                break;
            case 'critical':
                strike.critical(event, opts);
                break;
            default:
                strike.variants[strikeType]?.roll(event, opts);
        }
    }

    /** @private */
    _rollItem(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let item = actor.items.find(i => i._id === actionId);

        item.roll();
    }
}
