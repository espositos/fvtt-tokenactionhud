import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseDemonlord extends RollHandler {
    constructor() {
        super();
    }

    async doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        if (payload.length != 4) {
            super.throwInvalidValueErr();
        }

        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];
        let attributename = payload[3];

        if (tokenId === 'multi') {
            canvas.tokens.controlled.forEach(t => {
                let idToken = t.data._id;
                this._handleMacros(event, macroType, idToken, actionId, attributename);
            });
        } else {
            this._handleMacros(event, macroType, tokenId, actionId, attributename);
        }
    }

    _handleMacros(event, macroType, tokenId, actionId, attributename) {
        let actor = super.getActor(tokenId);
        let item = actionId ? actor.getOwnedItem(actionId) : null;

        switch (macroType) {
            case 'challenge':
                actor.rollChallenge(attributename);
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
