import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseDemonlord extends RollHandler {
    constructor() {
        super();
    }

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
            this._handleMacros(event, macroType, tokenId, actionId);
        }
    }

    _handleMacros(event, macroType, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let item = null
        if (['weapon', 'specialaction', 'spell', 'talent'].includes(macroType)) {
            item = actor.getOwnedItem(actionId);
        }

        switch (macroType) {
            case 'challenge':
                actor.rollChallenge(actionId);
                break;
            case 'weapon':
                actor.rollWeaponAttack(item._id, null);
                break;
            case 'talent':
            case 'specialaction':
                actor.rollTalent(item._id, null);
                break;
            case 'spell':
                actor.rollSpell(item._id, null);
                break;
            case "utility":
                this.performUtilityMacro(event, tokenId, actionId);
            default:
                break;
        }
    }

    performUtilityMacro(event, tokenId, actionId) {
        let actor = super.getActor(tokenId);
        let token = super.getToken(tokenId);

        switch (actionId) {
            case 'rest':
                actor.restActor(token);
                break;
            case 'toggleVisibility':
                token.toggleVisibility();
                break;
            case 'toggleCombat':
                token.toggleCombat();
                Hooks.callAll('forceUpdateTokenActionHUD')
                break;
        }
    }
}
