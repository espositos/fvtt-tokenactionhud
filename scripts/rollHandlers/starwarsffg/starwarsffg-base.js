import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseStarWarsFFG extends RollHandler {
    constructor() {
        super();
    }
    
    doHandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        if (payload.length != 3) {
            super.throwInvalidValueErr();
        }
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let actionId = payload[2];

        let actor = super.getActor(tokenId);

        switch (macroType) {
            case 'weapon':
                return game.ffg.DiceHelpers.rollItem(actionId, actor.id);
            case 'skill':
                return this._rollSkill(actor, actionId, event);
        }
    }

    _rollSkill(actor, skillname, event) {
        let difficulty = 2;
        if (event.ctrlKey && !event.shiftKey) {
            difficulty = 3;
        } else if (!event.ctrlKey && event.shiftKey) {
            difficulty = 1;
        }
        const actorSheet = actor.sheet.getData();
        const skill = actor.data.data.skills[skillname];
        const characteristic = actorSheet.data.characteristics[skill.characteristic];
        game.ffg.DiceHelpers.rollSkillDirect(skill, characteristic, difficulty, actorSheet);
    }
}
