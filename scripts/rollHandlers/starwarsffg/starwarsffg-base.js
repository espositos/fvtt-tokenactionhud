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
                return actor.setupWeapon(itemData, bypassData)
                    .then(setupData => actor.weaponTest(setupData));
            case 'skill':
                this._rollSkill(actor, actionId);
        }
    }

    _rollSkill(actor, skillname) {
        const actorSheet = actor.sheet.getData();
        const skill = actor.data.data.skills[skillname];
        const characteristic = actorSheet.data.characteristics[skill.characteristic];
        game.ffg.DiceHelpers.rollSkillDirect(skill, characteristic, 2, actorSheet);
    }
}
