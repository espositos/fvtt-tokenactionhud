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

        let sharedActions = ['ability', 'spell', 'item', 'skill', 'lore']

        if (!sharedActions.includes(macroType)) {
            switch (charType) {
                case 'npc':
                    this._handleUniqueActionsNpc(macroType, event, tokenId, actionId);
                    break;
                case 'character':
                    this._handleUniqueActionsChar(macroType, event, tokenId, actionId);
                    break;
            }
        }

        switch (macroType) {
            case 'ability':
                this._rollAbility(event, tokenId, actionId);
                break;
            case 'skill':
                this._rollSkill(event, tokenId, actionId);
                break;  
            case 'lore':
                this._rollLoreSkill(event, tokenId, actionId);
                break;
            case 'action':
            case 'feat':
            case 'item':
                this._rollItem(event, tokenId, actionId);
                break;
            case 'spell':
                this._rollSpell(event, tokenId, action);
        }
        
    }

    /** @private */
    _handleUniqueActionsChar(macroType, event, tokenId, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveChar(event, tokenId, actionId);
                break;
            case 'strike':
                this._rollStrikeChar(event, tokenId, actionId);
                break;  
            case 'attribute':
                this._rollAttributeChar(event, tokenId, actionId);
                break;
        }
    }

    /** @private */
    _handleUniqueActionsNpc(macroType, event, tokenId, actionId) {
        switch (macroType) {
            case 'save':
                this._rollSaveNpc(event, tokenId, actionId);
                break;
            case 'strike':
                this._rollStrikeNpc(event, tokenId, actionId);
                break;  
            case 'attribute':
                this._rollAttributeNpc(event, tokenId, actionId);
                break;
        }
    }

    /** @private */
    _rollAbility(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        actor.rollAbility(event, actionId);
    }

    /** @private */
    _rollAttributeChar(event, tokenId, actionId) {
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
    _rollSaveChar(event, tokenId, actionId) {
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
    _rollStrikeChar(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeName = actionParts[0];
        let strikeType = actionParts[1];

        let strike = actor.data.data.actions.filter(a => a.type === 'strike').find(s => s.name === strikeName);

        let options;
        switch (strikeType) {
            case 'damage':
                options = actor.getRollOptions(['all', 'damage-roll']);
                strike.damage(event, options);
                break;
            case 'critical':
                options = actor.getRollOptions(['all', 'damage-roll']);
                strike.critical(event, options);
                break;
            default:
                options = actor.getRollOptions(['all', 'attack-roll']);
                strike.variants[strikeType]?.roll(event, options);
                break;
        }
    }

    /** @private */
    _rollStrikeNpc(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);

        let actionParts = decodeURIComponent(actionId).split('>');

        let strikeId = actionParts[0];
        let strikeType = actionParts[1];

        if (strikeId === 'plus') {
            let item = actor.items.find(i => strikeType.toUpperCase().localeCompare(i.name.toUpperCase(), undefined, {sensitivity: 'base'}) === 0);
            item.roll();
            return;
        }

        let strike = actor.getOwnedItem(strikeId);

        switch (strikeType) {
            case 'damage':
                strike.rollNPCDamage(event);
                break;
            case 'critical':
                strike.rollNPCDamage(event, true);
                break;
            case '0':
                strike.rollNPCAttack(event);
                break;
            case '1':            
                strike.rollNPCAttack(event, 2);
                break;
            case '2':
                strike.rollNPCAttack(event, 3);
                break;
        }
    }

    /** @private */
    _rollItem(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let item = actor.items.find(i => i._id === actionId);

        item.roll();
    }

    /** @private */
    _rollSpell(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let spell = actor.items.find(i => i._id === actionId);

        if (settings.get('printSpellCard')) {
            spell.roll(); 
            return;
        }

        let damageRoll = event.originalEvent.button === 2;

        if (damageRoll) {
            if (spell.data.data.damage.value)
                spell.rollSpellDamage(event);
            else if (spell.data.data.spellType.value === 'attack') {
                spell.rollSpellAttack(event);
            } else {
                spell.roll();
            }
        } else {
            if (spell.data.data.spellType.value === 'attack') {
                spell.rollSpellAttack(event);
            } else if (spell.data.data.damage.value) {
                spell.rollSpellDamage(event);
            } else {
                spell.roll();
            }
        }
    }
}
