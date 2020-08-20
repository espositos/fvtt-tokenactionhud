import { RollHandler } from "../rollHandler.js"
import * as settings from "../../settings.js";

export class RollHandlerBase5e extends RollHandler {
    constructor() {
        super();
    }

    /** @override */
    doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        if (tokenId === 'multi') {
            if (macroType === 'utility' && actionId.includes('toggle')) {
                this.performMultiToggleUtilityMacro(actionId);
            }
            else {
                canvas.tokens.controlled.forEach(t => {
                    let idToken = t.data._id;
                    this._handleMacros(event, macroType, idToken, actionId);
                });
            }
        } else {
            this._handleMacros(event, macroType, tokenId, actionId);
        }
    }

    _handleMacros(event, macroType, tokenId, actionId) {
        switch (macroType) {
            case "ability":
                this.rollAbilityMacro(event, tokenId, actionId);
                break;
            case "skill":
                this.rollSkillMacro(event, tokenId, actionId);
                break;
            case "abilitySave":
                this.rollAbilitySaveMacro(event, tokenId, actionId);
                break;
            case "abilityCheck":
                this.rollAbilityCheckMacro(event, tokenId, actionId);
                break;
            case "item":
            case "spell":
            case "feat": 
                if (this.isRenderItem())
                    this.doRenderItem(tokenId, actionId);
                else
                    this.rollItemMacro(event, tokenId, actionId);
                break;
            case "utility":
                this.performUtilityMacro(event, tokenId, actionId);
            default:
                break;
        }
    }
    
    rollAbilityMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
       actor.rollAbility(...this.getRollBody(event, actor, checkId));
    }
    
    rollAbilityCheckMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAbilityTest(...this.getRollBody(event, actor, checkId));
    }

    rollAbilitySaveMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollAbilitySave(...this.getRollBody(event, actor, checkId));
    }
    
    rollSkillMacro(event, tokenId, checkId) {
        const actor = super.getActor(tokenId);
        actor.rollSkill(...this.getRollBody(event, actor, checkId));
    }

    getRollBody(event, actor, checkId) {
        const speaker = ChatMessage.getSpeaker({scene: canvas.scene, token: actor.token});
        return [checkId, {speaker: speaker, event, event}];
    }
    
    rollItemMacro(event, tokenId, itemId) {
        let actor = super.getActor(tokenId);
        let item = super.getItem(actor, itemId);

        if (this.needsRecharge(item)) {
            item.rollRecharge();
            return;
        }
        
        if (item.data.type === "spell")
            return actor.useSpell(item);
            
        return item.roll();
    }

    needsRecharge(item) {
        return (item.data.data.recharge && !item.data.data.recharge.charged && item.data.data.recharge.value);
    }
    
    performUtilityMacro(event, tokenId, actionId) {
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
                actor.update({"data.attributes.inspiration": update});
                break;
            case 'toggleCombat':
                token.toggleCombat();
                Hooks.callAll('forceUpdateTokenActionHUD')
                break;
            case 'toggleVisibility':
                token.toggleVisibility();
                break;
            case 'deathSave':
                actor.rollDeathSave();
                break;
        }
    }

    async performMultiToggleUtilityMacro(actionId) {
        if (actionId === 'toggleVisibility') {
            const allVisible = canvas.tokens.controlled.every(t => !t.data.hidden);
            canvas.tokens.controlled.forEach(t => {
                if (allVisible)
                    t.toggleVisibility();
                else if (t.data.hidden)
                    t.toggleVisibility();
            })
        }

        if (actionId === 'toggleCombat') {
            const allInCombat = canvas.tokens.controlled.every(t => t.data.inCombat);
            for (let t of canvas.tokens.controlled) {
                if (allInCombat)
                    await t.toggleCombat();
                else if (!t.data.inCombat)
                    await t.toggleCombat();
            }
            Hooks.callAll('forceUpdateTokenActionHUD')
        }
    }
}