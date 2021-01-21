import { RollHandler } from '../rollHandler.js'
import * as settings from '../../settings.js';

export class RollHandlerBaseSfrpg extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    async doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        switch (macroType) {
            case 'ability':
                this.rollAbilityMacro(event, tokenId, actionId);
                break;
            case 'skill':
                this.rollSkillMacro(event, tokenId, actionId);
                break;
            case 'save':
                this.rollSaveMacro(event, tokenId, actionId);
                break;
            case 'abilitySave':
                this.rollAbilitySaveMacro(event, tokenId, actionId);
                break;
            case 'abilityCheck':
                this.rollAbilityCheckMacro(event, tokenId, actionId);
                break;
            case 'item':
            case 'spell':
            case 'feat': 
            case 'starshipWeapon':
                if (this.isRenderItem())
                    this.doRenderItem(tokenId, actionId);
                else
                    this.rollItemMacro(event, tokenId, actionId);
                break;
            case 'shields':
                this._handleShields(event, tokenId, actionId);
                break;
            case 'crewAction':
                this._handleCrewAction(event, tokenId, actionId);
            default:
                break;
        }
    }
    
    rollAbilityMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollAbility(checkId, {event: event});
    }
    
    rollAbilityCheckMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollAbilityTest(checkId, {event: event});
    }

    rollAbilitySaveMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollAbilitySave(checkId, {event: event});
    }
    
    rollSaveMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollSave(checkId, {event: event});
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        super.getActor(tokenId).rollSkill(checkId, {event: event});
    }
    
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = actor.getOwnedItem(itemId);

        if (this.needsRecharge(item)) {
            item.rollRecharge();
            return;
        }
        
        if (item.data.type === 'spell')
            return actor.useSpell(item);
            
        return item.roll();
    }

    needsRecharge(item) {
        return (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value);
    }

    async _handleShields(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        let payload = actionId.split('.');

        const side = payload[0];
        let shieldChange = parseInt(payload[1]);
        if (shieldChange === NaN)
            return;

        const shields = actor.data.data.attributes.shields;
        const shield = actor.data.data.quadrants[side]['shields'];

        let newValue;
        if (shieldChange < 0) {
            newValue = Math.clamped(shield.value + shieldChange, 0, shields.max);
        } else {
            newValue = this._calcPossibleIncrease(shields, shield, shieldChange);
        }

        if (newValue === shield.value)
            return;

        const update = {data: {quadrants: {}}};
        update.data.quadrants[side] = {shields: {value: newValue}};

        await actor.update(update);
    }
    
    _calcPossibleIncrease(shields, shield, change) {
        const overallPossible = shields.max - shields.value >= 0 ? shields.max - shields.value : 0;
        const localPossible = shields.limit - shield.value >= 0 ? shields.limit - shield.value : 0;

        let possibleChange = change;

        if (change > overallPossible)
            possibleChange = overallPossible;

        if (change > localPossible)
            possibleChange = localPossible;

        return shield.value + possibleChange;
    }

    _handleCrewAction(event, tokenId, actionId) {
        const actor = super.getActor(tokenId);
        actor.useStarshipAction(actionId);
    }
}