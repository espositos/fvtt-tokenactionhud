import { RollHandler } from '../rollHandler.js'
import * as settings from '../../settings.js';

export class RollHandlerBaseD35E extends RollHandler {
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
                this.performUtilityMacro(event, tokenId, actionId);
            default:
                break;
        }
    }

    rollCmbMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollCMB(event);
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

        let update = {'data.active': !buff.data.data.active};

        await buff.update(update);
    }
    
    performUtilityMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let token = super.getToken(tokenId);

        switch(actionId) {
            case 'rest':
                actor.sheet._onRest(event);
                break;
        }
    }
}