import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseDw extends RollHandler {
    constructor() {
        super();
    }
    
    handleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        settings.Logger.debug(encodedValue);
        if (payload.length != 4) {
            super.throwInvalidValueErr();
        }
        
        let charType = payload[0];
        let macroType = payload[1];
        let tokenId = payload[2];
        let actionId = payload[3];

        if (this.handleCompendiums(macroType, event, tokenId, actionId))
            return;

        if (charType === 'character') {
            switch (macroType) {
                case 'damage':
                    this._handleDamage(macroType, event, tokenId, actionId);
                    break;
                case 'move':
                case 'spell':
                case 'equipment':
                    this._handleMove(macroType, event, tokenId, actionId);
                    break;
                case 'ability':
                    this._handleAbility(macroType, event, tokenId, actionId);
                    break;
            }
        } else if (charType === 'npc') {
            switch (macroType) {
                case 'damage':
                    this._handleDamage(macroType, event, tokenId, actionId);
                    break;
                case 'move':
                    this._handleMoveNpc(macroType, event, tokenId, actionId);
                    break;
                case 'tag':
                case 'quality':
                case 'instinct':
                    this._handleTextNpc(macroType, event, tokenId, actionId);
                    break;
            }
        }   
    }

    _handleDamage(macroType, event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let damage = actor.data.data.attributes.damage;
        let damageDie = `${damage.value}`;
        let damageMod = damage.misc.length > 0 ? damage.misc.length : 0;

        let flavour = damage.piercing;

        let formula = damageMod > 0 ? `${damageDie}+${damageMod}` : damageDie;

        let templateData = {
            title: this.i18n('tokenactionhud.damage'),
            flavor: `${flavour}`,
        };
        canvas.tokens.controlled[0].actor.rollMove(formula, actor, {}, templateData);
    }

    _handleMove(macroType, event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let move = actor.getOwnedItem(actionId);

        move.roll();
    }

    _handleAbility(macroType, event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let ability = actor.data.data.abilities[actionId];

        let mod = ability.mod;
        let formula = `2d6+${mod}`

        let templateData = {
            title: `${ability.label} ${game.i18n.localize('tokenactionhud.roll')}`,
            flavor: `Made a move using ${ability.label.toLowerCase()}!`,
        };
        canvas.tokens.controlled[0].actor.rollMove(formula, actor, {}, templateData);
    }

    _handleTextNpc(macroType, event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let action = decodeURIComponent(actionId);

        let title = macroType.charAt(0).toUpperCase() + macroType.slice(1);
        let templateData = {
            title: title,
            details: action,
        };
        canvas.tokens.controlled[0].actor.rollMove(null, actor, {}, templateData);
    }
}