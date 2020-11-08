import { RollHandler } from '../rollHandler.js';
import * as settings from '../../settings.js';

export class RollHandlerBaseWfrp4e extends RollHandler {
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
        let bypassData = {bypass: !!event.shiftKey};

        if (macroType === 'characteristic')
            return actor.setupCharacteristic(actionId, bypassData)
                    .then(setupData => actor.basicTest(setupData));

        if (this.isRenderItem())
            return this.doRenderItem(tokenId, actionId);

        let item = actor.getOwnedItem(actionId);
        let itemData = duplicate(item.data);
        
        if (this.rightClick)
            return item.postItem();

        switch (macroType) {
            case 'weapon':
                return actor.setupWeapon(itemData, bypassData)
                    .then(setupData => actor.weaponTest(setupData));
            case 'spell':
                return this.castSpell(actor, itemData, bypassData);
            case 'prayer':
                return actor.setupPrayer(itemData, bypassData)
                    .then(setupData => actor.prayerTest(setupData));
            case 'trait':
            case 'talent':
                if (itemData.data.rollable?.value)
                    return actor.setupTrait(itemData, bypassData)
                        .then(setupData => actor.traitTest(setupData));
                else 
                    return item.postItem();
            case 'skill':
                return actor.setupSkill(itemData, bypassData)
                    .then(setupData => actor.basicTest(setupData));
        }
    }

    castSpell(actor, itemData, bypassData) {
        if (actor.spellDialog)
            return actor.spellDialog(itemData, bypassData);
        else
            return actor.sheet.spellDialog(itemData, bypassData);
    }
}
