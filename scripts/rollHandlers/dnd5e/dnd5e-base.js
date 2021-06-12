import { RollHandler } from '../rollHandler.js'
import * as settings from '../../settings.js';

export class RollHandlerBase5e extends RollHandler {
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

        if (tokenId === 'multi') {
            for (let t of canvas.tokens.controlled) {
                let idToken = t.id;
                await this._handleMacros(event, macroType, idToken, actionId);
            };
        } else {
            await this._handleMacros(event, macroType, tokenId, actionId);
        }
    }

    async _handleMacros(event, macroType, tokenId, actionId) {
        switch (macroType) {
            case 'ability':
                this.rollAbilityMacro(event, tokenId, actionId);
                break;
            case 'skill':
                this.rollSkillMacro(event, tokenId, actionId);
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
                if (this.isRenderItem())
                    this.doRenderItem(tokenId, actionId);
                else
                    this.rollItemMacro(event, tokenId, actionId);
                break;
            case 'utility':
                await this.performUtilityMacro(event, tokenId, actionId);
                break;
            case 'effect':
                await this.toggleEffect(event, tokenId, actionId);
                break;
            case 'condition':
                await this.toggleCondition(event, tokenId, actionId);
            default:
                break;
        }
    }
    
    rollAbilityMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
       actor.rollAbility(checkId, {event: event});
    }
    
    rollAbilityCheckMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAbilityTest(checkId, {event: event});
    }

    rollAbilitySaveMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAbilitySave(checkId, {event: event});
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollSkill(checkId, {event: event});
    }

    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = super.getItem(actor, itemId);

        if (this.needsRecharge(item)) {
            item.rollRecharge();
            return;
        }
        
        if (item.data.type === 'spell')
            return actor.useSpell(item);
            
        return item.roll({event});
    }

    needsRecharge(item) {
        const itemData = this._getEntityData(item);
        return (itemData.recharge && !itemData.recharge.charged && itemData.recharge.value);
    }
    
    async performUtilityMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let token = super.getToken(tokenId);

        switch(actionId) {
            case 'shortRest':
                actor.shortRest();
                break;
            case 'longRest':
                actor.longRest();
                break;
            case 'inspiration':
                let update = !actor.data.data.attributes.inspiration;
                actor.update({'data.attributes.inspiration': update});
                break;
            case 'toggleCombat':
                token.toggleCombat();
                Hooks.callAll('forceUpdateTokenActionHUD')
                break;
            case 'toggleVisibility':
                token.toggleVisibility();
                break;
            case 'deathSave':
                actor.rollDeathSave({event});
                break;
            case 'initiative':
                await this.performInitiativeMacro(tokenId);
                break;
        }
    }

    async performInitiativeMacro(tokenId) {
        let actor = super.getActor(tokenId);
        
        await actor.rollInitiative({createCombatants: true});
            
        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    async toggleEffect(event, tokenId, effectId) {
        const actor = super.getActor(tokenId);
        const effects = 'find' in actor.effects.entries ? actor.effects.entries : actor.effects;
        const effect = effects.find(e => e.id === effectId);

        if (!effect)
            return;

        const statusId = effect.data.flags.core?.statusId;
        if (statusId) {
            await this.toggleCondition(event, tokenId, statusId);
            return;
        }
            
        await effect.update({disabled: !effect.data.disabled});
        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    async toggleCondition(event, tokenId, effectId) {
        const token = super.getToken(tokenId);
        const isRightClick = this.isRightClick(event);
        if (effectId.includes('combat-utility-belt.') && game.cub && !isRightClick) {
            const cubCondition = this.findCondition(effectId)?.label;            
            if (!cubCondition)
                return;
            
            game.cub.hasCondition(cubCondition, token) ? 
                await game.cub.removeCondition(cubCondition, token) : await game.cub.addCondition(cubCondition, token);
        } else {
            const condition = this.findCondition(effectId);
            if (!condition)
                return;
            
            isRightClick ? 
                await token.toggleOverlay(condition) : await token.toggleEffect(condition);
        }

        Hooks.callAll('forceUpdateTokenActionHUD')
    }

    findCondition(id) {
        return CONFIG.statusEffects.find(effect => effect.id === id);
    }


    _getEntityData(entity) {
        return entity.data.data ?? entity.data;
    }

}
