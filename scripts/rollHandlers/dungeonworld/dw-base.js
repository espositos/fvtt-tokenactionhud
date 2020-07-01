import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseDw extends RollHandler {
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

        switch (macroType) {
            case 'move':
            case 'spell':
            case 'equipment':
                this._handleMove(macroType, event, tokenId, actionId);
                break;
            case 'ability':
                this._handleAbility(macroType, event, tokenId, actionId);
                break;
        }
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
            title: `${ability.label} Roll`,
            flavor: 'Made a move using strength!',
        };
        canvas.tokens.controlled[0].actor.rollMove(formula, actor, {}, templateData);
    }
}