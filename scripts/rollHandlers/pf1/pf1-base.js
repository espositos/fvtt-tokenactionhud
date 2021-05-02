import { RollHandler } from '../rollHandler.js'
import * as settings from '../../settings.js';

export class RollHandlerBasePf1 extends RollHandler {
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
            canvas.tokens.controlled.forEach(t => {
                let idToken = t.data._id;
                this._handleMacros(event, macroType, idToken, actionId);
            });
        } else {
            await this._handleMacros(event, macroType, tokenId, actionId);
        }
    }

    async _handleMacros(event, macroType, tokenId, actionId) {
        switch (macroType) {
            case 'ability':
                this.rollAbilityMacro(event, tokenId, actionId);
                break;
            case 'concentration':
                this.rollConcentrationMacro(event, tokenId, actionId);
                break;
            case 'cmb':
                this.rollCmbMacro(event, tokenId, actionId);
                break;
            case 'melee':
                this.rollMeleeAttackMacro(event, tokenId, actionId);
                break;
            case 'ranged':
                this.rollRangedAttackMacro(event, tokenId, actionId);
                break;
            case 'bab':
                this.rollBAB(event, tokenId, actionId);
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
            case 'buff':
                await this.adjustBuff(event, tokenId, actionId);
                break;
            case 'condition':
                await this.adjustCondition(event, tokenId, actionId);
                break;
            case 'item':
            case 'spell':
            case 'feat':
            case 'attack':
                if (this.isRenderItem())
                    this.doRenderItem(tokenId, actionId);
                else
                    this.rollItemMacro(event, tokenId, actionId);
                break;
            case 'defenses':
                    this.rollDefenses(event, tokenId, actionId);
                    break;
            case 'utility':
                await this.performUtilityMacro(event, tokenId, actionId);
                break;
            default:
                break;
        }
    }

    rollCmbMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollCMB(event);
    }

    rollMeleeAttackMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAttack({ event: event, melee: true });
    }

    rollRangedAttackMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAttack({ event: event, melee: false });
    }

    rollBAB(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollBAB({ event: event });
    }

    rollConcentrationMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollConcentration(checkId);
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
        actor.rollSavingThrow(checkId, {event: event});
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollSkill(checkId, {event: event});
    }
    
    rollItemMacro(event, tokenId, itemId) {
        const actor = super.getActor(tokenId);
        const item = super.getItem(actor, itemId);

        item.use({ev: event, skipDialog: false});
    }

    rollDefenses(event, tokenId, itemId) {
        const actor = super.getActor(tokenId);
        actor.rollDefenses();
    }

    async adjustBuff(event, tokenId, buffId) {
        let actor = super.getActor(tokenId);
        let buff = super.getItem(actor, buffId);

        let update = {data: {active: !buff.data.data.active}};

        await buff.update(update);
    }

    async adjustCondition(event, tokenId, conditionKey) {
        let actor = super.getActor(tokenId);

        const value = actor.data.data.attributes.conditions[conditionKey];

        let update = {data: {attributes: {conditions: {}}}}
        update.data.attributes.conditions[conditionKey] = !value;

        await actor.update(update);
    }
    
    async performUtilityMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let token = super.getToken(tokenId);

        switch(actionId) {
            case 'rest':
                actor.sheet._onRest(event);
                break;
            case 'toggleCombat':
                token.toggleCombat();
                Hooks.callAll('forceUpdateTokenActionHUD')
                break;
            case 'toggleVisibility':
                token.toggleVisibility();
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
}